const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

// Карта правильных путей для Docker контейнера
const pathMappings = {
    // app/app/admin/* -> ../../../components/ui (3 уровня вверх)
    'app/app/admin/': '../../../components/',
    // app/app/* (не admin) -> ../../components/ui (2 уровня вверх)  
    'app/app/': '../../components/',
    // app/components/* -> ../components/ (1 уровень вверх)
    'app/components/': '../components/',
    // app/hooks/* -> ../hooks/ (1 уровень вверх)
    'app/hooks/': '../hooks/',
    // app/lib/* -> ../lib/ (1 уровень вверх)
    'app/lib/': '../lib/',
};

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Определяем базовый путь для этого файла
    const relativePath = path.relative(__dirname, filePath);
    let basePath = '';
    
    // Находим подходящий базовый путь
    for (const [pattern, replacement] of Object.entries(pathMappings)) {
        if (relativePath.startsWith(pattern)) {
            basePath = replacement;
            break;
        }
    }
    
    if (!basePath) {
        return false; // Не знаем как исправить этот файл
    }
    
    // Исправляем импорты
    const importPatterns = [
        // Импорты компонентов UI
        /from\s+['"]\.\.\/\.\.\/components\/ui['"]/g,
        /from\s+['"]\.\.\/\.\.\/\.\.\/components\/ui['"]/g,
        /from\s+['"]\.\.\/components\/ui['"]/g,
        
        // Импорты отдельных компонентов UI
        /from\s+['"]\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/components\/ui\/([^'"]+)['"]/g,
        
        // Импорты других компонентов
        /from\s+['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/\.\.\/\.\.\/components\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/components\/([^'"]+)['"]/g,
        
        // Импорты хуков
        /from\s+['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/\.\.\/\.\.\/hooks\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/hooks\/([^'"]+)['"]/g,
        
        // Импорты lib
        /from\s+['"]\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
        /from\s+['"]\.\.\/lib\/([^'"]+)['"]/g,
    ];
    
    for (const pattern of importPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, (match, component) => {
                if (component) {
                    return `from '${basePath}${component}'`;
                } else {
                    return `from '${basePath}ui'`;
                }
            });
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Исправлен: ${relativePath}`);
        return true;
    }
    
    return false;
}

function traverseAndFix(directory) {
    let filesFixed = 0;
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            filesFixed += traverseAndFix(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            if (fixImportsInFile(fullPath)) {
                filesFixed++;
            }
        }
    }
    
    return filesFixed;
}

console.log('🔧 Исправляем все импорты для Docker контейнера...\n');
const totalFixed = traverseAndFix(appDir);
console.log(`\n✅ Исправлено ${totalFixed} файлов`);


