const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPhotos() {
  console.log('🔍 Проверяем фотографии в базе данных...');
  
  const products = await prisma.product.findMany({
    where: {
      catalog_category_id: 'cmg50xcgs001cv7mn0tdyk1wo',
      properties_data: {
        contains: '"photos":'
      }
    },
    select: {
      id: true,
      sku: true,
      name: true,
      properties_data: true
    },
    take: 3
  });

  console.log(`\n📦 Найдено ${products.length} товаров:`);
  
  for (const product of products) {
    console.log(`\n${products.indexOf(product) + 1}. ${product.sku} - ${product.name}`);
    try {
      const properties = JSON.parse(product.properties_data);
      if (properties.photos && Array.isArray(properties.photos)) {
        console.log(`   📸 Фотографий: ${properties.photos.length}`);
        properties.photos.forEach((photoPath, index) => {
          console.log(`      ${index + 1}. ${photoPath}`);
        });
      } else {
        console.log('   📸 Фотографий: 0 (поле "photos" отсутствует или не является массивом)');
      }
    } catch (e) {
      console.error(`   ❌ Ошибка парсинга properties_data для SKU ${product.sku}:`, e);
    }
  }
}

checkPhotos()
  .catch(e => {
    console.error('Ошибка при проверке фотографий:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
