const fs = require('fs');
const path = require('path');

// Функция для рекурсивного поиска файлов
function findFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Найти все .tsx и .ts файлы в app директории
const files = findFiles('./app', '.tsx').concat(findFiles('./app', '.ts'));

console.log(`Найдено ${files.length} файлов для проверки`);

let fixedCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Исправить неправильные пути к components/ui
    const oldPattern = /from ['"](\.\.\/){3,}components\/ui['"]/g;
    const newPattern = (match) => {
      // Подсчитать количество ../ в пути
      const depth = (match.match(/\.\.\//g) || []).length;
      // Создать правильный путь
      const correctDepth = Math.max(1, depth - 1);
      const correctPath = '../'.repeat(correctDepth) + 'components/ui';
      modified = true;
      return match.replace(/from ['"](\.\.\/){3,}components\/ui['"]/, `from "${correctPath}"`);
    };
    
    content = content.replace(oldPattern, newPattern);
    
    // Исправить неправильные пути к components/admin
    const oldAdminPattern = /from ['"](\.\.\/){3,}components\/admin['"]/g;
    const newAdminPattern = (match) => {
      const depth = (match.match(/\.\.\//g) || []).length;
      const correctDepth = Math.max(1, depth - 1);
      const correctPath = '../'.repeat(correctDepth) + 'components/admin';
      modified = true;
      return match.replace(/from ['"](\.\.\/){3,}components\/admin['"]/, `from "${correctPath}"`);
    };
    
    content = content.replace(oldAdminPattern, newAdminPattern);
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Исправлен: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`Ошибка при обработке ${filePath}:`, error.message);
  }
});

console.log(`Исправлено ${fixedCount} файлов`);


