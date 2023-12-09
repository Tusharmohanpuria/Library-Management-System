#!/bin/bash

# Check if Node.js is installed
command -v node >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Node.js is not installed. Please install Node.js then run this script."
  echo ""
  read -p "Press Enter to exit."
  exit 1
fi
echo "Node.js is installed."
clear

# Check if MongoDB is installed
command -v mongod >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "MongoDB is not installed. Please install MongoDB then run this script."
  echo ""
  read -p "Press Enter to exit."
  exit 1
fi
echo "MongoDB is installed."
clear

# Check if OpenSSL is installed
command -v openssl >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "OpenSSL is not installed. Please install OpenSSL then run this script."
  echo ""
  read -p "Press Enter to exit."
  exit 1
fi
echo "OpenSSL is installed."
clear

# Check if MongoDB is running
if pgrep -x "mongod" >/dev/null 2>&1; then
  echo "MongoDB is running."
else
  # Attempt to start MongoDB in a new terminal
  echo "MongoDB is not running. Starting MongoDB in a new terminal..."
  gnome-terminal -- mongod
  sleep 10

  # Check again if MongoDB is now running
  if pgrep -x "mongod" >/dev/null 2>&1; then
    echo "MongoDB is now running."
  else
    echo "Failed to start MongoDB. Please start MongoDB manually and then run this script."
    echo ""
    read -p "Press Enter to exit."
    exit 1
  fi
fi
clear

# Check and install dependencies in Frontend and Backend folders
cd Frontend
echo "Installing Yarn globally..."
npm install -g yarn
echo "Running yarn..."
npx yarn 2> /dev/null
echo "Yarn installation completed."
cd ..
clear

cd Backend
echo "Installing Backend dependencies..."
npm install
npm install -g nodemon
echo "Backend dependencies installation completed."
clear

echo "Checking if admin user exists and if not creating one..."
node "admin(First_User).js" > /dev/null 2>&1
echo "Admin user created successfully or was already present."
clear

# Run OpenSSL commands to generate Self-signed Certificate and Private key
echo "Enter the information to generate Self-signed Certificate and Private key:"
openssl req -x509 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
echo "Self-signed Certificate and Private key generated successfully."
cd ..
clear

# Copy cert.pem and key.pem from Backend to Frontend
cp Backend/cert.pem Frontend/
cp Backend/key.pem Frontend/
echo "Files copied successfully."
clear

# Get the IPv4 address
current_ip=$(hostname -I | cut -d' ' -f1)
echo "Current IP: $current_ip"

# Change directory to Frontend and create/update .env file
cd Frontend
if [ -e .env ]; then
  echo "Overwriting .env file..."
  echo "REACT_APP_API_URL=https://$current_ip:5000/" > .env
  echo ".env file overwritten with REACT_APP_API_URL."
else
  echo "REACT_APP_API_URL=https://$current_ip:5000/" > .env
  echo ".env file created with REACT_APP_API_URL."
fi
clear

# Run Frontend build
echo "Running Frontend build..."
npx yarn build
echo "Frontend build completed."
clear

# Install serve globally
echo "Installing serve globally..."
npm install -g serve
clear

# Start Frontend in a new terminal
echo "Starting Frontend..."
gnome-terminal -- npx serve -s build
echo "Frontend started successfully."
clear

# Change directory back to the parent
cd ..

# Change directory to Backend
cd Backend
clear

# Start HTTPS server
echo "Starting HTTPS server..."
gnome-terminal -- nodemon server_https.js
echo "HTTPS server started successfully."

cd ..
clear

# Open the browser
echo "Opening the browser..."
xdg-open "https://$current_ip:3000"
echo "Browser opened successfully."
clear

echo ""
echo "To Open the Web App in the browser:"
echo ""
echo "   - Click on the link below:"
echo "     https://$current_ip:3000"
echo ""
echo "   - Or copy and paste the link in the browser."
echo ""
echo "   - The Admin user credentials are:"
echo "       UserID: 00000000"
echo "       Password: 123456"
echo ""
echo ""

# Pause to keep the terminal open
read -p "Press Enter to Proceed."
clear

echo ""
echo "Script completed successfully."
echo ""
echo "   - To stop the server, close the terminal windows or press Ctrl+C in each terminal window."
echo "   - To restart the server, run the script again."
echo ""
echo ""

# Pause to keep the terminal open
read -p "Press Enter to exit."
clear
