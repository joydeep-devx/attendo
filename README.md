# 🏫 Smart Classroom Management System

An **AI-powered Smart Classroom Management System** that automates student attendance using computer vision and provides a centralized platform for **attendance monitoring, AI-based timetable generation, classroom occupancy tracking, and resource management**.

The goal is to reduce manual classroom administration and provide teachers and administrators with real-time, data-driven insights.



## 🚀 Key Features

### 📸 AI-Based Attendance

* Automatic student detection using classroom cameras
* Face detection and face recognition
* Student identification using face embeddings
* Automatic attendance marking
* Duplicate attendance prevention
* Attendance history and records

### 📊 Real-Time Attendance Dashboard

* Total students
* Present/absent count
* Attendance percentage
* Subject-wise attendance
* Student-wise attendance history
* Daily/monthly attendance reports

### 🗓️ AI Timetable Generation

Automatically generates optimized timetables based on:

* Faculty availability
* Subject requirements
* Classroom availability
* Lab requirements
* Room capacity
* Working days and periods
* Faculty workload
* Section/batch requirements

The generated timetable aims to avoid:

* Teacher conflicts
* Classroom conflicts
* Lab conflicts
* Time-slot conflicts
* Capacity violations

### 🏫 Classroom Occupancy Monitoring

* Real-time classroom occupancy
* Student/person counting
* Room capacity monitoring
* Occupancy percentage
* Available/occupied classroom status

### 💻 Classroom Resource Management

Manage classroom resources such as:

* Projectors
* Smart boards
* Computers
* Labs
* AC
* Microphones
* Other classroom equipment

Resources can be tracked using statuses such as:

`Available` → `In Use` → `Maintenance`

### 🔐 Centralized Management

The platform can support different user roles:

* Admin
* Teacher
* Student

Each role gets access to the features relevant to them.


# 🏗️ System Architecture

```text
                         SMART CLASSROOM SYSTEM
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        React Frontend       Node.js Backend       AI Service
              │                   │                   │
              │                   │            ┌──────┴──────┐
              │                   │            │             │
              │                   │            ▼             ▼
              │                   │       Face System    Occupancy
              │                   │
              │                   ▼
              │              REST APIs
              │                   │
              └───────────────────┤
                                  ▼
                            Database Layer
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
         Students            Attendance          Timetable
                                                  Resources
```



# 📁 Project Structure

```text
smart-classroom-management/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── ai-service/
│   ├── src/
│   │   ├── face_detection/
│   │   ├── face_recognition/
│   │   ├── embeddings/
│   │   ├── camera/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── database/
│
├── README.md
└── .gitignore
```



# 📂 Folder Responsibilities

## Backend

The backend handles the main application logic and APIs.

```text
backend/src/
```

### `config/`

Database configuration, environment configuration, and other application configuration.

### `controllers/`

Handles incoming API requests and sends responses.

Example:

```text
studentController.js
attendanceController.js
timetableController.js
```

### `middlewares/`

Middleware functions such as:

* Authentication
* Authorization
* Error handling
* Request validation

### `models/`

Database models/schema definitions.

Example:

```text
Student
Teacher
Attendance
Timetable
Room
Resource
```

### `routes/`

Defines API endpoints.

Example:

```text
/api/auth
/api/students
/api/attendance
/api/timetable
/api/rooms
/api/resources
```

### `services/`

Contains business logic that should not directly live inside controllers.

### `utils/`

Reusable helper functions.

### `app.js`

Creates and configures the Express application.

### `server.js`

Starts the backend server.



# 🤖 AI Service

The AI service is responsible for computer vision and AI-related processing.

```text
ai-service/src/
```

### `face_detection/`

Responsible for detecting faces from camera frames.

```text
Camera Frame
     ↓
Face Detection
     ↓
Detected Faces
```

### `face_recognition/`

Identifies detected faces against registered students.

```text
Detected Face
      ↓
Face Recognition
      ↓
Student Identity
```

### `embeddings/`

Creates and manages face embeddings used for recognition.

### `camera/`

Handles camera input and video streams.

### `services/`

AI processing logic and communication with the backend.

### `main.py`

Entry point for the AI service.



# 🎨 Frontend

The frontend provides the user interface.

```text
frontend/src/
```

### `components/`

Reusable UI components.

Examples:

```text
Navbar
Sidebar
AttendanceCard
StudentTable
TimetableTable
RoomCard
```

### `pages/`

Application pages.

Example:

```text
Login
Dashboard
Attendance
Students
Timetable
Classrooms
Resources
```

### `services/`

Frontend API communication.

Example:

```text
authService.js
attendanceService.js
timetableService.js
studentService.js
```

### `hooks/`

Reusable React hooks.

### `App.jsx`

Main React application component and routing setup.



