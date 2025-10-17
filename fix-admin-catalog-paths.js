const fs = require('fs');
const path = require('path');

// Исправляем пути в файлах app/app/admin/catalog/* с ../../../ на ../../

function fixAdminCatalogPaths() {
  const adminCatalogDir = path.join(__dirname, 'app', 'app', 'admin', 'catalog');
  
  if (!fs.existsSync(adminCatalogDir)) {
    console.log('❌ Папка app/app/admin/catalog не найдена');
    return;
  }
  
  let fixedFiles = 0;
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Заменяем ../../../components/ на ../../components/
        if (content.includes('../../../components/')) {
          content = content.replace(/\.\.\/\.\.\/\.\.\/components\//g, '../../components/');
          modified = true;
        }
        
        // Заменяем ../../../lib/ на ../../lib/
        if (content.includes('../../../lib/')) {
          content = content.replace(/\.\.\/\.\.\/\.\.\/lib\//g, '../../lib/');
          modified = true;
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Исправлен файл: ${filePath}`);
          fixedFiles++;
        }
      }
    }
  }
  
  processDirectory(adminCatalogDir);
  console.log(`\n🎉 Исправлено файлов: ${fixedFiles}`);
}

fixAdminCatalogPaths();
