# Setup and Permissions Guide

It appears that your environment lacks **Node.js** and has restricted **PowerShell Execution Policies**, which prevented the automatic creation of a Next.js application.

## 1. Required Permissions & Fixes

To fix the errors seen in the terminal, you need to:

### A. Install Node.js
The command `npx` and `node` were not found.
1. Download and install **Node.js (LTS version)** from [https://nodejs.org/](https://nodejs.org/).
2. Restart your terminal/VS Code after installation.

### B. Fix PowerShell Permissions
To allow scripts to run (fixing the `PSSecurityException`), run this command in your PowerShell terminal:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
*Press 'Y' if prompted to confirm.*

---

## 2. Current Implementation (Cou-pong)

**Good News:** I have pivoted to building a **High-Performance Native Web Application (HTML/CSS/JS)**. 

**This version:**
- 🚀 Requires **NO** installation or special permissions to run.
- ⚡ Is extremely fast (no framework overhead).
- 🛠️ Can be easily migrated to React/Next.js later once your environment is ready.

### How to Run
Simply open the `index.html` file in your browser.
