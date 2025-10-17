const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function fixTripleDotsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    const relativePath = path.relative(__dirname, filePath);
    
    // Заменяем ../../../ на ../../ для файлов в app/app/*
    if (relativePath.startsWith('app/app/')) {
        const replacements = [
            // Импорты компонентов
            { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\//g, replacement: "from '../../components/" },
            { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/hooks\//g, replacement: "from '../../hooks/" },
            { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/lib\//g, replacement: "from '../../lib/" },
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
            if (fixTripleDotsInFile(fullPath)) {
                filesFixed++;
            }
        }
    }
    
    return filesFixed;
}

console.log('🔧 Исправляем тройные точки в импортах...\n');
const totalFixed = traverseAndFix(appDir);
console.log(`\n✅ Исправлено ${totalFixed} файлов`);