# 📚 Documentation

```text
docs/
├── architecture/
├── api/
└── database/
```

### `architecture/`

System architecture and technical design.

### `api/`

API documentation.

### `database/`

Database schema, relationships, and ER diagrams.


# 🛠️ Technology Stack

## Frontend

* React.js
* JavaScript
* Tailwind CSS
* Axios
* Chart.js

## Backend

* Node.js
* Express.js
* JavaScript
* REST API

## AI / Computer Vision

* Python
* OpenCV
* Face Detection
* Face Recognition
* Face Embeddings
* Person/Occupancy Detection

## Database

The database layer can be implemented using a relational database such as:

* PostgreSQL
* MySQL

## Development Tools

* Git
* GitHub
* VS Code
* Postman



# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd smart-classroom-management
```



# 🔧 Backend Setup

Go to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure your `.env` file.

Example:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
AI_SERVICE_URL=http://localhost:8000
```

Start development server:

```bash
npm run dev
```



# 🤖 AI Service Setup

Open a new terminal.

```bash
cd ai-service
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it.

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create environment file:

```bash
cp .env.example .env
```

Start the AI service:

```bash
python src/main.py
```



# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Start development server:

```bash
npm run dev
```



# 🔐 Environment Variables

**Never commit `.env` files to GitHub.**

Use:

```text
.env.example
```

for variables that other developers need.

Example:

```env
PORT=
DATABASE_URL=
JWT_SECRET=
AI_SERVICE_URL=
```

Each developer should create their own:

```text
.env
```

from:

```text
.env.example
```



# 🌿 Git & GitHub Team Workflow

## Important Rule

### ❌ DO NOT directly work on `main`

The `main` branch should contain stable code.

Every team member should create their own feature branch.



# 👥 Recommended Branch Structure

```text
main
│
├── feature/backend-auth
├── feature/backend-attendance
├── feature/backend-timetable
├── feature/ai-face-recognition
├── feature/ai-occupancy
├── feature/frontend-dashboard
├── feature/frontend-attendance
└── feature/frontend-timetable
```



# 🚀 Team Member Workflow

## Step 1 — Clone the repository

Each team member does this only once:

```bash
git clone <YOUR_REPOSITORY_URL>
cd smart-classroom-management
```



## Step 2 — Check the current branch

```bash
git branch
```

You should normally see:

```text
* main
```


## Step 3 — Get the latest code

Before starting new work:

```bash
git checkout main
git pull origin main
```


# 🌱 Step 4 — Create Your Own Branch

For example, if you are working on attendance:

```bash
git checkout -b feature/backend-attendance
```

Or:

```bash
git switch -c feature/backend-attendance
```

Now your work is isolated from everyone else's work.


# 💻 Step 5 — Work Only on Your Assigned Module

Example:

```text
Developer 1
→ Backend Authentication

Developer 2
→ Face Recognition

Developer 3
→ Attendance API

Developer 4
→ React Dashboard

Developer 5
→ Timetable Generator
```

Avoid modifying unrelated files.



# 📦 Step 6 — Check Your Changes

```bash
git status
```

Review what changed:

```bash
git diff
```



# 💾 Step 7 — Commit Your Changes

Add your files:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: add attendance API"
```

Recommended commit format:

```text
feat: add attendance API
fix: resolve attendance duplicate issue
docs: update API documentation
refactor: improve timetable service
style: update dashboard UI
test: add attendance tests
```



# ☁️ Step 8 — Push Your Branch

```bash
git push -u origin feature/backend-attendance
```



# 🔀 Step 9 — Create Pull Request

Go to GitHub.

You will see:

```text
Compare & pull request
```

Create a Pull Request:

```text
feature/backend-attendance
              ↓
            main
```

Add a clear description:

```text
## What was added?

- Added attendance API
- Added attendance model
- Added attendance controller
- Added attendance routes

## Testing

- Tested POST attendance
- Tested GET attendance
```


# 👀 Step 10 — Code Review

Another team member should review the Pull Request.

If everything is correct:

```text
Approve
   ↓
Merge
   ↓
main
```

If changes are requested:

```text
Developer fixes code
        ↓
git add .
git commit
git push
        ↓
Pull Request automatically updates
```



# 🔄 Step 11 — Update Your Branch

Before starting another task, always update from `main`.

```bash
git checkout main
git pull origin main
```

Then create a new branch:

```bash
git checkout -b feature/new-feature
```



# ⚠️ Handling Merge Conflicts

If Git shows:

```text
CONFLICT
```

Don't panic.

First update your branch:

```bash
git checkout main
git pull origin main
```

Then switch back:

```bash
git checkout feature/your-branch
```

Merge the latest main:

```bash
git merge main
```

Git will show the conflicting files.

You may see:

