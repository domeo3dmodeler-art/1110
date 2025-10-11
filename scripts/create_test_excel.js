const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Создаем тестовый Excel файл для проверки упрощенного импорта
function createTestExcel() {
    console.log('📊 СОЗДАНИЕ ТЕСТОВОГО EXCEL ФАЙЛА');
    console.log('==================================');
    console.log('');

    // Заголовки (они же поля шаблона)
    const headers = [
        '№',
        'Domeo_Название модели для Web',
        'Категория',
        'Тип конструкции',
        'Domeo_Стиль Web',
        'Фабрика_Коллекция',
        'Общее_Тип покрытия',
        'Domeo_Цвет',
        'Фабрика_Цвет/Отделка',
        'Ширина/мм',
        'Высота/мм',
        'Ед.изм.',
        'Склад/заказ',
        'Цена ррц (включая цену полотна, короба, наличников, доборов)',
        'Наименование поставщика',
        'Поставщик',
        'Артикул поставщика',
        'Тип открывания',
        'Кромка',
        'Стоимость надбавки за кромку',
        'Молдинг',
        'Стекло',
        'Толщина/мм',
        'Цена опт'
    ];

    // Тестовые данные
    const testData = [
        [
            '1',
            'DomeoDoors_Test_1',
            'Межкомнатные двери',
            'Распашная',
            'Современная',
            'Moderno',
            'ПВХ',
            'Белый',
            'CV Белый',
            '800',
            '2000',
            'шт',
            'Заказное',
            '45000',
            'Дверь Тестовая 1',
            'ВестСтайл',
            'test_door_1',
            'прямое',
            'нет',
            '0',
            'нет',
            'нет',
            '38',
            '30000'
        ],
        [
            '2',
            'DomeoDoors_Test_2',
            'Межкомнатные двери',
            'Распашная',
            'Классическая',
            'Classico',
            'Экошпон',
            'Дуб',
            'CV Дуб',
            '700',
            '2000',
            'шт',
            'Заказное',
            '52000',
            'Дверь Тестовая 2',
            'ВестСтайл',
            'test_door_2',
            'прямое',
            'да',
            '5000',
            'да',
            'нет',
            '40',
            '35000'
        ],
        [
            '3',
            'DomeoDoors_Test_3',
            'Межкомнатные двери',
            'Распашная',
            'Современная',
            'Moderno',
            'ПВХ',
            'Серый',
            'CV Серый',
            '900',
            '2100',
            'шт',
            'Заказное',
            '48000',
            'Дверь Тестовая 3',
            'ВестСтайл',
            'test_door_3',
            'прямое',
            'нет',
            '0',
            'нет',
            'да',
            '38',
            '32000'
        ],
        [
            '4',
            'DomeoDoors_Test_4',
            'Межкомнатные двери',
            'Распашная',
            'Классическая',
            'Classico',
            'Экошпон',
            'Орех',
            'CV Орех',
            '600',
            '2000',
            'шт',
            'Заказное',
            '55000',
            'Дверь Тестовая 4',
            'ВестСтайл',
            'test_door_4',
            'прямое',
            'да',
            '3000',
            'да',
            'да',
            '40',
            '37000'
        ],
        [
            '5',
            'DomeoDoors_Test_5',
            'Межкомнатные двери',
            'Распашная',
            'Современная',
            'Moderno',
            'ПВХ',
            'Черный',
            'CV Черный',
            '800',
            '2000',
            'шт',
            'Заказное',
            '46000',
            'Дверь Тестовая 5',
            'ВестСтайл',
            'test_door_5',
            'прямое',
            'нет',
            '0',
            'нет',
            'нет',
            '38',
            '31000'
        ]
    ];

    // Создаем рабочую книгу
    const workbook = XLSX.utils.book_new();
    
    // Создаем рабочий лист
    const worksheetData = [headers, ...testData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');
    
    // Создаем директорию для тестовых файлов
    const testDir = path.join(__dirname, '..', 'test_files');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Сохраняем файл
    const filename = 'test_doors_import.xlsx';
    const filepath = path.join(testDir, filename);
    XLSX.writeFile(workbook, filepath);
    
    console.log(`✅ Тестовый Excel файл создан: ${filepath}`);
    console.log(`   Заголовков: ${headers.length}`);
    console.log(`   Строк данных: ${testData.length}`);
    console.log('');
    
    // Показываем структуру файла
    console.log('📋 СТРУКТУРА ФАЙЛА:');
    console.log('-------------------');
    console.log('Заголовки:');
    headers.forEach((header, index) => {
        console.log(`   ${index + 1}. "${header}"`);
    });
    
    console.log('');
    console.log('📦 ТЕСТОВЫЕ ДАННЫЕ:');
    console.log('-------------------');
    testData.forEach((row, index) => {
        console.log(`Товар ${index + 1}:`);
        console.log(`   Название: ${row[14]}`);
        console.log(`   SKU: ${row[16]}`);
        console.log(`   Стиль: ${row[4]}`);
        console.log(`   Цвет: ${row[7]}`);
        console.log(`   Размер: ${row[9]}x${row[10]} мм`);
        console.log(`   Цена: ${row[13]} руб.`);
        console.log('');
    });
    
    // Создаем также CSV файл для альтернативного тестирования
    const csvData = [headers, ...testData];
    const csvContent = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const csvFilename = 'test_doors_import.csv';
    const csvFilepath = path.join(testDir, csvFilename);
    fs.writeFileSync(csvFilepath, csvContent, 'utf8');
    
    console.log(`✅ Тестовый CSV файл создан: ${csvFilepath}`);
    console.log('');
    
    return {
        xlsx: filepath,
        csv: csvFilepath,
        headers: headers,
        data: testData
    };
}

// Запускаем создание тестового файла
const result = createTestExcel();

console.log('🎯 ТЕСТОВЫЕ ФАЙЛЫ ГОТОВЫ:');
console.log('==========================');
console.log(`📊 Excel: ${result.xlsx}`);
console.log(`📄 CSV: ${result.csv}`);
console.log('');
console.log('📋 Следующие шаги:');
console.log('1. Протестировать импорт через новый API');
console.log('2. Проверить корректность обработки данных');
console.log('3. Убедиться в правильности сохранения свойств');
console.log('4. Проверить работу калькулятора с новыми данными');
