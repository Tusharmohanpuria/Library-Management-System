# Library Management System

Welcome to the **Library Management System** repository, a state-of-the-art web-based platform designed to redefine book transactions and elevate library management for students and staff members alike. Leveraging the robust MERN (MongoDB, Express.js, React.js, Node.js) technology stack, our system introduces innovative features and task automations to streamline library processes efficiently.

## Key Features:

1. **Automatic QR Code Generation:**
   - Simplify book transactions with automatically generated QR codes for each copy.

2. **Fine Collection via UPI Deep Link QR Codes:**
   - Streamline fine collection with UPI deep link QR codes for convenient and secure payments.

3. **E-ID Generation:**
   - Automate the generation of E-IDs for seamless user identification and tracking.

4. **ISBN-based Data Extraction:**
   - Eliminate manual data entry by extracting book information using ISBN, ensuring accuracy and saving time.

5. **Due Date Notification System:**
   - Keep students informed with a due date notification system to reduce overdue returns.

6. **Self-Checkout Option:**
   - Empower students with a self-checkout option, improving the borrowing process and reducing wait times.

7. **Reviews from Previous Students:**
   - Gain valuable insights through reviews from previous students, aiding new students in book selections.

8. **Book Preview and Evaluation:**
   - Allow users to preview and evaluate books before borrowing, enhancing decision-making.

# Project Setup

This project contains scripts for setting up a development environment with Node.js, MongoDB, OpenSSL and necessary dependencies for Frontend and Backend.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed
- [OpenSSL](https://www.openssl.org/) installed

## Getting Started

1. Navigate to the project directory:

    ```bash
    cd Project-Directory
    ```

2. Run the Project Script

    - **Windows:**
        Open Command Prompt as Administrator.

        ```bash
        run.bat
        ```

        Fill required information for the self-signed certificate. Follow on-screen instructions.

        The script will open the browser automatically with the link to the web app.

    - **Linux:**
        Open a terminal.

        ```bash
        chmod +x run.sh
        ./run.sh
        ```

        Fill required information for the self-signed certificate. Follow on-screen instructions.

        The script will open the browser automatically with the link to the web app.

## Project Videos

Explore the Library Management System through these informative videos hosted on YouTube:

### Video 1: Key Feature Showcase
[![Introduction to Library Management System Key Features](./Thumbnail/Features.gif)](https://www.youtube.com/watch?v=-lDDzrqdD-8){:target="_blank"}

### Video 2: Deployment Guide
[![Library Management System Installation Guide](./Thumbnail/Deployment.gif)](https://www.youtube.com/watch?v=ElKrKhBErGQ){:target="_blank"}

### Video 3: Final Demo
[![Library Management System Demo](./Thumbnail/Demo.gif)](https://www.youtube.com/watch?v=YOPJ7nz6FaA){:target="_blank"}

## Note

- Linux users: Ensure necessary permissions to execute the script.
- If issues arise, check error messages and ensure all prerequisites are installed.
- To stop the server, close the terminal windows or press Ctrl+C.
- To restart the server, rerun the script.
