# Emergency Response System
## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Author](#author)

## Overview
Emergency Response System is a system for managing the real-time status of households during emergency situations. It enables the local emergency response team (Tzachi) to update household status, track the number of residents currently at home, and record special needs. The system also supports area-based responsibility, allowing team members to manage only the households assigned to them, while the team leader manages users and household data.
## Features
- User authentication with secure login.
- Role-based access control (Team Leader / Team Member).
- Team Leaders can manage users and household records.
- Team Leaders can assign team members to specific areas.
- Team Members can view and update only the households assigned to their area.
- Real-time household status updates.
- Track the number of residents currently at home.
- Store and display special needs for each household.
- Display household contact information.
- View the latest status of all households in a centralized dashboard.
## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Authentication & Security
- JSON Web Token (JWT)
- bcrypt

### Development Tools
- Git
- GitHub
- Visual Studio Code
- WSL (Ubuntu)

### Package Management
- npm

## Project Structure

```text
emergency-response-system
│
├── client/          # React frontend application
├── server/          # Express backend application
│   ├── prisma/      # Prisma schema and database migrations
│   └── server.js    # Backend entry point
│
└── README.md
```
## Installation
### 1. Clone the repository

```bash
git clone https://github.com/dinafk-cell/emergency-response-system.git
cd emergency-response-system
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory and add the required environment variables.

### 5. Run the backend

```bash
cd server
npm run dev
```

### 6. Run the frontend

Open a new terminal:

```bash
cd client
npm run dev
```
## Future Improvements

- SMS and WhatsApp notifications.
- Interactive map of the settlement.
- Export reports to Excel.
- Mobile-friendly interface.
- Multi-settlement support.

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/register` | Register a new user. | No |
| POST | `/login` | Authenticate a user and return a JWT token. | No |
| POST | `/import-households` | Import household data into the database. | Yes |
| GET | `/households` | Retrieve households based on the user's role and assigned area. | Yes |
| GET | `/households/:id` | Retrieve details of a specific household. | Yes |
| POST | `/households` | Create a new household. | Yes |
| PATCH | `/households/:id` | Update household information. | Yes |
| DELETE | `/households/:id` | Delete a household. | Yes |
| POST | `/statusupdate` | Create a new household status update. | Yes |
| GET | `/statusupdates` | Retrieve household status updates. | Yes |
| GET | `/current-status` | Retrieve the latest status of all households. | Yes |

## Environment Variables

Before running the backend, create a `.env` file inside the `server` directory.

Example:

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
```

### Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL database connection string. |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens. |
```