@echo off
setlocal

cd /d "%~dp0"

echo Loading .env...

for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
    set "%%A=%%B"
)

echo Building...
call mvnw.cmd clean install

echo Starting Spring Boot...
call mvnw.cmd spring-boot:run

pause
