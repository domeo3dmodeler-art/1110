const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function fixPathsCorrectly(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    const relativePath = path.relative(__dirname, filePath);
    
    // ПРАВИЛЬНЫЕ пути для Docker контейнера:
    // app/app/* -> ../../../components/ (3 уровня вверх)
    // app/components/* -> ../components/ (1 уровень вверх)
    
    if (relativePath.startsWith('app/app/')) {
        // Для файлов в app/app/* - нужно 3 уровня вверх
        const replacements = [
            { pattern: /from\s+['"]\.\.\/\.\.\/components\//g, replacement: "from '../../../components/" },
            { pattern: /from\s+['"]\.\.\/\.\.\/hooks\//g, replacement: "from '../../../hooks/" },
            { pattern: /from\s+['"]\.\.\/\.\.\/lib\//g, replacement: "from '../../../lib/" },
        ];
        
        for (const { pattern, replacement } of replacements) {
            if (content.match(pattern)) {
                content = content.replace(pattern, replacement);
                changed = true;
            }
        }
    } else if (relativePath.startsWith('app/components/')) {
        // Для файлов в app/components/* - нужно 1 уровень вверх
        const replacements = [
            { pattern: /from\s+['"]\.\.\/\.\.\/components\//g, replacement: "from '../components/" },
            { pattern: /from\s+['"]\.\.\/\.\.\/hooks\//g, replacement: "from '../hooks/" },
            { pattern: /from\s+['"]\.\.\/\.\.\/lib\//g, replacement: "from '../lib/" },
        ];
        
        for (const { pattern, replacement } of replacements) {
            if (content.match(pattern)) {
                content = content.replace(pattern, replacement);
                changed = true;
            }
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
            if (fixPathsCorrectly(fullPath)) {
                filesFixed++;
            }
        }
    }
    
    return filesFixed;
}

console.log('🔧 Исправляем пути ПРАВИЛЬНО...\n');
const totalFixed = traverseAndFix(appDir);
console.log(`\n✅ Исправлено ${totalFixed} файлов`);


