# Анализ проблем базы данных платформы DOMEO

## Обзор проблем

После детального анализа кода и данных выявлены **3 критические проблемы** с базой данных:

1. **Дублирующиеся названия свойств товаров при импорте**
2. **Проблемы с кодировкой русского языка**
3. **Неэффективная архитектура базы данных**

---

## 1. Проблема дублирующихся названий свойств

### Описание проблемы

Система импорта создает множественные варианты названий для одних и тех же свойств товаров, что приводит к:

- **Фрагментации данных** - одно свойство хранится под разными ключами
- **Невозможности корректного поиска** - API не может найти товары по свойствам
- **Дублированию логики** - код пытается обработать все возможные варианты

### Примеры дублирования

Из анализа кода видно множественные варианты названий:

```javascript
// В app/api/admin/import/photos/route.ts (строки 265-275)
const possibleKeys = [
  mappingProperty, // Оригинальный ключ
  'Артикул поставщика',
  'Артикул',
  'SKU',
  'sku',
  'Артикул_поставщика',
  'Артикул поставщика',
  'Supplier SKU',
  'Supplier_sku'
];
```

### Причины возникновения

1. **Отсутствие нормализации** - нет единого стандарта названий свойств
2. **Разные источники данных** - импорт из Excel, CSV, API с разными форматами
3. **Ручной ввод** - пользователи вводят свойства в разных форматах
4. **Отсутствие валидации** - нет проверки на дублирование при импорте

### Влияние на систему

- **API `/api/available-params`** возвращает 404 ошибки
- **Поиск товаров** работает некорректно
- **Фильтрация** не находит товары по свойствам
- **Расчет цен** падает с ошибками

---

## 2. Проблемы с кодировкой русского языка

### Описание проблемы

Русский текст в базе данных отображается как символы `??????`, что делает данные нечитаемыми.

### Примеры проблем

```json
{
  "name": "?????? ????????????????",
  "properties_data": {
    "Domeo_???????????????? ???????????? ?????? Web": "DomeoDoors_Base_1",
    "??????????????????": "??????????????????",
    "?????? ??????????????????????": "??????????????????"
  }
}
```

### Причины возникновения

1. **SQLite без UTF-8** - база данных не настроена на правильную кодировку
2. **Неправильная обработка файлов** - импорт из Excel/CSV с неверной кодировкой
3. **Отсутствие charset в API** - ответы не содержат правильный Content-Type
4. **Проблемы с Prisma** - ORM не обрабатывает кодировку корректно

### Технические детали

- **База данных**: SQLite без явного указания UTF-8
- **API ответы**: отсутствует `charset=utf-8` в Content-Type
- **Импорт файлов**: нет обработки кодировки при чтении Excel/CSV
- **Prisma схема**: не настроена для работы с Unicode

### Влияние на систему

- **Невозможность чтения** названий товаров и свойств
- **Ошибки в API** - поиск не работает с русскими символами
- **Проблемы с фильтрацией** - русские названия не находятся
- **Некорректный расчет цен** - свойства не читаются

---

## 3. Неэффективная архитектура базы данных

### Описание проблемы

Архитектура БД имеет серьезные проблемы с производительностью и масштабируемостью.

### Основные проблемы

#### 3.1 Неэффективное хранение свойств

```sql
-- Текущая структура
properties_data String @default("{}") -- JSON в строке
specifications String @default("{}")  -- Дублирование данных
```

**Проблемы:**
- **Дублирование** - одни и те же данные в разных полях
- **Нет индексации** - поиск по JSON свойствам медленный
- **Парсинг на каждом запросе** - JSON парсится при каждом обращении
- **Нет валидации** - структура JSON не контролируется

#### 3.2 Отсутствие индексов

```sql
-- Отсутствуют индексы для:
- properties_data (JSON поиск)
- specifications (JSON поиск)  
- catalog_category_id + is_active (составной индекс)
- created_at, updated_at (для сортировки)
```

#### 3.3 Неэффективные запросы

