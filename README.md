# 💬 MERN Chat App

A real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for live messaging. This project supports authentication, group and private messaging, and a responsive UI..

---

## 📌 Features

- 🔒 User authentication (JWT-based)
- 💬 Real-time private and group messaging
- 🧑‍🤝‍🧑 Friend and group chat management
- ⚡ Socket.io for real-time communication
- 📱 Responsive React UI
- 🛠️ RESTful API backend
- 🌐 MongoDB for persistent data storage

---

## 🛠️ Tech Stack

**Frontend**:
- React.js
- Axios
- Context API / useReducer for state management

**Backend**:
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT for authentication
- Socket.io for real-time communication

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/huyvox3/MERN-Chat-App.git
cd MERN-Chat-App
```

### 2. Set up environment variables

Create a `.env` file in the `backend` folder and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

> You may also set up environment variables for the frontend if needed.

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the app

```bash
# Start backend
cd ../backend
npm start

# Start frontend (in another terminal)
cd ../frontend
npm start
```

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5000` by default.

---

## 📂 Project Structure

```
MERN-Chat-App/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── App.js
└── README.md
```

---

## 📸 Screenshots

_Add screenshots here if available to showcase the UI._

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙋‍♂️ Author

- **Võ Tấn Huy** — [GitHub](https://github.com/huyvox3)
