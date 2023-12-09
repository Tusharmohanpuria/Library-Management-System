# Project Setup

This project contains scripts for setting up a development environment with Node.js, MongoDB, OpenSSL and necessary dependencies for Frontend and Backend.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed
- [OpenSSL](https://www.openssl.org/) installed

## Getting Started

1. Navigate to the project directory:

        cd Project-Directory

2. Run the Project Script

    - Windows

        Open Command Prompt as Administrator.

            run.bat

        Fill required Information for Self-signed Certificate.
        Follow the on-screen instructions.

        The script will open the browser automatically with the link to the web app.

    - Linux

        Open a terminal.

            chmod +x run.sh
            ./run.sh

        Fill required Information for Self-signed Certificate.
        Follow the on-screen instructions.

        The script will open the browser automatically with the link to the web app.

## Note

- For Linux users, make sure you have the necessary permissions to execute the script.

- If any issues arise during the setup process, please check the error messages and ensure that all prerequisites are installed.

- To stop the server, close the terminal windows or press Ctrl+C in each terminal window.

- To restart the server, run the script again.