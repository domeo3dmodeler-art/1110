const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    const relativePath = path.relative(__dirname, filePath);
    
    // Определяем правильный путь для Docker контейнера
    let correctPath = '';
    
    if (relativePath.startsWith('app/app/admin/')) {
        // app/app/admin/* -> ../../components/ (2 уровня вверх)
        correctPath = '../../components/';
    } else if (relativePath.startsWith('app/app/')) {
        // app/app/* (не admin) -> ../../components/ (2 уровня вверх)
        correctPath = '../../components/';
    } else if (relativePath.startsWith('app/components/')) {
        // app/components/* -> ../components/ (1 уровень вверх)
        correctPath = '../components/';
    } else if (relativePath.startsWith('app/hooks/')) {
        // app/hooks/* -> ../hooks/ (1 уровень вверх)
        correctPath = '../hooks/';
    } else if (relativePath.startsWith('app/lib/')) {
        // app/lib/* -> ../lib/ (1 уровень вверх)
        correctPath = '../lib/';
    } else {
        return false; // Не знаем как исправить
    }
    
    // Исправляем импорты
    const replacements = [
        // Импорты UI компонентов
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/ui['"]/g, 
            replacement: `from '${correctPath}ui'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/components\/ui['"]/g, 
            replacement: `from '${correctPath}ui'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/components\/ui['"]/g, 
            replacement: `from '${correctPath}ui'` 
        },
        
        // Импорты отдельных UI компонентов
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g, 
            replacement: `from '${correctPath}ui/$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g, 
            replacement: `from '${correctPath}ui/$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/components\/ui\/([^'"]+)['"]/g, 
            replacement: `from '${correctPath}ui/$1'` 
        },
        
        // Импорты других компонентов
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/([^'"]+)['"]/g, 
            replacement: `from '${correctPath}$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g, 
            replacement: `from '${correctPath}$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/components\/([^'"]+)['"]/g, 
            replacement: `from '${correctPath}$1'` 
        },
        
        // Импорты хуков
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, 
            replacement: `from '../hooks/$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, 
            replacement: `from '../hooks/$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/hooks\/([^'"]+)['"]/g, 
            replacement: `from '../hooks/$1'` 
        },
        
        // Импорты lib
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g, 
            replacement: `from '../lib/$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/lib\/([^'"]+)['"]/g, 
            replacement: `from '../lib/$1'` 
        },
        { 
            pattern: /from\s+['"]\.\.\/lib\/([^'"]+)['"]/g, 
            replacement: `from '../lib/$1'` 
        },
    ];
    
    for (const { pattern, replacement } of replacements) {
        if (content.match(pattern)) {
            content = content.replace(pattern, replacement);
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

console.log('🔧 Исправляем импорты для Docker контейнера...\n');
const totalFixed = traverseAndFix(appDir);
console.log(`\n✅ Исправлено ${totalFixed} файлов`);


