#!/bin/bash
set -e

echo "🚀 Развертывание Domeo Doors на Yandex Cloud"

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

# Проверка наличия YC CLI
if ! command -v yc &> /dev/null; then
    echo "❌ YC CLI не установлен"
    exit 1
fi

# Настройка Docker для работы с Yandex Container Registry
echo "🔧 Настройка Docker для Yandex Container Registry..."
yc container registry configure-docker

# Получение последней версии образа
echo "📥 Получение последней версии образа..."
docker-compose -f docker-compose.production.yml pull

# Остановка старых контейнеров
echo "🛑 Остановка старых контейнеров..."
docker-compose -f docker-compose.production.yml down

# Запуск новых контейнеров
echo "🚀 Запуск новых контейнеров..."
docker-compose -f docker-compose.production.yml up -d

# Ожидание запуска сервисов
echo "⏳ Ожидание запуска сервисов..."
sleep 30

# Проверка статуса
echo "🔍 Проверка статуса сервисов..."
docker-compose -f docker-compose.production.yml ps

# Очистка старых образов
echo "🧹 Очистка старых образов..."
docker image prune -f

# Получение внешнего IP
EXTERNAL_IP=$(curl -s ifconfig.me)

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://$EXTERNAL_IP"
echo "📊 Статус сервисов:"
docker-compose -f docker-compose.production.yml ps


