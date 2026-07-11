# 🗓️ ExpiriX Tracker

> **A MERN Stack-based Smart Expiry Management System**

ExpiriX Tracker is a full-stack web application developed using the **MERN Stack (MongoDB, Express.js, React.js, and Node.js)**. It helps users efficiently manage and monitor the expiry dates of food items, medicines, cosmetics, groceries, and other essential products by providing timely notifications and an intuitive dashboard.

---

## 🚀 Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap / Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose ODM

### Authentication
- JSON Web Token (JWT)
- bcrypt.js

### Development Tools
- Visual Studio Code
- Git & GitHub
- Postman
- MongoDB Compass

---

## ✨ Features

- User Registration & Login
- Secure JWT Authentication
- Add, Edit, and Delete Products
- Track Expiry Dates
- Category-wise Product Management
- Search and Filter Products
- Expiry Status Indicators
- Dashboard with Statistics
- Responsive Design
- Protected Routes
- Real-time CRUD Operations

---

## 📁 Project Structure

```
ExpiriX-Tracker/
│
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.js
│   └── package.json
│
├── server/                 # Node + Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ExpiriX-Tracker.git
cd ExpiriX-Tracker
```

### 2. Install Dependencies

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the Application

Start the backend server:

```bash
cd server
npm start
```

Start the React frontend:

```bash
cd client
npm start
```

The application will be available at:

- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:5000`

---

## 📌 MERN Architecture

```
React.js (Frontend)
        │
        ▼
 REST API (Axios)
        │
        ▼
Express.js + Node.js
        │
        ▼
MongoDB Database
```

---

## 📈 Future Enhancements

- Email reminder notifications
- QR/Barcode scanner
- AI-powered expiry prediction
- Mobile application
- Cloud deployment
- Multi-user shared inventory
- Product image upload

---

## 👨‍💻 Developed By

**Sanjushree J**
