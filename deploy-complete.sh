#!/bin/bash
set -e

echo "🚀 Полное развертывание Domeo Doors на Yandex Cloud"
echo "IP сервера: 130.193.40.35"

# Создание директории проекта
echo "📁 Создание директории проекта..."
mkdir -p /home/ubuntu/domeo-doors
cd /home/ubuntu/domeo-doors

# Создание docker-compose.production.yml
echo "📝 Создание docker-compose.production.yml..."
cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  app:
    image: cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://domeo_user:domeo_password@postgres:5432/domeo_doors
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
      - NEXT_PUBLIC_APP_URL=http://130.193.40.35
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: domeo_doors
      POSTGRES_USER: domeo_user
      POSTGRES_PASSWORD: domeo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U domeo_user -d domeo_doors"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
EOF

# Настройка Docker для работы с Yandex Container Registry
echo "🔧 Настройка Docker для Yandex Container Registry..."
yc container registry configure-docker

# Получение последней версии образа
echo "📥 Получение последней версии образа..."
docker-compose -f docker-compose.production.yml pull

# Запуск приложения
echo "🚀 Запуск приложения..."
docker-compose -f docker-compose.production.yml up -d

# Ожидание запуска сервисов
echo "⏳ Ожидание запуска сервисов..."
sleep 30

# Проверка статуса
echo "🔍 Проверка статуса сервисов..."
docker-compose -f docker-compose.production.yml ps

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://130.193.40.35"
echo "📊 Статус сервисов:"
docker-compose -f docker-compose.production.yml ps


