<!-- 
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
- 🎨 **Modern UI** – Built using Tailwind CSS with dark theme design

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

This project is licensed under the MIT License. -->








# 🚀 CodeHub – Online Code Editor 

**CodeHub** is a full-featured Replit-style coding environment with:

- 🧠 React (Vite)
- 🖥️ Node.js + Express
- 💾 MongoDB
- 🐳 Docker
- 🛠️ Monaco Editor
- 🎨 Tailwind CSS
- 🔒 JWT Authentication
- 📡 Redis + BullMQ + WebSocket (NEW)

---

## 🌟 Features

- 🔐 **Authentication** (Login/Signup) using JWT
- 🗂️ **Multi-Workspace Support** – Create and manage multiple workspaces per user
- 📁 **Folder/File Tree** – VS Code–like file explorer (create, rename, delete files/folders)
- 📝 **Multi-Tab Editor** – Edit multiple files in parallel with tabbed layout
- ⚙️ **Monaco Editor** – Rich editing with syntax highlighting, intellisense (JS & C++)
- 📦 **Docker-powered Execution** – Isolated execution using language-specific Dockerfiles
- 💬 **Stdin Input Support** – Provide custom input for code execution
- 💾 **Auto-Save** – Real-time MongoDB storage
- ⬇️ **Download as ZIP** – Export full workspace as zip
- 💻 **Terminal UI** – VS Code–like bottom sliding terminal
- 🔄 **Job Queue System** (NEW) – Handles high traffic using BullMQ
- 📡 **WebSockets + Redis Pub/Sub** (NEW) – Real-time output streaming
- 🎨 **Modern UI** – Tailwind-based dark theme

---

## 🧠 Final Architecture

![Final Architecture](/CodeHub/client/screenshots/Final-Architecture.png)

---

## 🔧 Tech Stack

| Frontend       | Backend        | Infra & Tools      |
|----------------|----------------|--------------------|
| React (Vite)   | Node.js (Express) | Docker             |
| Tailwind CSS   | MongoDB        | BullMQ + Redis     |
| Monaco Editor  | JWT Auth       | WebSockets         |

---

## 🧱 Project Structure

CodeHub/
├── client/ # React frontend
│ ├── components/
│ ├── pages/
│ └── ...
├── server/ # Backend + Execution Logic
│ ├── routes/
│ ├── ws/ # WebSocket Server
│ ├── worker/ # BullMQ Worker
│ ├── docker/ # runCodeInDocker logic
│ ├── queue/ # Queue initialization
│ └── ...
└── README.md


---

## ⚙️ How It Works (Simplified Flow)

1. **User submits code** via browser UI
2. **Backend** queues job using BullMQ
3. **Worker** consumes the job and spins up Docker container
4. Output is **published** to Redis channel `job:{id}:result`
5. **WebSocket server** listens on this channel and streams result to frontend
6. Frontend shows **real-time job status**: `Queued → Running → Output`

---

## 🚀 Running Locally

### 1. Clone the Repository
git clone https://github.com/YOUR_USERNAME/CodeHub.git
cd CodeHub

### 2. Start Backend (server)
cd server
npm install
node index.js        # Express server
node ws-server.js # WebSocket server
node jobs/worker.js # Queue worker


## 3. Start Frontend (client)
cd ../client
npm install
npm run dev






📦 Docker-based Code Execution
The backend uses Docker to run code securely.

# Example: server/docker/runCodeInDocker.js
- Writes user code to a temp file
- Mounts into a container based on selected language
- Captures stdout/stderr

## 🔐 Environment Variables

Create `.env` files in  `server/` folders with appropriate values:

### Example (`server/.env`)
MONGO_URI=your_mongo_url
JWT_SECRET=your_jwt_secret
PORT=5000
REDIS_HOST=redis
REDIS_PORT=6379



## 📸 Screenshots

![UI Screenshot](client/screenshots/login-window.png)

![UI Screenshot](client/screenshots/workspaces.png)

![UI Screenshot](client/screenshots/code-editor.png)




🧪 Message Queue & Pub/Sub Workflow


### sequenceDiagram
Frontend ->> Backend: POST /api/run
Backend ->> Redis (BullMQ): Add job to queue
Worker ->> Docker: Run code
Worker ->> Redis Pub/Sub: job:{id}:result
WebSocket Server ->> Frontend: Stream output


### 📘 Notes
Job status (Queued, Running, Completed, TLE) is streamed live

Frontend listens to job updates via WebSocket

Docker is required for secure sandboxed execution



## 🧠 Inspiration

This project is inspired by **Replit**, **CodePen**, and **Visual Studio Code Web**.

Built for learning and showcasing system design, secure code execution, and beautiful UI/UX.

---

## 📜 License

This project is licensed under the MIT License. -->