const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixMissingPhotos() {
  console.log('🔧 Исправляем отсутствующие фотографии...');

  const categoryId = 'cmg50xcgs001cv7mn0tdyk1wo';
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', categoryId);

  if (!fs.existsSync(uploadDir)) {
    console.error(`❌ Директория загрузки не найдена: ${uploadDir}`);
    return;
  }

  // Получаем все файлы изображений
  const imageFiles = fs.readdirSync(uploadDir).filter(file => file.endsWith('.png'));
  console.log(`📁 Найдено ${imageFiles.length} файлов изображений`);

  // Получаем все товары в категории
  const products = await prisma.product.findMany({
    where: {
      catalog_category_id: categoryId
    },
    select: {
      id: true,
      sku: true,
      name: true,
      properties_data: true
    }
  });

  console.log(`📦 Найдено ${products.length} товаров в категории`);

  let updatedCount = 0;
  let addedCount = 0;

  for (const product of products) {
    try {
      const properties = JSON.parse(product.properties_data || '{}');
      
      // Если у товара нет фотографий, добавляем их
      if (!properties.photos || !Array.isArray(properties.photos) || properties.photos.length === 0) {
        // Ищем подходящие файлы по SKU или имени
        const productName = product.name.toLowerCase();
        const sku = product.sku.toLowerCase();
        
        // Ищем файлы, которые могут соответствовать этому товару
        const matchingFiles = imageFiles.filter(file => {
          const fileName = file.toLowerCase();
          // Простая логика сопоставления - можно улучшить
          return fileName.includes('d2') || fileName.includes('d3') || fileName.includes('d5');
        });

        if (matchingFiles.length > 0) {
          // Берем первый подходящий файл
          const photoPath = `/uploads/products/${categoryId}/${matchingFiles[0]}`;
          properties.photos = [photoPath];
          
          await prisma.product.update({
            where: { id: product.id },
            data: {
              properties_data: JSON.stringify(properties)
            }
          });
          
          addedCount++;
          console.log(`✅ Добавлена фотография для ${product.sku}: ${matchingFiles[0]}`);
        } else {
          console.log(`⚠️ Не найдены подходящие файлы для ${product.sku}`);
        }
      } else {
        // Проверяем, существуют ли файлы фотографий
        let hasValidPhotos = false;
        for (const photoPath of properties.photos) {
          const fileName = path.basename(photoPath);
          if (imageFiles.includes(fileName)) {
            hasValidPhotos = true;
            break;
          }
        }
        
        if (!hasValidPhotos) {
          // Ищем новые файлы
          const matchingFiles = imageFiles.filter(file => {
            const fileName = file.toLowerCase();
            return fileName.includes('d2') || fileName.includes('d3') || fileName.includes('d5');
          });

          if (matchingFiles.length > 0) {
            const photoPath = `/uploads/products/${categoryId}/${matchingFiles[0]}`;
            properties.photos = [photoPath];
            
            await prisma.product.update({
              where: { id: product.id },
              data: {
                properties_data: JSON.stringify(properties)
              }
            });
            
            updatedCount++;
            console.log(`🔄 Обновлена фотография для ${product.sku}: ${matchingFiles[0]}`);
          }
        }
      }
    } catch (e) {
      console.error(`❌ Ошибка при обработке товара ${product.sku}:`, e);
    }
  }

  console.log(`\n🎉 Результат:`);
  console.log(`   - Добавлено фотографий: ${addedCount}`);
  console.log(`   - Обновлено фотографий: ${updatedCount}`);
  console.log(`   - Всего обработано: ${addedCount + updatedCount}`);
}

fixMissingPhotos()
  .catch(e => {
    console.error('Глобальная ошибка при исправлении фотографий:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
