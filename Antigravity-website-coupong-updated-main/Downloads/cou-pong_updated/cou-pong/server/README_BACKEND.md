# 📡 Cou-pong Backend Setup

This folder contains a complete Node.js + Express backend with SQLite database.

## ⚠️ Prerequisite: Install Node.js
Your system does not have Node.js installed (or it's not in your PATH).
To run this backend, please:
1.  Download Node.js from [nodejs.org](https://nodejs.org/).
2.  Install the LTS version.
3.  Restart your terminal/VS Code.

## 🚀 How to Run

1.  Open terminal in VS Code (`Ctrl + ~`).
2.  Navigate to the server folder:
    ```bash
    cd server
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    node server.js
    ```

The server will run on `http://localhost:5000`.

## 🗄️ Database
-   The database file is `server/database.sqlite`.
-   It is created automatically when you run the server.

## 🔑 Test Credentials
-   **User Signup/Login**: `/api/signup` or `/api/login`
-   **Vendor Signup/Login**: `/api/vendor/signup` or `/api/vendor/login`
