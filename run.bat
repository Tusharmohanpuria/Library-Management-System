@echo off

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is not installed. Please install Node.js to run this script.
  echo.
  REM Pause to keep the command prompt open
  pause
  exit /b 1
)
echo Node.js is installed.
cls

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %errorlevel% neq 0 (
  echo MongoDB is not installed. Please install MongoDB to run this script.
  echo.
  REM Pause to keep the command prompt open
  pause
  exit /b 1
)
echo MongoDB is installed.
cls

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %errorlevel% neq 0 (
  echo OpenSSL is not installed. Please install OpenSSL to run this script.
  echo.
  REM Pause to keep the command prompt open
  pause
  exit /b 1
)
echo OpenSSL is installed.
cls

REM Check if MongoDB is running
netstat -ano | findstr :27017 >nul 2>nul
if %errorlevel% neq 0 (
  echo MongoDB is not running. Starting MongoDB in a new terminal...
  start cmd /k mongod
  timeout /t 10 /nobreak >nul
)

REM Check again if MongoDB is now running
netstat -ano | findstr :27017 >nul 2>nul
if %errorlevel% neq 0 (
  echo Failed to start MongoDB. Please start MongoDB manually and then run this script.
  echo.
  REM Pause to keep the command prompt open
  pause
  exit /b 1
)
echo MongoDB is now running.
cls

REM Check and install dependencies in Frontend and Backend folders
cd Frontend
echo Installing Yarn globally...
call npm i -g yarn
echo Running yarn...
call npx yarn 2> nul
echo Yarn installation completed.
cd ..
cls

cd Backend
echo Installing Backend dependencies...
call npm i
call npm i -g nodemon
echo Backend dependencies installation completed.
cls

echo checking if admin user exists and if not creating one...
call node "admin(First_User).js" > NUL 2>&1
echo admin user created successfully or was already present.
cls

REM Run HTTP commands to generate Self-signed Certificate and Private key
echo Enter the information to generate Self-signed Certificate and Private key:
openssl req -x509 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
echo Self-signed Certificate and Private key generated successfully.
cd ..
cls

REM Copy cert.pem and key.pem from Backend to Frontend
copy Backend\cert.pem Frontend\
copy Backend\key.pem Frontend\
echo Files copied successfully.
cls

REM Get the IPv4 address using PowerShell
for /f "delims=" %%a in ('powershell -Command "Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter IPENABLED=TRUE | Select-Object -ExpandProperty IPAddress | Select-Object -First 1"') do set current_ip=%%a
echo Current IP: %current_ip%

REM Change directory to Frontend and create/update .env file
cd Frontend
if exist .env (
  echo Overwriting .env file...
  echo REACT_APP_API_URL = https://%current_ip%:5000/ > .env
  echo .env file overwritten with REACT_APP_API_URL.
) else (
  echo REACT_APP_API_URL = https://%current_ip%:5000/ > .env
  echo .env file created with REACT_APP_API_URL.
)
cls

REM Run Frontend build
echo Running Frontend build...
call npx yarn build
echo Frontend build completed.
cls

REM Install serve globally
echo Installing serve globally...
call npm install -g serve
cls

REM Start Frontend in a new terminal
echo Starting Frontend...
call start cmd /k yarn build-start-https
echo Frontend started successfully.
cls

REM Change directory back to the parent
cd ..

REM Change directory to Backend
cd Backend
cls

REM Start HTTPS server
echo Starting HTTPS server...
call start cmd /k nodemon server_https.js
echo HTTPS server started successfully.

cd ..
cls

REM Open the browser
echo Opening the browser...
start https://%current_ip%:3000
echo Browser opened successfully.
cls

echo.
echo To Open the Web App in the browser:
echo.
echo    - Click on the link below:
echo      https://%current_ip%:3000
echo.
echo    - Or copy and paste the link in the browser.
echo.
echo    - The Admin user credentials are:
echo          UserID: 00000000
echo          Password: 123456
echo.
echo.

REM Pause to keep the command prompt open
pause
cls

echo.
echo Script completed successfully.
echo.
echo      - To stop the server, close the terminal windows or press Ctrl+C in each terminal window.
echo      - To restart the server, run the script again.
echo.
echo.

REM Pause to keep the command prompt open
pause