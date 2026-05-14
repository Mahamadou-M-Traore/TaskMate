# ✦ TaskMate — Personal Task Manager

A full-stack web application for managing personal tasks.  
Built with **Node.js + Express**, **SQLite**, and **Vanilla JavaScript**.

---

## Features

- ✅ Create, Read, Update, Delete tasks (full CRUD)
- 🗂 Categorize tasks: Work · Personal · School · General  
- 🔍 Filter tasks by category and/or status  
- ✔️ Mark tasks as done / pending with one click  
- 📄 Interactive API documentation via Swagger UI  
- 🧪 Unit-tested business logic  

---

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | Vanilla JavaScript (SPA), HTML, CSS |
| Backend  | Node.js, Express.js             |
| Database | SQLite (via better-sqlite3)     |
| API Docs | Swagger UI / OpenAPI 3.0        |
| Testing  | Jest                            |

---

## Project Structure

```
taskmate/
├── backend/
│   ├── db/
│   │   └── database.js        # Database connection and setup
│   ├── routes/
│   │   └── tasks.js           # API route handlers (thin layer)
│   ├── services/
│   │   └── taskService.js     # Business logic (validation, CRUD)
│   ├── swagger.js             # Swagger/OpenAPI configuration
│   └── server.js              # Express app entry point
├── frontend/
│   ├── index.html             # Single-page application
│   ├── style.css              # Styles
│   └── app.js                 # Frontend JavaScript (fetch API)
├── tests/
│   └── taskService.test.js    # Unit tests for business logic
├── package.json
├── .gitignore
└── README.md
```

---

## Setup & Running

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/taskmate.git
cd taskmate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```

The app runs at **http://localhost:3000**

> For development with auto-restart: `npm run dev`

---

## API Documentation (Swagger)

After starting the server, visit:  
👉 **http://localhost:3000/api-docs**

You can explore and test all API endpoints interactively.

---

## API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | /tasks           | Get all tasks        |
| GET    | /tasks?category=Work | Filter by category |
| GET    | /tasks?status=pending | Filter by status |
| GET    | /tasks/:id       | Get task by ID       |
| POST   | /tasks           | Create a new task    |
| PUT    | /tasks/:id       | Update a task        |
| DELETE | /tasks/:id       | Delete a task        |

### Request Body (POST / PUT)

```json
{
  "title":       "Study for exam",
  "description": "Chapter 5 and 6",
  "category":    "School",
  "status":      "pending"
}
```

**Allowed values:**
- `category`: `Work` · `Personal` · `School` · `General`
- `status`: `pending` · `done`

### Example Responses

**GET /api/tasks** → 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Study for exam",
      "description": "Chapter 5 and 6",
      "category": "School",
      "status": "pending",
      "created_at": "2026-05-15 10:30:00"
    }
  ]
}
```

**POST /api/tasks** → 201 Created  
**PUT /api/tasks/:id** → 200 OK  
**DELETE /api/tasks/:id** → 200 OK  
**Validation error** → 400 Bad Request  
**Not found** → 404 Not Found  

---

## Running Tests

```bash
npm test
```

Tests use an **in-memory SQLite database** so no files are created/modified.  
Business logic is tested independently of routes and HTTP.

---

## Git Workflow

Commits follow a simple convention:
- `feat:` new feature
- `fix:` bug fix
- `test:` adding tests
- `docs:` documentation

---

## Author

**Your Name**  
Istanbul Arel University — System Analysis and Design, Spring 2026
