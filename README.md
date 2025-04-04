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
├── client/
├── server/             # Application directory
│   ├── app.py          # Main application file
│   ├── models.py       # Database models
│   ├── routes.py       # API routes and resources
│   └── seed.py         # Database seeding script
├── LICENSE             # Project license
├── Pipfile             # Project dependencies
├── README.md           # Project documentation
```

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
   The server will start on http://localhost:5555

5. Set up and run the React client with Vite:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   The server will start on http://localhost:5173


## API Endpoints


## License
This project is [MIT Licensed](LICENSE)
