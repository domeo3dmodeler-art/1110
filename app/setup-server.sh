#!/bin/bash
set -e

echo "🔧 Настройка сервера для Domeo Doors"

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
echo "📦 Установка необходимых пакетов..."
sudo apt install -y curl wget git unzip

# Установка Docker
echo "🐳 Установка Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
echo "👤 Добавление пользователя в группу docker..."
sudo usermod -aG docker ubuntu

# Установка Docker Compose
echo "🐳 Установка Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Установка YC CLI
echo "☁️ Установка YC CLI..."
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
source ~/.bashrc

# Настройка брандмауэра
echo "🔥 Настройка брандмауэра..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Создание директории проекта
echo "📁 Создание директории проекта..."
mkdir -p /home/ubuntu/domeo-doors
cd /home/ubuntu/domeo-doors

echo "✅ Настройка сервера завершена!"
echo "🔄 Перезагрузите сервер для применения изменений:"
echo "sudo reboot"
echo ""
echo "После перезагрузки выполните:"
echo "cd /home/ubuntu/domeo-doors"
echo "yc init"
echo "./deploy.sh"


