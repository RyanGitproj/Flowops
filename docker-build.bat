@echo off
REM Docker build script with retry logic for network resilience (Windows)

set MAX_RETRIES=3
set RETRY_DELAY=10

echo 🚀 Building Docker image with retry logic...

for /l %%i in (1,1,%MAX_RETRIES%) do (
    echo Attempt %%i of %MAX_RETRIES%...
    
    docker compose build
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Build successful!
        exit /b 0
    ) else (
        echo ❌ Build failed (attempt %%i/%MAX_RETRIES%)
        
        if %%i LSS %MAX_RETRIES% (
            echo ⏳ Waiting %RETRY_DELAY%s before retry...
            timeout /t %RETRY_DELAY% /nobreak
            echo 🔄 Retrying...
        ) else (
            echo 💥 All retry attempts failed
            exit /b 1
        )
    )
)
