const fs = require('fs');
const path = require('path');

// Меняем все относительные пути на алиас @/ в файлах app/app/admin/*

function fixAdminPathsToAlias() {
  const adminDir = path.join(__dirname, 'app', 'app', 'admin');
  
  if (!fs.existsSync(adminDir)) {
    console.log('❌ Папка app/app/admin не найдена');
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
        
        // Заменяем ../../components/ на @/components/
        if (content.includes('../../components/')) {
          content = content.replace(/\.\.\/\.\.\/components\//g, '@/components/');
          modified = true;
        }
        
        // Заменяем ../../lib/ на @/lib/
        if (content.includes('../../lib/')) {
          content = content.replace(/\.\.\/\.\.\/lib\//g, '@/lib/');
          modified = true;
        }
        
        // Заменяем ../../../../hooks/ на @/hooks/
        if (content.includes('../../../../hooks/')) {
          content = content.replace(/\.\.\/\.\.\/\.\.\/hooks\//g, '@/hooks/');
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
  
  processDirectory(adminDir);
  console.log(`\n🎉 Исправлено файлов: ${fixedFiles}`);
}

fixAdminPathsToAlias();

