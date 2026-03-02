# ⚙️ How to Setup Real Server-Side Email Authentication (SMTP)

You have requested a **Real Email OTP System** using a Backend Server (Node.js + Nodemailer).
This requires you to run a local server that talks to Gmail.

---

## Step 1: Install Backend Dependencies

1.  Open your terminal/command prompt.
2.  Navigate to the `server` folder:
    ```bash
    cd server
    ```
3.  Install the required packages:
    ```bash
    npm install
    ```
    *(This installs Express, Nodemailer, CORS, DotEnv)*

---

## Step 2: Configure Gmail SMTP

1.  In the `server` folder, create a new file named `.env`.
2.  Open `.env` and paste the following:

    ```env
    PORT=5000
    EMAIL_USER=your-actual-email@gmail.com
    EMAIL_PASS=your-app-password
    ```

3.  **IMPORTANT:**
    *   **EMAIL_USER:** Your full Gmail address.
    *   **EMAIL_PASS:** Do NOT use your normal password. You must generate an **App Password**:
        1. Go to [Google Account Security](https://myaccount.google.com/security).
        2. Enable **2-Step Verification** if not already on.
        3. Search for "App Passwords".
        4. Select App: "Mail", Device: "Other (Cou-pong)".
        5. Copy the 16-character password generated.

---

## Step 3: Start the Server

1.  Still in the `server` folder, run:
    ```bash
    node server.js
    ```
2.  You should see:
    ```
    Server running on http://localhost:5000
    OTP System Ready.
    ```

---

## Step 4: Test It!

1.  Open `index.html` (or serve the frontend normally).
2.  Go to **Sign Up** or **Log In**.
3.  Enter your email.
4.  The frontend will call your local server -> Server sends email via Gmail -> You get the OTP!

> **Note:** Leaving the server running is required for authentication to work. If you stop the server, Signup/Login will fail.
