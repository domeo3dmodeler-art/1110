const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

// Карта всех файлов в проекте
const fileMap = new Map();
const importMap = new Map();
const errors = [];

function collectFiles(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            collectFiles(fullPath, path.join(relativePath, file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const relativeFilePath = path.join(relativePath, file);
            fileMap.set(relativeFilePath, fullPath);
        }
    }
}

function analyzeImports() {
    console.log('🔍 Анализируем импорты...\n');
    
    // Собираем все файлы
    collectFiles(appDir);
    console.log(`📁 Найдено ${fileMap.size} файлов\n`);
    
    // Анализируем каждый файл
    for (const [relativePath, fullPath] of fileMap) {
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const imports = extractImports(content);
            
            if (imports.length > 0) {
                importMap.set(relativePath, imports);
                
                // Проверяем каждый импорт
                for (const importPath of imports) {
                    if (!isValidImport(importPath, relativePath)) {
                        errors.push({
                            file: relativePath,
                            import: importPath,
                            issue: getImportIssue(importPath, relativePath)
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Ошибка чтения файла ${relativePath}:`, error.message);
        }
    }
    
    // Выводим результаты
    console.log('📊 РЕЗУЛЬТАТЫ АНАЛИЗА:\n');
    
    if (errors.length === 0) {
        console.log('✅ Все импорты корректны!');
    } else {
        console.log(`❌ Найдено ${errors.length} проблемных импортов:\n`);
        
        // Группируем ошибки по типам
        const groupedErrors = groupErrors(errors);
        
        for (const [type, typeErrors] of groupedErrors) {
            console.log(`🔸 ${type} (${typeErrors.length}):`);
            typeErrors.forEach(error => {
                console.log(`   ${error.file} -> ${error.import}`);
            });
            console.log('');
        }
    }
    
    return errors;
}

function extractImports(content) {
    const imports = [];
    
    // Регулярные выражения для разных типов импортов
    const patterns = [
        /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
        /import\s+['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            imports.push(match[1]);
        }
    }
    
    return imports;
}

function isValidImport(importPath, filePath) {
    // Пропускаем внешние модули
    if (importPath.startsWith('@/') || 
        importPath.startsWith('next/') || 
        importPath.startsWith('react') ||
        importPath.startsWith('lucide-react') ||
        importPath.startsWith('@prisma') ||
        importPath.startsWith('bcryptjs') ||
        importPath.startsWith('jsonwebtoken') ||
        importPath.startsWith('jose') ||
        importPath.startsWith('xlsx') ||
        importPath.startsWith('exceljs') ||
        importPath.startsWith('puppeteer') ||
        importPath.startsWith('handlebars') ||
        importPath.startsWith('winston') ||
        importPath.startsWith('zod') ||
        importPath.startsWith('sharp') ||
        importPath.startsWith('html2canvas') ||
        importPath.startsWith('jspdf') ||
        importPath.startsWith('@aws-sdk') ||
        importPath.startsWith('@sparticuz') ||
        importPath.startsWith('critters') ||
        importPath.startsWith('csv-parse') ||
        importPath.startsWith('dotenv') ||
        importPath.startsWith('next-themes') ||
        importPath.startsWith('react-dnd') ||
        importPath.startsWith('@fontsource') ||
        importPath.startsWith('.')) {
        
        // Проверяем только относительные импорты
        if (importPath.startsWith('.')) {
            return checkRelativeImport(importPath, filePath);
        }
        
        return true; // Внешние модули считаем валидными
    }
    
    return true;
}

function checkRelativeImport(importPath, filePath) {
    try {
        const fileDir = path.dirname(filePath);
        const resolvedPath = path.resolve(fileDir, importPath);
        
        // Проверяем, существует ли файл
        const possiblePaths = [
            resolvedPath,
            resolvedPath + '.tsx',
            resolvedPath + '.ts',
            path.join(resolvedPath, 'index.tsx'),
            path.join(resolvedPath, 'index.ts')
        ];
        
        for (const possiblePath of possiblePaths) {
            const relativePossiblePath = path.relative(appDir, possiblePath);
            if (fileMap.has(relativePossiblePath)) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

function getImportIssue(importPath, filePath) {
    if (!importPath.startsWith('.')) {
        return 'Внешний модуль';
    }
    
    const fileDir = path.dirname(filePath);
    const resolvedPath = path.resolve(fileDir, importPath);
    
    // Проверяем возможные пути
    const possiblePaths = [
        resolvedPath,
        resolvedPath + '.tsx',
        resolvedPath + '.ts',
        path.join(resolvedPath, 'index.tsx'),
        path.join(resolvedPath, 'index.ts')
    ];
    
    for (const possiblePath of possiblePaths) {
        const relativePossiblePath = path.relative(appDir, possiblePath);
        if (fileMap.has(relativePossiblePath)) {
            return 'Файл найден';
        }
    }
    
    return 'Файл не найден';
}

function groupErrors(errors) {
    const groups = new Map();
    
    for (const error of errors) {
        const key = error.issue;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(error);
    }
    
    return groups;
}

// Запускаем анализ
const foundErrors = analyzeImports();

// Сохраняем результаты в файл
const reportPath = path.join(__dirname, 'import-analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
    totalFiles: fileMap.size,
    totalImports: Array.from(importMap.values()).flat().length,
    errors: foundErrors,
    timestamp: new Date().toISOString()
}, null, 2));

console.log(`\n📄 Отчет сохранен в: ${reportPath}`);


