#!/bin/bash

echo "🚀 Развертывание полного приложения Domeo Doors на Yandex Cloud"
echo "=================================================="

# Остановим старое приложение
echo "📦 Останавливаем старое приложение..."
docker stop domeo-working-app 2>/dev/null || true
docker rm domeo-working-app 2>/dev/null || true

# Создадим директорию для данных
echo "📁 Создаем директории..."
mkdir -p ./sql
mkdir -p ./data/postgres

# Создадим SQL схему для инициализации
echo "🗄️ Создаем SQL схему..."
cat > ./sql/yandex_cloud_schema.sql << 'EOF'
-- Создание базы данных для Domeo Doors
CREATE DATABASE domeo_doors;

-- Подключение к базе данных
\c domeo_doors;

-- Создание пользователя (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'domeo_user') THEN
        CREATE USER domeo_user WITH PASSWORD 'domeo_password';
    END IF;
END
$$;

-- Предоставление прав
GRANT ALL PRIVILEGES ON DATABASE domeo_doors TO domeo_user;
GRANT ALL ON SCHEMA public TO domeo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO domeo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO domeo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO domeo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO domeo_user;
EOF

# Скачаем образ из реестра
echo "📥 Скачиваем образ приложения..."
docker pull cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest

# Запустим полное приложение
echo "🚀 Запускаем полное приложение..."
docker-compose -f docker-compose.production.yml up -d

# Ждем запуска
echo "⏳ Ждем запуска приложения..."
sleep 30

# Проверим статус
echo "🔍 Проверяем статус контейнеров..."
docker-compose -f docker-compose.production.yml ps

# Проверим логи
echo "📋 Проверяем логи приложения..."
docker-compose -f docker-compose.production.yml logs app --tail=20

echo ""
echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://130.193.40.35"
echo ""
echo "📊 Для мониторинга используйте:"
echo "   docker-compose -f docker-compose.production.yml logs -f"
echo "   docker-compose -f docker-compose.production.yml ps"


