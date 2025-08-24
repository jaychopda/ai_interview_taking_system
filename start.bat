@echo off
echo Starting AI Interview System...
echo.

echo Starting Django AI Service...
cd djangoaiservice
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
    start "Django AI Service" cmd /k "python manage.py runserver 8000"
) else (
    echo Warning: Virtual environment not found. Please activate it manually.
    start "Django AI Service" cmd /k "python manage.py runserver 8000"
)
cd ..

echo Starting Node.js Backend...
start "Node.js Backend" cmd /k "npm start"

echo Starting React Frontend...
cd frontend
start "React Frontend" cmd /k "npm run dev"
cd ..

echo.
echo All services are starting...
echo - Django AI Service: http://localhost:8000
echo - Node.js Backend: Check server.js for port
echo - React Frontend: Check terminal for Vite dev server URL
echo.
echo Press any key to close this window...
pause > nul
