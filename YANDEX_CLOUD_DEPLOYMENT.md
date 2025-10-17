# Деплой на Yandex Cloud

Этот документ описывает процесс деплоя приложения Domeo Doors на Yandex Cloud.

## Предварительные требования

### Локальная среда разработки
- Node.js 18+
- Docker и Docker Compose
- Git

### Yandex Cloud
- Аккаунт в Yandex Cloud
- Созданный кластер (Compute Cloud или Container Registry)
- Управляемая база данных PostgreSQL
- Объектное хранилище (S3-совместимое)

## Подготовка к деплою

### 1. Настройка переменных окружения

Скопируйте файл `app/env.yandex.example` в `app/.env.local` и заполните реальными значениями:

```bash
cd app
cp env.yandex.example .env.local
```

Обязательно измените следующие переменные:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
- `NEXT_PUBLIC_APP_URL` - URL вашего приложения
- `YC_STORAGE_*` - настройки Yandex Object Storage

### 2. Настройка базы данных

Приложение использует PostgreSQL. Убедитесь, что:
- База данных создана и доступна
- Пользователь имеет права на создание таблиц
- Строка подключения корректна

### 3. Подготовка файлов

Убедитесь, что все необходимые файлы созданы:
- `app/Dockerfile.yandex` - Dockerfile для продакшена
- `app/docker-compose.yandex.yml` - конфигурация Docker Compose
- `app/sql/yandex_cloud_schema.sql` - инициализация БД
- `app/prisma/migrations/` - миграции Prisma

## Локальное тестирование

### Запуск с Docker Compose

```bash
cd app
docker-compose -f docker-compose.yandex.yml up -d
```

### Проверка работоспособности

```bash
# Проверка health check
curl http://localhost:3000/api/health

# Проверка статуса контейнеров
docker-compose -f docker-compose.yandex.yml ps
```

### Просмотр логов

```bash
docker-compose -f docker-compose.yandex.yml logs -f
```

## Деплой на Yandex Cloud

### Вариант 1: Использование скрипта деплоя

#### Windows (PowerShell)
```powershell
.\scripts\deploy-yandex.ps1
```

#### Linux/macOS (Bash)
```bash
./scripts/deploy-yandex.sh
```

### Вариант 2: Ручной деплой

#### 1. Сборка Docker образа
```bash
cd app
docker build -f Dockerfile.yandex -t domeo-doors:latest .
```

#### 2. Запуск контейнеров
```bash
docker-compose -f docker-compose.yandex.yml up -d
```

#### 3. Выполнение миграций
```bash
docker-compose -f docker-compose.yandex.yml exec app npx prisma migrate deploy
```

#### 4. Генерация Prisma клиента
```bash
docker-compose -f docker-compose.yandex.yml exec app npx prisma generate
```

## Настройка Yandex Cloud

### 1. Container Registry

Создайте реестр контейнеров в Yandex Cloud:

```bash
# Авторизация в Container Registry
yc container registry configure-docker

# Создание реестра
yc container registry create --name domeo-doors-registry

# Получение ID реестра
yc container registry get domeo-doors-registry
```

### 2. Загрузка образа в реестр

```bash
# Тегирование образа
docker tag domeo-doors:latest cr.yandex/<registry-id>/domeo-doors:latest

# Загрузка в реестр
docker push cr.yandex/<registry-id>/domeo-doors:latest
```

### 3. Managed PostgreSQL

Создайте управляемую базу данных PostgreSQL:

```bash
# Создание кластера PostgreSQL
yc managed-postgresql cluster create \
  --name domeo-doors-db \
  --environment production \
  --network-name default \
  --host zone-id=ru-central1-a,subnet-id=<subnet-id>

# Создание базы данных
yc managed-postgresql database create \
  --cluster-name domeo-doors-db \
  --name domeo_doors

# Создание пользователя
yc managed-postgresql user create \
  --cluster-name domeo-doors-db \
  --name domeo_user \
  --password <secure-password>
```

### 4. Object Storage

Создайте бакет для хранения файлов:

```bash
# Создание бакета
yc storage bucket create --name domeo-doors-files

# Настройка публичного доступа (если нужно)
yc storage bucket update --name domeo-doors-files --public-read
```

## Мониторинг и логирование

### Health Check

Приложение предоставляет endpoint для проверки здоровья:
- URL: `http://your-domain.com/api/health`
- Метод: GET
- Ответ: JSON с статусом приложения и БД

### Логирование

Логи доступны через Docker:
```bash
# Логи приложения
docker-compose -f docker-compose.yandex.yml logs app

# Логи базы данных
docker-compose -f docker-compose.yandex.yml logs postgres

# Все логи
docker-compose -f docker-compose.yandex.yml logs -f
```

### Мониторинг

Настройте мониторинг в Yandex Cloud:
- Cloud Monitoring для метрик
- Cloud Logging для логов
- Cloud Alerting для уведомлений

## Безопасность

### Рекомендации по безопасности

1. **Измените все пароли по умолчанию**
2. **Используйте HTTPS в продакшене**
3. **Настройте firewall правила**
4. **Регулярно обновляйте зависимости**
5. **Используйте секреты для чувствительных данных**

### Переменные окружения для безопасности

```bash
# Обязательно измените в продакшене
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
DATABASE_URL=postgresql://user:password@host:port/database

# Настройки безопасности
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-key
```

## Troubleshooting

### Частые проблемы

#### 1. Ошибка подключения к БД
```bash
# Проверьте строку подключения
echo $DATABASE_URL

# Проверьте доступность БД
docker-compose -f docker-compose.yandex.yml exec app npx prisma db push
```

#### 2. Ошибки миграций
```bash
# Сброс миграций
docker-compose -f docker-compose.yandex.yml exec app npx prisma migrate reset

# Применение миграций
docker-compose -f docker-compose.yandex.yml exec app npx prisma migrate deploy
```

#### 3. Проблемы с Docker
```bash
# Очистка Docker
docker system prune -a

# Пересборка образов
docker-compose -f docker-compose.yandex.yml build --no-cache
```

### Полезные команды

```bash
# Проверка статуса
docker-compose -f docker-compose.yandex.yml ps

# Перезапуск сервисов
docker-compose -f docker-compose.yandex.yml restart

# Остановка сервисов
docker-compose -f docker-compose.yandex.yml down

# Остановка с удалением volumes
docker-compose -f docker-compose.yandex.yml down -v
```

## Обновление приложения

### Процесс обновления

1. **Остановка текущей версии**
```bash
docker-compose -f docker-compose.yandex.yml down
```

2. **Обновление кода**
```bash
git pull origin main
```

3. **Пересборка образа**
```bash
docker-compose -f docker-compose.yandex.yml build --no-cache
```

4. **Запуск новой версии**
```bash
docker-compose -f docker-compose.yandex.yml up -d
```

5. **Применение миграций**
```bash
docker-compose -f docker-compose.yandex.yml exec app npx prisma migrate deploy
```

## Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь в корректности переменных окружения
3. Проверьте доступность внешних сервисов
4. Обратитесь к документации Yandex Cloud

## Дополнительные ресурсы

- [Документация Yandex Cloud](https://cloud.yandex.ru/docs)
- [Документация Docker](https://docs.docker.com/)
- [Документация Next.js](https://nextjs.org/docs)
- [Документация Prisma](https://www.prisma.io/docs)