```text
<<<<<<< HEAD
Your code
=======
Other developer's code
>>>>>>> main
```

Decide which code should remain.

Then:

```bash
git add .
git commit -m "fix: resolve merge conflict"
git push
```



# 🧑‍💻 Recommended Team Division

For this project, divide the team by modules.

### Team Member 1 — Backend

```text
backend/
├── config/
├── models/
├── controllers/
├── routes/
└── services/
```

Responsible for:

* Authentication
* Student APIs
* Attendance APIs
* Timetable APIs
* Room APIs
* Resource APIs


### Team Member 2 — AI / Face Recognition

```text
ai-service/
├── face_detection/
├── face_recognition/
└── embeddings/
```

Responsible for:

* Camera input
* Face detection
* Face recognition
* Face embeddings
* Student identification



### Team Member 3 — AI / Occupancy + Timetable

```text
ai-service/
├── camera/
└── services/
```

Responsible for:

* Person detection
* Occupancy calculation
* Timetable optimization
* Scheduling constraints


### Team Member 4 — Frontend

```text
frontend/
├── components/
├── pages/
├── services/
└── hooks/
```

Responsible for:

* Dashboard
* Attendance UI
* Timetable UI
* Classroom UI
* Resource management UI



### Team Member 5 — Integration / Testing

Responsible for:

* Connecting frontend + backend
* Connecting backend + AI service
* API testing
* Bug fixing
* Documentation



# 🔗 Service Communication

The architecture should follow:

```text
                React Frontend
                      │
                      │ HTTP/REST
                      ▼
                Node.js Backend
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
         Database          AI Service
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                  Camera     Face       Occupancy
                             AI
```

The frontend should **not directly access the database**.

Instead:

```text
Frontend
   ↓
Backend API
   ↓
Database
```

Similarly, AI results should preferably go through the backend:

```text
Camera
 ↓
AI Service
 ↓
Backend API
 ↓
Database
 ↓
Frontend
```


# 📌 Development Rules

1. Never push directly to `main`.
2. Create a feature branch before coding.
3. Pull the latest `main` before starting work.
4. Keep commits small and meaningful.
5. Don't commit `.env`.
6. Don't commit `node_modules`.
7. Don't commit Python virtual environments.
8. Don't modify another developer's module without discussion.
9. Create a Pull Request before merging.
10. At least one team member should review the PR.
11. Test your code before pushing.
12. Keep API contracts documented.



# 🚫 Files That Should NOT Be Committed

```text
.env
node_modules/
venv/
__pycache__/
*.pyc
.DS_Store
```

Example root `.gitignore`:

```gitignore
# Environment
.env
.env.*

# Node
node_modules/

# Python
venv/
.venv/
__pycache__/
*.pyc

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

Keep `.env.example` committed.


# 🧪 Testing

Before creating a Pull Request:

### Backend

```bash
npm test
```

### Frontend

```bash
npm test
```

### AI

```bash
pytest
```

If a test command is not configured yet, add the appropriate testing framework before relying on it in CI.


# 📖 API Documentation

API documentation should be maintained inside:

```text
docs/api/
```

Example:

```text
POST /api/auth/login
POST /api/students
GET  /api/students
POST /api/attendance
GET  /api/attendance
POST /api/timetable/generate
GET  /api/timetable
GET  /api/rooms
GET  /api/resources
```



# 🔮 Future Enhancements

* Mobile application
* Parent attendance notifications
* Email/SMS notifications
* Advanced attendance analytics
* Predictive absenteeism analysis
* Voice-based classroom assistant
* Automated timetable re-generation
* IoT-based classroom sensors
* Smart energy management
* Cloud deployment
* Multi-institution support



# 🎯 Project Goal

The ultimate goal of the Smart Classroom Management System is to create a **single intelligent platform for classroom administration**, where attendance, timetables, classroom occupancy, and resources can be monitored and managed efficiently.

```text
             SMART CLASSROOM
                    │
       ┌────────────┼────────────┐
       │            │            │
   Attendance   Timetable    Resources
       │            │            │
       └────────────┼────────────┘
                    │
              AI + Analytics
                    │
              Central Platform
```



# 🤝 Contributing

We welcome contributions from all team members.

Please follow the development workflow:

```text
Pull latest main
       ↓
Create feature branch
       ↓
Develop
       ↓
Test
       ↓
Commit
       ↓
Push branch
       ↓
Create Pull Request
       ↓
Code Review
       ↓
Merge into main
```

For major architectural changes, discuss the change with the team before implementation.



# 📜 License

This project is developed for educational and project purposes.

Add an appropriate open-source license here if the project is intended for public distribution.



# 👨‍💻 Team

**Smart Classroom Management System**

Built with ❤️ using AI, Computer Vision, Web Technologies, and Data Management.
