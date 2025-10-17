const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function findAndReplaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Исправляем пути для файлов в app/app/admin/* (3 уровня вверх)
    const replacements = [
        // Для файлов в app/app/admin/* - нужно 3 уровня вверх
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/ui['"]/g, replacement: "from '../../../components/ui'" },
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/cart\//g, replacement: "from '../../../components/cart/" },
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/admin\//g, replacement: "from '../../../components/admin/" },
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/import\//g, replacement: "from '../../../components/import/" },
        
        // Для файлов в app/app/* (не admin) - нужно 2 уровня вверх
        { pattern: /from\s+['"]\.\.\/components\/ui['"]/g, replacement: "from '../../components/ui'" },
        { pattern: /from\s+['"]\.\.\/components\/cart\//g, replacement: "from '../../components/cart/" },
        { pattern: /from\s+['"]\.\.\/components\/admin\//g, replacement: "from '../../components/admin/" },
        { pattern: /from\s+['"]\.\.\/components\/import\//g, replacement: "from '../../components/import/" },
        
        // Исправляем отдельные импорты компонентов
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/ui\/Button['"]/g, replacement: "from '../../../components/ui/Button'" },
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/ui\/Card['"]/g, replacement: "from '../../../components/ui/Card'" },
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/ui\/Badge['"]/g, replacement: "from '../../../components/ui/Badge'" },
        { pattern: /from\s+['"]\.\.\/\.\.\/components\/ui\/Progress['"]/g, replacement: "from '../../../components/ui/Progress'" },
        
        { pattern: /from\s+['"]\.\.\/components\/ui\/Button['"]/g, replacement: "from '../../components/ui/Button'" },
        { pattern: /from\s+['"]\.\.\/components\/ui\/Card['"]/g, replacement: "from '../../components/ui/Card'" },
        { pattern: /from\s+['"]\.\.\/components\/ui\/Badge['"]/g, replacement: "from '../../components/ui/Badge'" },
        { pattern: /from\s+['"]\.\.\/components\/ui\/Progress['"]/g, replacement: "from '../../components/ui/Progress'" },
    ];

    for (const { pattern, replacement } of replacements) {
        if (content.match(pattern)) {
            content = content.replace(pattern, replacement);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Исправлен: ${filePath}`);
        return true;
    }
    return false;
}

function traverseDirectory(directory) {
    let filesChanged = 0;
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            filesChanged += traverseDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            if (findAndReplaceInFile(fullPath)) {
                filesChanged++;
            }
        }
    }
    return filesChanged;
}

console.log('Начинаем глубокое исправление путей...');
const totalChanged = traverseDirectory(appDir);
console.log(`Исправлено ${totalChanged} файлов`);