```typescript
// Пример неэффективного запроса из app/api/catalog/doors/complete-data/route.ts
const products = await prisma.product.findMany({
  where: {
    catalog_category: {
      name: "Межкомнатные двери"
    },
    is_active: true
  },
  select: {
    properties_data: true // Загружаем все товары в память
  },
  take: 5000 // Ограничение в коде, не в БД
});
```

**Проблемы:**
- **Загрузка всех товаров** в память для фильтрации
- **Фильтрация в коде** вместо SQL WHERE
- **Отсутствие пагинации** на уровне БД
- **Нет кэширования** результатов

#### 3.4 Проблемы с кэшированием

```typescript
// Текущее кэширование в памяти
const completeDataCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 час
```

**Проблемы:**
- **Кэш в памяти** - теряется при перезапуске
- **Нет инвалидации** - кэш не обновляется при изменениях
- **Отсутствие Redis** - нет распределенного кэширования
- **Нет метрик** - невозможно отследить эффективность

### Влияние на производительность

- **Медленные запросы** - 3-4 секунды на получение товаров
- **Высокое потребление памяти** - загрузка всех товаров в RAM
- **Блокирующие операции** - импорт товаров блокирует систему
- **Отсутствие масштабируемости** - система не готова к росту

---

## Рекомендации по решению

### 1. Решение проблемы дублирования свойств

#### 1.1 Создание справочника свойств

```sql
-- Новая таблица для нормализации свойств
CREATE TABLE property_definitions (
  id VARCHAR(50) PRIMARY KEY,
  canonical_name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  data_type VARCHAR(20) NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица маппинга алиасов
CREATE TABLE property_aliases (
  id VARCHAR(50) PRIMARY KEY,
  property_id VARCHAR(50) REFERENCES property_definitions(id),
  alias_name VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'excel', 'csv', 'api', 'manual'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 Нормализация при импорте

```typescript
// Новая функция нормализации
async function normalizePropertyName(rawName: string, source: string): Promise<string> {
  // Поиск в алиасах
  const alias = await prisma.propertyAlias.findFirst({
    where: {
      alias_name: { contains: rawName, mode: 'insensitive' },
      source: source
    },
    include: { property_definition: true }
  });
  
  return alias?.property_definition.canonical_name || rawName;
}
```

#### 1.3 Валидация при импорте

```typescript
// Проверка на дублирование
async function validateImportData(products: any[]): Promise<ValidationResult> {
  const errors = [];
  const propertyNames = new Set();
  
  for (const product of products) {
    for (const [key, value] of Object.entries(product.properties_data)) {
      const normalizedKey = await normalizePropertyName(key, 'import');
      
      if (propertyNames.has(normalizedKey)) {
        errors.push(`Дублирующееся свойство: ${key} -> ${normalizedKey}`);
      }
      
      propertyNames.add(normalizedKey);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### 2. Решение проблем с кодировкой

#### 2.1 Настройка SQLite

```sql
-- Создание базы с правильной кодировкой
PRAGMA encoding = "UTF-8";
PRAGMA foreign_keys = ON;
```

#### 2.2 Обновление Prisma схемы

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./database/dev.db"
  // Добавить настройки кодировки
}

model Product {
  // ... существующие поля
  name String // UTF-8 по умолчанию
  properties_data String @default("{}") // UTF-8 JSON
}
```

#### 2.3 Исправление API ответов

```typescript
// Правильный Content-Type для всех API
export function createResponse(data: any) {
  const response = NextResponse.json(data);
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}
```

#### 2.4 Обработка файлов импорта

```typescript
// Правильная обработка кодировки при импорте
import * as XLSX from 'xlsx';

function readExcelFile(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { 
    type: 'buffer',
    codepage: 65001 // UTF-8
  });
  
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { 
    defval: '',
    raw: false // Преобразование всех значений в строки
  });
}
```

### 3. Оптимизация архитектуры БД

#### 3.1 Новая структура таблиц

```sql
-- Оптимизированная таблица товаров
CREATE TABLE products_optimized (
  id VARCHAR(50) PRIMARY KEY,
  catalog_category_id VARCHAR(50) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Индексы
  INDEX idx_category_active (catalog_category_id, is_active),
  INDEX idx_sku (sku),
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
);

