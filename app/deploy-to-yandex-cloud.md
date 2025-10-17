# Развертывание приложения на Yandex Cloud

## Шаг 1: Создание виртуальной машины

### Через консоль Yandex Cloud:
1. Откройте https://console.cloud.yandex.ru/
2. Перейдите в **Compute Cloud → Виртуальные машины**
3. Нажмите **"Создать ВМ"**
4. Заполните:
   - **Имя**: `domeo-doors-server`
   - **Зона доступности**: `ru-central1-a`
   - **Образ**: `Ubuntu 20.04 LTS`
   - **Платформа**: `Intel Ice Lake`
   - **vCPU**: `2`
   - **RAM**: `4 ГБ`
   - **Диск**: `20 ГБ SSD`
   - **Публичный IP**: `Автоматически`

### Через YC CLI (если есть права):
```bash
yc compute instance create \
  --name domeo-doors-server \
  --zone ru-central1-a \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2004-lts,size=20 \
  --ssh-key ~/.ssh/id_rsa.pub \
  --cores 2 \
  --memory 4GB
```

## Шаг 2: Подключение к серверу

```bash
# Получить внешний IP
yc compute instance get domeo-doors-server

# Подключиться по SSH
ssh ubuntu@<EXTERNAL_IP>
```

## Шаг 3: Установка Docker на сервер

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker ubuntu

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка для применения изменений
sudo reboot
```

## Шаг 4: Настройка YC CLI на сервере

```bash
# Установка YC CLI
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
source ~/.bashrc

# Настройка аутентификации
yc init
# Используйте сервисный аккаунт или OAuth токен
```

## Шаг 5: Создание файлов развертывания

### docker-compose.production.yml
```yaml
version: '3.8'

services:
  app:
    image: cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://domeo_user:domeo_password@postgres:5432/domeo_doors
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: domeo_doors
      POSTGRES_USER: domeo_user
      POSTGRES_PASSWORD: domeo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### .env.production
```env
NODE_ENV=production
DATABASE_URL=postgresql://domeo_user:domeo_password@postgres:5432/domeo_doors
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP
```

## Шаг 6: Развертывание приложения

```bash
# Создание директории проекта
mkdir -p /home/ubuntu/domeo-doors
cd /home/ubuntu/domeo-doors

# Создание файлов конфигурации
nano docker-compose.production.yml
nano .env.production

# Настройка Docker для работы с Yandex Container Registry
yc container registry configure-docker

# Запуск приложения
docker-compose -f docker-compose.production.yml up -d

# Проверка статуса
docker-compose -f docker-compose.production.yml ps
```

## Шаг 7: Настройка домена (опционально)

### Через Yandex Cloud DNS:
1. Создайте зону DNS
2. Добавьте A-запись, указывающую на IP сервера
3. Настройте SSL сертификат

### Через внешний DNS провайдер:
1. Добавьте A-запись в DNS
2. Настройте SSL через Let's Encrypt

## Шаг 8: Настройка брандмауэра

```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## Шаг 9: Мониторинг и логи

```bash
# Просмотр логов
docker-compose -f docker-compose.production.yml logs -f

# Перезапуск приложения
docker-compose -f docker-compose.production.yml restart

# Обновление приложения
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

## Доступ к приложению

После развертывания приложение будет доступно по адресу:
- **HTTP**: http://YOUR_SERVER_IP
- **HTTPS**: https://YOUR_DOMAIN (если настроен)

### Пользователи могут:
1. Открыть браузер
2. Перейти по адресу сервера
3. Использовать конфигуратор дверей
4. Создавать заказы и документы

## Автоматизация развертывания

Создайте скрипт `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Развертывание Domeo Doors на Yandex Cloud"

# Получение последней версии образа
docker-compose -f docker-compose.production.yml pull

# Остановка старых контейнеров
docker-compose -f docker-compose.production.yml down

# Запуск новых контейнеров
docker-compose -f docker-compose.production.yml up -d

# Очистка старых образов
docker image prune -f

echo "✅ Развертывание завершено!"
echo "🌐 Приложение доступно по адресу: http://$(curl -s ifconfig.me)"
```

Сделайте скрипт исполняемым:
```bash
chmod +x deploy.sh
./deploy.sh
```


