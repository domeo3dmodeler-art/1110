# Настройка Yandex Container Registry

## Шаг 1: Установка YC CLI

### Windows
1. Скачайте установщик с https://cloud.yandex.ru/docs/cli/quickstart
2. Запустите установщик
3. Или используйте Chocolatey: `choco install yandex-cloud-cli -y`

### Linux/macOS
```bash
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
source ~/.bashrc
```

## Шаг 2: Настройка аутентификации

```bash
yc init
```

Выберите:
- Облако (cloud)
- Папку (folder)
- Профиль по умолчанию

## Шаг 3: Создание реестра

1. Откройте https://console.cloud.yandex.ru/
2. Перейдите в Container Registry → Реестры
3. Нажмите "Создать реестр"
4. Заполните:
   - Имя: `domeo-doors-registry`
   - Папка: выберите папку
   - Регион: `ru-central1` (Москва)
5. Нажмите "Создать"

## Шаг 4: Получение токена

```bash
yc iam create-token
```

Сохраните токен в переменную окружения:
```powershell
$env:DOCKER_REGISTRY_TOKEN = "YOUR_TOKEN_HERE"
```

## Шаг 5: Настройка Docker

Создайте файл `~/.docker/config.json`:
```json
{
  "auths": {
    "cr.yandex": {
      "auth": "BASE64_ENCODED_OAUTH:TOKEN"
    }
  }
}
```

Где `BASE64_ENCODED_OAUTH:TOKEN` = base64("oauth:YOUR_TOKEN")

## Шаг 6: Сборка и загрузка образа

```bash
# Сборка образа
docker build -f Dockerfile.yandex -t cr.yandex/YOUR_REGISTRY_ID/domeo-doors:latest .

# Загрузка в реестр
docker push cr.yandex/YOUR_REGISTRY_ID/domeo-doors:latest
```

## Шаг 7: Проверка

```bash
# Проверка загруженного образа
docker pull cr.yandex/YOUR_REGISTRY_ID/domeo-doors:latest

# Запуск контейнера
docker run -p 3000:3000 cr.yandex/YOUR_REGISTRY_ID/domeo-doors:latest
```

## Полезные команды

```bash
# Список реестров
yc container registry list

# Список образов в реестре
yc container image list --registry-id YOUR_REGISTRY_ID

# Удаление образа
yc container image delete --id YOUR_IMAGE_ID
```

## Переменные окружения

```bash
export DOCKER_REGISTRY_TOKEN="YOUR_TOKEN"
export REGISTRY_ID="YOUR_REGISTRY_ID"
export FOLDER_ID="YOUR_FOLDER_ID"
```

## Troubleshooting

### Ошибка аутентификации
```bash
yc init
yc config list
```

### Ошибка доступа к реестру
Проверьте права доступа в консоли Yandex Cloud

### Ошибка загрузки образа
```bash
docker login cr.yandex
# Введите oauth:YOUR_TOKEN как пароль
```

## Ссылки

- [Документация Container Registry](https://cloud.yandex.ru/docs/container-registry/)
- [YC CLI документация](https://cloud.yandex.ru/docs/cli/)
- [Консоль Yandex Cloud](https://console.cloud.yandex.ru/)


