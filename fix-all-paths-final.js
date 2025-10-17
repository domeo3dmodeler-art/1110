const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function fixAllPathsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    const relativePath = path.relative(__dirname, filePath);
    
    // Заменяем все неправильные пути
    const replacements = [
        // Для файлов в app/app/* - заменяем ../../../ на ../../
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\//g, 
            replacement: "from '../../components/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/hooks\//g, 
            replacement: "from '../../hooks/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/lib\//g, 
            replacement: "from '../../lib/" 
        },
        
        // Для файлов в app/components/* - заменяем ../../../ на ../
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\//g, 
            replacement: "from '../components/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/hooks\//g, 
            replacement: "from '../hooks/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/lib\//g, 
            replacement: "from '../lib/" 
        },
        
        // Для файлов в app/app/admin/* - заменяем ../../../../ на ../../
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/components\//g, 
            replacement: "from '../../components/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, 
            replacement: "from '../../hooks/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, 
            replacement: "from '../../lib/" 
        },
        
        // Для файлов в app/app/admin/* - заменяем ../../../../../ на ../../
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components\//g, 
            replacement: "from '../../components/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, 
            replacement: "from '../../hooks/" 
        },
        { 
            pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, 
            replacement: "from '../../lib/" 
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
            if (fixAllPathsInFile(fullPath)) {
                filesFixed++;
            }
        }
    }
    
    return filesFixed;
}

console.log('🔧 Исправляем все неправильные пути...\n');
const totalFixed = traverseAndFix(appDir);
console.log(`\n✅ Исправлено ${totalFixed} файлов`);


