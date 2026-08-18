# BidBridge — Real-Time Auction Platform

BidBridge is a full-stack, real-time online auction platform that enables users to discover auction listings, participate in live bidding, track auctions, and manage auction activities through role-based dashboards.

The platform is built with **React.js, Python, FastAPI, MongoDB, and Socket.IO**, combining RESTful APIs with real-time communication to provide an interactive bidding experience.

## 🔗 Project Links

* **Live Demo:** `https://bidbridge-frontend.onrender.com`
* **GitHub Repository:** `https://github.com/SaswataPattanayak/BidBridge`

---

## 📌 Project Overview

BidBridge was developed as a complete auction management system supporting three primary user roles:

* **Bidder** — Browse auctions, place bids, track auctions, use watchlists, and receive notifications.
* **Seller** — Create and manage auction listings and monitor bidding activity.
* **Administrator** — Manage users, auctions, categories, and other platform activities.

The application combines a React frontend with a Python/FastAPI backend, MongoDB for persistent data storage, and Socket.IO for real-time auction and bidding updates.

---

## 🚀 Key Features

### 👤 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Access and refresh token authentication
* HTTP-only authentication cookies
* Role-based authorization
* Protected frontend routes and backend API endpoints
* Secure logout and cookie clearing
* Authentication state management

### 🔨 Real-Time Auction & Bidding

* Live auction listings
* Real-time bid updates using Socket.IO
* Bid placement and validation
* Auction status management
* Bidding activity tracking
* Live updates without requiring continuous page refreshes

### 🛒 Product & Auction Management

* Product/auction listings
* Auction categories
* Auction creation and management
* Auction status handling
* Product information and images
* Seller auction management

### ❤️ Bidder Features

* Browse available auctions
* View auction details
* Place bids
* Track bidding activity
* Watchlist functionality
* Notifications
* Personalized bidder dashboard

### 🏪 Seller Features

* Seller dashboard
* Create auction listings
* Manage products
* Monitor auction activity
* Track bids and auction status

### 🛡️ Administrator Features

* Administrative dashboard
* User management
* Auction management
* Category management
* Platform activity management
* Administrative controls over bidder and seller functionality

---

## 🏗️ System Architecture

```text
                         BidBridge
                            │
             ┌──────────────┴──────────────┐
             │                             │
      React.js Frontend              FastAPI Backend
             │                             │
             │                    ┌────────┴────────┐
             │                    │                 │
        Axios REST API        RESTful APIs     Socket.IO
             │                    │                 │
             └────────────────────┼─────────────────┘
                                  │
                                  ▼
                            MongoDB Atlas
                                  │
                                  ▼
                         Persistent Application
                              Data Storage
```

### Communication Model

**REST APIs** are used for standard application operations such as:

* Authentication
* User operations
* Auction management
* Product management
* Categories
* Watchlists
* Notifications
* Bidding operations

**Socket.IO/WebSockets** are used for real-time communication and live auction/bidding updates.

---

## 💻 Technology Stack

### Frontend

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Bootstrap/Tailwind-based UI components
* Axios
* React Router
* Socket.IO Client

### Backend

* Python
* FastAPI
* RESTful APIs
* Socket.IO
* Uvicorn
* JWT authentication

### Database

* MongoDB
* MongoDB Atlas
* MongoDB Compass during local development

### Authentication & Security

* JWT
* HTTP-only cookies
* Access tokens
* Refresh tokens
* Role-based authorization
* CORS configuration

### Development & Testing

* Git
* GitHub
* VS Code
* Postman
* MongoDB Compass

### Deployment

* Render
* MongoDB Atlas

---

## 🔐 Authentication Architecture

BidBridge uses JWT-based authentication with separate access and refresh tokens.

The authentication flow uses HTTP-only cookies to reduce direct client-side access to authentication tokens.

```text
User
 │
 ▼
Login
 │
 ▼
FastAPI Authentication API
 │
 ├── Access Token
 └── Refresh Token
        │
        ▼
   HTTP-only Cookies
        │
        ▼
Authenticated Requests
        │
        ▼
Protected FastAPI APIs
```

The production environment uses secure cookie configuration appropriate for cross-origin frontend/backend deployment.

