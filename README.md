
Start Backend With JS

# 🎯 Backend with JavaScript

![Repo Size](https://img.shields.io/github/repo-size/Harsh1234567899/backend-with-javaScript)
![Latest commit](https://img.shields.io/github/last-commit/Harsh1234567899/backend-with-javaScript)


> **Personal learning repository** for backend development using JavaScript (Node.js + Express).  
> Contains learning exercises plus a practical **YouTube Clone** backend project to apply real-world concepts.

---

## 📌 Project Summary

This repository documents my backend learning journey. It contains small experiments, day-wise practice code, and a focused project — a YouTube-like backend that demonstrates authentication, video management, subscriptions, and related API design.

---

## 🗂 Repository Structure

    backend-with-javaScript/
    ├── 1_day/                 # Day-by-day learning exercises and snippets
    ├── 2_backend/             # Core backend projects (main working server)
    ├── 3_frontend/            # Optional frontend for testing APIs (demo clients)
    ├── 4_data_models/         # Mongoose schemas and model definitions
    ├── project/               # YouTube Clone backend (main project folder)
    │   ├── controllers/       # Route handlers / business logic
    │   ├── middlewares/       # Auth, error handlers, validation
    │   ├── models/            # Mongoose models / schemas
    │   ├── routes/            # Express route definitions
    │   ├── utils/             # Helpers (asyncHandler, ApiResponse, ApiError, etc.)
    │   └── index.js           # Project entry point
    ├── package.json
    ├── package-lock.json
    └── README.md

---

## 🚀 Features (What you can expect)

- Organized MVC-like folder structure for clarity and scaling
- RESTful API endpoints for users, videos, subscriptions, comments
- JWT-based authentication and protected routes
- Password hashing (bcrypt) for secure user credentials
- MongoDB integration via Mongoose for data persistence
- Centralized error handling and consistent API responses
- Dev tooling: nodemon for local development, dotenv for env vars
- cloudinary for image and video storage

---

## 🧰 Tech Stack (assumed from package.json)

- **Language:** JavaScript (ES6+)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Auth & Security:** jsonwebtoken (JWT), bcrypt
- **Env:** dotenv
- **Dev:** nodemon, Postman


---

## 🔧 Prerequisites

- Node.js (v14 or later recommended)
- npm (or yarn)
- MongoDB instance (local or cloud such as MongoDB Atlas)
- Optional: Postman or a REST client to test APIs

---

## ⚙️ Quick Install & Run

1. Clone repository

    git clone https://github.com/Harsh1234567899/backend-with-javaScript.git

2. Change into the backend directory (where `package.json` for backend is located):

    cd backend-with-javaScript/project

3. Install dependencies

    npm install


4. Start server (development)

    npm run dev

5. Production start

    npm start

> The server should be available at `http://localhost:5000` (or the PORT you configured).

---

## 🔍 Environment Variables (example)

    MONGO_URI=<your_mongodb_uri>
    ACCESS_TOKEN_SECRET=<your_access_token_secret>
    REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
    ACCESS_TOKEN_EXPIRY=15m
    REFRESH_TOKEN_EXPIRY=7d
    PORT=5000

---

## ✨ Example Routes 

- `POST /api/v1/users/signup` — register a new user  
- `POST /api/v1/users/login` — login and receive JWT  
- `GET /api/v1/videos` — list videos  
- `POST /api/v1/videos/upload` — upload/create a video (auth required)  
- `POST /api/v1/subscriptions/:channelId` — subscribe to a channel (auth)  
- `GET /api/v1/users/:id/channel` — get channel info

***other routes are in - project / routes - folder and app.js file if you want to checkout***

---

## 🔁 Response Format 

All endpoints should ideally return JSON in a consistent shape. Example:

    {
      "success": true,
      "data": { /* resource */ },
      "message": "human-readable message"
    }

Errors:

    {
      "success": false,
      "error": {
        "code": 400,
        "message": "Validation failed",
      }
    }

---


## 📦 Useful NPM Scripts (example `package.json` scripts)

    {
      "scripts": { // adjust base on project
        "start": "node index.js",
        "dev": "nodemon index.js",
        "lint": "eslint .",
        "test": "npm run test" // if tests are added
      }
    }
---

## 📸 Screenshots / Postman Examples

Add screenshots and a Postman collection export here (optional). Example placeholders:

***Postman collection for all endpoints***

![postmen](https://github.com/Harsh1234567899/backend-with-javaScript/blob/main/postman.png)

***Example response screenshots***

![App Screenshot](../backend-with-javaScript/response.png)



---


## 👤 Author

**Harsh Pankhaniya**  
GitHub: https://github.com/Harsh1234567899  
Email: pankhaniyaharsh222@gmail.com

---