-- Отдельная таблица для свойств
CREATE TABLE product_properties (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  property_name VARCHAR(100) NOT NULL,
  property_value TEXT NOT NULL,
  property_type VARCHAR(20) DEFAULT 'text',
  
  FOREIGN KEY (product_id) REFERENCES products_optimized(id) ON DELETE CASCADE,
  INDEX idx_product_property (product_id, property_name),
  INDEX idx_property_value (property_name, property_value)
);
```

#### 3.2 Оптимизированные запросы

```typescript
// Эффективный запрос с пагинацией
async function getProductsPaginated(params: {
  categoryId?: string;
  page: number;
  limit: number;
  filters?: Record<string, any>;
}) {
  const where: any = { is_active: true };
  
  if (params.categoryId) {
    where.catalog_category_id = params.categoryId;
  }
  
  // Добавление фильтров
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      where.properties = {
        some: {
          property_name: key,
          property_value: { contains: value }
        }
      };
    }
  }
  
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        properties: true,
        catalog_category: {
          select: { id: true, name: true }
        }
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { created_at: 'desc' }
    }),
    prisma.product.count({ where })
  ]);
  
  return { products, total, page: params.page, limit: params.limit };
}
```

#### 3.3 Система кэширования

```typescript
// Redis кэширование
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(data));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

#### 3.4 Мониторинг производительности

```typescript
// Метрики производительности
class DatabaseMetrics {
  static async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Логирование медленных запросов
      if (duration > 1000) {
        console.warn(`Slow query: ${queryName} took ${duration}ms`);
      }
      
      // Отправка метрик
      await this.sendMetrics(queryName, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.sendMetrics(queryName, duration, false);
      throw error;
    }
  }
  
  private static async sendMetrics(
    queryName: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    // Отправка в систему мониторинга
    console.log(`Query: ${queryName}, Duration: ${duration}ms, Success: ${success}`);
  }
}
```

---

## План внедрения

### Этап 1: Критические исправления (1-2 недели)

1. **Исправление кодировки**
   - Настройка UTF-8 в SQLite
   - Обновление API ответов
   - Исправление импорта файлов

2. **Нормализация свойств**
   - Создание справочника свойств
   - Скрипт миграции существующих данных
   - Обновление логики импорта

### Этап 2: Оптимизация производительности (2-3 недели)

1. **Новая структура БД**
   - Создание оптимизированных таблиц
   - Миграция данных
   - Обновление индексов

2. **Система кэширования**
   - Внедрение Redis
   - Обновление API для использования кэша
   - Настройка инвалидации

### Этап 3: Мониторинг и масштабирование (1-2 недели)

1. **Метрики производительности**
   - Внедрение системы мониторинга
   - Настройка алертов
   - Оптимизация медленных запросов

2. **Тестирование**
   - Нагрузочное тестирование
   - Проверка корректности данных
   - Валидация производительности

---

## Ожидаемые результаты

### После исправления кодировки
- ✅ Русский текст отображается корректно
- ✅ Поиск работает с русскими символами
- ✅ API возвращает читаемые данные

### После нормализации свойств
- ✅ Устранение дублирования
- ✅ Корректная работа фильтрации
- ✅ Стабильная работа API

### После оптимизации архитектуры
- ⚡ Ускорение запросов в 5-10 раз
- 📈 Поддержка большего количества товаров
- 🔄 Эффективное кэширование
- 📊 Мониторинг производительности

---

## Заключение

Выявленные проблемы с базой данных являются **критическими** и требуют немедленного решения. Они влияют на:

- **Функциональность системы** - поиск, фильтрация, расчет цен
- **Производительность** - медленные запросы, высокое потребление памяти
- **Масштабируемость** - система не готова к росту
- **Пользовательский опыт** - нечитаемые данные, ошибки API

Рекомендуется начать с **исправления кодировки** как наиболее критичной проблемы, затем перейти к **нормализации свойств** и **оптимизации архитектуры**.

При правильном внедрении предложенных решений система станет стабильной, производительной и готовой к масштабированию.
