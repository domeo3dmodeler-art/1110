const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

// Список всех файлов, которые нужно исправить
const filesToFix = [
    'app/app/admin/cart-demo/page.tsx',
    'app/app/admin/catalog/frontend-categories/page.tsx',
    'app/app/admin/catalog/import/page.tsx',
    'app/app/admin/catalog/import/page_fixed.tsx',
    'app/app/admin/catalog/import-simplified/page.tsx',
    'app/app/admin/catalog/layout.tsx',
    'app/app/admin/catalog/page.tsx',
    'app/app/admin/catalog/products/page.tsx',
    'app/app/admin/catalog/properties/page.tsx',
    'app/app/admin/catalog/tree-import/layout.tsx',
    'app/app/admin/catalog/tree-import/page.tsx',
    'app/app/admin/categories/builder/page.tsx',
    'app/app/admin/categories/page.tsx',
    'app/app/admin/categories/[id]/configurator/page.tsx',
    'app/app/admin/configurator/create/page.tsx',
    'app/app/admin/configurator/export/page.tsx',
    'app/app/admin/configurator/import/page.tsx',
    'app/app/admin/configurator/layout.tsx',
    'app/app/admin/configurator/page.tsx',
    'app/app/admin/debug/page.tsx',
    'app/app/admin/products/page.tsx',
    'app/app/admin/settings/page.tsx',
    'app/app/admin/users/new/page.tsx',
    'app/app/admin/users/page.tsx',
    'app/app/analytics/page.tsx',
    'app/app/clients/page.tsx',
    'app/app/complectator/dashboard/page.tsx',
    'app/app/configurator/[slug]/page.tsx',
    'app/app/dashboard/page.tsx',
    'app/app/doors/page.tsx',
    'app/app/executor/dashboard/page.tsx',
    'app/app/modern-design-demo/page.tsx',
    'app/app/orders/page.tsx',
    'app/app/page.tsx',
    'app/app/preview/page.tsx',
    'app/app/professional-builder/page.tsx',
    'app/app/quotes/page.tsx',
    'app/app/universal/[categoryId]/page.tsx',
];

function fixFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ Файл не найден: ${filePath}`);
        return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // Заменяем ../../../components/ на ../../../../components/
    const replacements = [
        { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\//g, replacement: "from '../../../../components/" },
        { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/hooks\//g, replacement: "from '../../../../hooks/" },
        { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/lib\//g, replacement: "from '../../../../lib/" },
    ];
    
    for (const { pattern, replacement } of replacements) {
        if (content.match(pattern)) {
            content = content.replace(pattern, replacement);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Исправлен: ${filePath}`);
        return true;
    } else {
        console.log(`⚠️  Не изменен: ${filePath}`);
        return false;
    }
}

console.log('🔧 Исправляем все пути на 4 уровня вверх...\n');
let totalFixed = 0;

for (const filePath of filesToFix) {
    if (fixFile(filePath)) {
        totalFixed++;
    }
}

console.log(`\n✅ Исправлено ${totalFixed} файлов из ${filesToFix.length}`);


