# Скрипт для установки YC CLI
Write-Host "🔧 Установка YC CLI для Yandex Cloud" -ForegroundColor Cyan

# Проверка операционной системы
$os = $env:OS
Write-Host "Операционная система: $os" -ForegroundColor Yellow

if ($os -like "*Windows*") {
    Write-Host "`n📥 Установка для Windows..." -ForegroundColor Yellow
    
    # Проверка наличия Chocolatey
    try {
        $chocoVersion = choco --version 2>$null
        if ($chocoVersion) {
            Write-Host "✅ Chocolatey найден: $chocoVersion" -ForegroundColor Green
            Write-Host "🚀 Установка через Chocolatey..." -ForegroundColor Yellow
            choco install yandex-cloud-cli -y
        } else {
            Write-Host "❌ Chocolatey не найден" -ForegroundColor Red
            Write-Host "📥 Установите Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
            Write-Host "`nИли скачайте YC CLI вручную:" -ForegroundColor Yellow
            Write-Host "1. Перейдите на: https://cloud.yandex.ru/docs/cli/quickstart" -ForegroundColor White
            Write-Host "2. Скачайте установщик для Windows" -ForegroundColor White
            Write-Host "3. Запустите установщик" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ Chocolatey не установлен" -ForegroundColor Red
        Write-Host "📥 Установите Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
        Write-Host "`nИли скачайте YC CLI вручную:" -ForegroundColor Yellow
        Write-Host "1. Перейдите на: https://cloud.yandex.ru/docs/cli/quickstart" -ForegroundColor White
        Write-Host "2. Скачайте установщик для Windows" -ForegroundColor White
        Write-Host "3. Запустите установщик" -ForegroundColor White
    }
} else {
    Write-Host "`n📥 Установка для Linux/macOS..." -ForegroundColor Yellow
    Write-Host "Выполните команды:" -ForegroundColor White
    Write-Host "curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash" -ForegroundColor White
    Write-Host "source ~/.bashrc" -ForegroundColor White
}

Write-Host "`n🔧 После установки выполните:" -ForegroundColor Cyan
Write-Host "1. yc init" -ForegroundColor White
Write-Host "2. Выберите папку и облако" -ForegroundColor White
Write-Host "3. Настройте аутентификацию" -ForegroundColor White

Write-Host "`n📚 Документация:" -ForegroundColor Cyan
Write-Host "https://cloud.yandex.ru/docs/cli/quickstart" -ForegroundColor White
Write-Host "https://cloud.yandex.ru/docs/cli/concepts/quickstart" -ForegroundColor White


