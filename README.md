
# 🚀 CodeHub – Online Code Editor 

**CodeHub** is a full-featured, code editor built with:

- 🧠 React (Vite)
- 🖥️ Node.js + Express
- 💾 MongoDB
- 🐳 Docker
- 🛠️ Monaco Editor
- 🎨 Tailwind CSS
- 🔒 JWT Authentication

It's designed for real-time, multi-file coding in JS/C++ with stdin input support and full workspace management.

---

## 🌟 Features

- 🔐 **Authentication** (Login/Signup) using JWT
- 🗂️ **Multi-Workspace Support** – Create multiple workspaces per user
- 📁 **Folder/File Tree** – VS Code–like file explorer (create, rename, delete)
- 📝 **Multi-Tab Editor** – Edit multiple files in parallel with tab support
- ⚙️ **Monaco Editor** – Syntax highlighting, intellisense for JS and C++
- 📦 **Docker-powered Execution** – Run code in secure containers
- 💬 **Stdin Input Support** – Enter input before running C++/JS programs
- 💾 **Auto-Save** – Code is saved to MongoDB automatically
- ⬇️ **Download as ZIP** – Export entire workspace as a ZIP file
- 💻 **Terminal UI** – Bottom sliding terminal like VS Code
- 🎨 **Modern UI** – Built using Tailwind CSS with dark theme design.

---

## 🧱 Tech Stack

| Frontend       | Backend        | Other Tools     |
|----------------|----------------|-----------------|
| React (Vite)   | Node.js (Express) | Docker          |
| Tailwind CSS   | MongoDB        | JWT Auth        |
| Monaco Editor  |                |                 |

---

## 📸 Screenshots

![UI Screenshot](client/screenshots/login-window.png)

![UI Screenshot](client/screenshots/workspaces.png)

![UI Screenshot](client/screenshots/code-editor.png)

---

## 🚀 Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/CodeHub.git
cd CodeHub
```

### 2. Start Backend (server)
```bash
cd server
npm install
node index.js
```

> Ensure MongoDB is running locally or update `.env` with a connection string.

### 3. Start Frontend (client)
```bash
cd ../client
npm install
npm run dev
```

### 4. Dockerized Code Execution
Docker is used in the backend (in `runCodeInDocker.js`) to securely execute JS and C++.

Make sure Docker is installed and running.

---

## 📦 Folder Structure

```
CodeHub/
├── client/         # React frontend (Vite)
├── server/         # Node.js backend + Docker runner
│   └── runCodeInDocker.js
└── README.md
```

---

## 🔐 Environment Variables

Create `.env` files in both `client/` and `server/` folders with appropriate values:

### Example (`server/.env`)
```env
MONGO_URI=your_mongo_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 🧠 Inspiration

This project is inspired by **Replit**, **CodePen**, and **Visual Studio Code Web**.

Built for learning and showcasing system design, secure code execution, and beautiful UI/UX.

---

## 📜 License

This project is licensed under the MIT License.
