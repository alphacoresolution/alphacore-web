@echo off
title AlphaCore Setup - Surface Pro
color 0A

echo.
echo ================================================
echo   AlphaCore Solutions - Setup Surface Pro
echo ================================================
echo.

:: Verificar Git
echo [1/4] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Git no esta instalado.
    echo  Ve a https://git-scm.com y descargalo.
    echo  Luego vuelve a correr este archivo.
    echo.
    pause
    exit /b 1
)
echo  Git OK.
echo.

:: Crear carpeta
echo [2/4] Creando carpeta C:\alphacore ...
if not exist "C:\alphacore" mkdir "C:\alphacore"
cd /d "C:\alphacore"
echo  Carpeta lista: C:\alphacore
echo.

:: Clonar repos
echo [3/4] Clonando repositorios de GitHub...
echo  (Te puede pedir usuario y token de GitHub)
echo.

echo  Clonando VoiceCore...
git clone https://github.com/alphacoresolution/voicecore.git
echo.

echo  Clonando ChatCore...
git clone https://github.com/alphacoresolution/chatcore.git
echo.

echo  Clonando Sitio Web...
git clone https://github.com/alphacoresolution/alphacore-web.git
echo.

:: Listo
echo [4/4] Listo!
echo.
echo ================================================
echo   Repos en: C:\alphacore\
echo   - voicecore
echo   - chatcore
echo   - alphacore-web
echo.
echo   Abre Claude Code, click en Open Folder,
echo   selecciona cualquiera de esas carpetas.
echo ================================================
echo.
pause