---

## ⚡ Real-Time Bidding

One of the core technical components of BidBridge is real-time bidding.

The application uses **Socket.IO** to establish real-time communication between the React frontend and FastAPI backend.

```text
Bidder A
   │
   │ Place Bid
   ▼
React Frontend
   │
   ▼
FastAPI Backend
   │
   ├── Validate Bid
   ├── Update MongoDB
   │
   ▼
Socket.IO
   │
   ├──────────────► Bidder B
   ├──────────────► Bidder C
   └──────────────► Other Connected Users
```

This allows auction participants to receive bid-related updates without relying solely on manual page refreshes.

---

## 🗄️ Database

BidBridge uses **MongoDB** for application data storage.

The application uses collections for major platform entities, including:

* Users
* Auctions
* Bids
* Categories
* Notifications
* Watchlist
* Login attempts
* Contact submissions

During development, MongoDB Compass was used for local database management, followed by migration to **MongoDB Atlas** for the production environment.

---

## 🔌 Backend API

The backend is implemented using **FastAPI** and exposes RESTful endpoints under the `/api` prefix.

Examples of application areas handled through the API include:

```text
/api/auth/*
/api/auctions
/api/categories
/api/bids
/api/notifications
```

The Socket.IO service is mounted under:

```text
/api/socket.io
```

The backend provides the application layer connecting the React frontend, authentication system, real-time communication layer, and MongoDB database.

---

## 📁 Project Structure

```text
BidBridge/
│
├── backend/
│   ├── server.py
│   ├── auth.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ☁️ Deployment

BidBridge is deployed as separate frontend and backend services.

### Frontend

The React production build is deployed through Render.

**Live Frontend:**

`https://bidbridge-frontend.onrender.com`

### Backend

The FastAPI backend is deployed separately on Render.

**Backend:**

`https://bidbridge-backend-jf9m.onrender.com`

### Database

Production application data is stored in MongoDB Atlas.

The production architecture therefore separates:

```text
React Frontend
      │
      ▼
Render Frontend
      │
      ▼
Render FastAPI Backend
      │
      ▼
MongoDB Atlas
```

---

## 🧪 Testing & Verification

The application was tested during both local development and production deployment.

Testing included:

* Authentication flow testing
* Login/logout testing
* Protected route testing
* Access and refresh token behavior
* Cookie configuration testing
* REST API testing
* Auction functionality testing
* Bidding functionality testing
* Real-time communication testing
* Frontend/backend integration testing
* Production deployment verification

Postman and browser developer tools were used during API and authentication debugging.

---

## 🛠️ Development Challenges

During development, several production-level integration issues were investigated and resolved, including:

* Cross-origin authentication
* Secure HTTP-only cookie configuration
* Access/refresh token handling
* Logout cookie clearing
* Frontend/backend CORS configuration
* Socket.IO WebSocket connectivity
* MongoDB local-to-cloud migration
* Render frontend routing and deployment configuration

These issues provided practical experience with debugging authentication, networking, deployment, and full-stack integration problems.

---

## 🎯 What This Project Demonstrates

BidBridge demonstrates practical experience with:

* Full-stack application development
* React frontend development
* Python backend development
* FastAPI REST API development
* MongoDB database integration
* Real-time WebSocket communication
* JWT authentication
* HTTP-only cookie security
* Role-based access control
* REST API integration
* Cloud deployment
* Production debugging
* Git/GitHub version control
* Frontend/backend architecture

---

## 🔮 Future Improvements

Potential future enhancements include:

* Payment gateway integration
* Advanced auction analytics
* Email notifications
* Enhanced seller analytics
* Search and filtering improvements
* Automated auction closing workflows
* Performance and load testing
* Additional security hardening
* Automated CI/CD testing

---

## 👨‍💻 Developer

**Saswata Pattanayak**

MSc Computer Science

Interested in **Full-Stack Development, Python, Backend Development, REST APIs, Databases, and Real-Time Web Applications**.

### Connect

* **GitHub:** `https://github.com/SaswataPattanayak`
* **Live Project:** `https://bidbridge-frontend.onrender.com`

---

## 📄 License

This project is developed as a personal portfolio/project work by **Saswata Pattanayak**.

