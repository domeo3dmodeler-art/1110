# Настройка YC CLI через сервисный аккаунт
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceAccountKeyFile
)

Write-Host "Настройка YC CLI через сервисный аккаунт" -ForegroundColor Cyan
Write-Host "Файл ключа: $ServiceAccountKeyFile" -ForegroundColor Yellow

# Проверка файла ключа
if (-not (Test-Path $ServiceAccountKeyFile)) {
    Write-Host "Ошибка: Файл ключа не найден: $ServiceAccountKeyFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Инструкция по созданию сервисного аккаунта:" -ForegroundColor Cyan
    Write-Host "1. Откройте https://console.cloud.yandex.ru/" -ForegroundColor White
    Write-Host "2. Перейдите в IAM → Сервисные аккаунты" -ForegroundColor White
    Write-Host "3. Создайте сервисный аккаунт" -ForegroundColor White
    Write-Host "4. Назначьте роль: editor" -ForegroundColor White
    Write-Host "5. Создайте ключ и скачайте JSON файл" -ForegroundColor White
    exit 1
}

# Настройка профиля
Write-Host "Настройка профиля YC CLI..." -ForegroundColor Yellow
try {
    $initResult = yc config set service-account-key $ServiceAccountKeyFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Профиль настроен успешно" -ForegroundColor Green
    } else {
        Write-Host "Ошибка настройки профиля: $initResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка при настройке профиля: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Проверка настройки
Write-Host "Проверка настройки..." -ForegroundColor Yellow
try {
    $configResult = yc config list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Конфигурация:" -ForegroundColor Green
        Write-Host $configResult -ForegroundColor Gray
    } else {
        Write-Host "Ошибка проверки конфигурации: $configResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка при проверке конфигурации: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Получение токена
Write-Host "Получение IAM токена..." -ForegroundColor Yellow
try {
    $tokenResult = yc iam create-token 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Токен получен успешно" -ForegroundColor Green
        $env:DOCKER_REGISTRY_TOKEN = $tokenResult
        Write-Host "Токен сохранен в переменную окружения DOCKER_REGISTRY_TOKEN" -ForegroundColor Green
    } else {
        Write-Host "Ошибка получения токена: $tokenResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка при получении токена: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Настройте Docker: .\setup-docker-registry.ps1 -Token `$env:DOCKER_REGISTRY_TOKEN -RegistryId 'crpvhe4b1478pkh29sem'" -ForegroundColor White
Write-Host "2. Соберите и загрузите образ: .\build-and-push.ps1 -RegistryId 'crpvhe4b1478pkh29sem'" -ForegroundColor White


