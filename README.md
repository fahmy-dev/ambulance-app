# Phase 4 Final Project: Ambulance App
This project contains our final project for Phase 4 - Software Engineering at Moringa School.

## Project Description
This project is an Ambulance Request App that connects patients with nearby hospitals during emergencies. Built with React for the frontend and Flask/SQLAlchemy for the backend, the application allows users to request ambulances through a map-based interface, track their ambulance in real-time, and choose between payment options. Hospitals can receive and manage incoming requests through a dedicated dashboard.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [How to Access it](#how-to-access-it)
3. [Project Structure](#project-structure)
4. [Setup](#setup)
5. [API Endpoints](#api-endpoints)
6. [License](#license)

## Prerequisites
- Visual Studio Code
- Python 3.8
- A basic understanding of Flask and SQLAlchemy

## How to Access it
1. Open your Terminal and clone this repository
- `git clone https://github.com/fahmy-dev/ambulance-app`

2. Move into the directory
- `cd ambulance-app/`

3. Open it in VSCode
- `code .`

## Project Structure

```
.  
├── client/            # Frontend React application
│   ├── src/           # Source code directory
│   │   ├── components/# React components
│   │   ├── context/   # React context providers
│   │   ├── pages/     # Page components
│   │   ├── utils/     # Utility functions
│   │   └── main.jsx   # Application entry point
│   ├── public/        # Static assets
│   └── index.html     # HTML entry point
├── server/            # Backend Flask application
│   ├── app.py         # Main application file
│   ├── models.py      # Database models
│   ├── seed.py        # Database seeding script
│   ├── migrations/    # Database migrations
│   └── requirements.txt# Python dependencies
├── LICENSE            # Project license
├── Pipfile            # Python environment config
├── build.sh           # Build script
└── README.md          # Project documentation
```

## Live Demo
You can access the live application at: https://ambulance-app-b741.onrender.com

## Setup

1. Install dependencies and activate a virtual environment:
   ```bash
   pipenv install
   pipenv shell
   ```

2. Initialize the database:
   ```bash
   cd server
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade head
   ```

3. Seed the database:
   ```bash
   python seed.py
   ```

4. Run the Flask development server:
   ```bash
   python app.py
   ```
   # Important: Edit .env.development and change VITE_API_URL to http://localhost:<your flask port> (usually http://localhost:5555, but it might be different so check your terminal when you run the flask server)
   # This ensures the frontend connects to the correct Flask backend port
   
   The server will start on http://localhost:5555 (or your specified port)

5. Set up and run the React client with Vite:
   ```bash
   cd client/
   npm install
   npm run dev
   ```
   The server will start on http://localhost:5173


## API Endpoints

All API endpoints are prefixed with the base URL of your server (e.g., `http://localhost:5555` in development).

### Authentication

#### Login
- **POST** `/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Returns access token and user data

#### Signup
- **POST** `/signup`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Returns access token and user data

#### Get Current User
- **GET** `/me`
- **Headers**: Authorization: Bearer {access_token}
- **Response**: Returns current user data

### Users

#### Create User
- **POST** `/users`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

#### Get Users
- **GET** `/user`
- **Headers**: Authorization: Bearer {access_token}
- **Query Parameters**: search (optional)

### Ride History

#### Create Ride History
- **POST** `/ride_history`
- **Headers**: Authorization: Bearer {access_token}
- **Body**:
  ```json
  {
    "hospital_name": "Hospital Name",
    "payment": "payment_method",
    "status": "status_enum"
  }
  ```

#### Get Ride History
- **GET** `/ride_history`
- **Headers**: Authorization: Bearer {access_token}

### Favorites

#### Add Favorite
- **POST** `/favorites`
- **Headers**: Authorization: Bearer {access_token}
- **Body**:
  ```json
  {
    "hospital_name": "Hospital Name"
  }
  ```

#### Get Favorites
- **GET** `/favorites`
- **Headers**: Authorization: Bearer {access_token}

#### Remove Favorite
- **DELETE** `/favorites`
- **Headers**: Authorization: Bearer {access_token}
- **Body**:
  ```json
  {
    "hospital_name": "Hospital Name"
  }
  ```

### Contact Us

#### Submit Contact Form
- **POST** `/contact_us`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "phone_number": "1234567890",
    "message": "Your message"
  }
  ```

#### Get Contact Messages
- **GET** `/contact_us`

### Ambulance Request

#### Request Ambulance
- **POST** `/request-ambulance`
- **Headers**: Authorization: Bearer {access_token}
- **Body**:
  ```json
  {
    "hospital_name": "Hospital Name",
    "payment_method": "payment_method"
  }
  ```

## License
This project is [MIT Licensed](LICENSE)
