# Project Desk

A small team project-management app for creating projects, organizing tasks, assigning work, and tracking progress.

The repository has two applications:

- `Back`: Express API with MySQL
- `Front`: React and Vite dashboard

## Technologies

- Node.js and Express
- MySQL with `mysql2`
- React 19 and Vite
- Tailwind CSS
- JWT authentication
- `bcryptjs` password hashing

## Setup

### Requirements

- Node.js 20 or newer
- MySQL, or a hosted MySQL-compatible database
- npm

### Backend

```powershell
cd Back
npm install
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=http://localhost:5173
```

For a hosted database, use `DATABASE_URL` instead of the individual `DB_*` values:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl=true
```

Passwords with special characters must be URL-encoded. For example, `@` becomes `%40`.

### Frontend

```powershell
cd Front
npm install
```

The local Vite server proxies `/auth`, `/projects`, and `/tasks` to `http://localhost:3000`.

For a deployed frontend, set:

```env
VITE_API_URL=https://your-backend.example.com
```

You can copy `Front/.env.example` and replace the example URL.

## Database Setup

1. Create a database named `rtest` locally, or create a database on your hosted provider.
2. Open `Back/DbInitSqlScript.txt` in your MySQL client or provider SQL editor.
3. Run the complete script once.
4. Confirm that the tables `users`, `projects`, `project_members`, and `tasks` exist.

The script also creates the indexes used for project and task lookups.

There are currently no versioned migrations. If the schema changes, update `DbInitSqlScript.txt` and apply the change manually to existing databases.

## Run The Project

Start the backend in one terminal:

```powershell
cd Back
npm run server
```

The API runs on `http://localhost:3000`.

Start the frontend in another terminal:

```powershell
cd Front
npm run dev
```

The dashboard runs on `http://localhost:5173`.

Build the frontend for production:

```powershell
cd Front
npm run build
```

## API

All endpoints except registration and login require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Log in and receive a JWT |
| `GET` | `/auth/me` | Get the current user profile |
| `PATCH` | `/auth/me` | Update the current user profile |
| `GET` | `/auth/users/search?q=...` | Search users for project membership |

### Projects

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/projects` | List projects the user belongs to |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects/:projectId` | Get a project |
| `PATCH` | `/projects/:projectId` | Update a project; owner only |
| `DELETE` | `/projects/:projectId` | Delete a project; owner only |
| `GET` | `/projects/:projectId/members` | List project members |
| `POST` | `/projects/:projectId/members` | Add a member; owner only |
| `DELETE` | `/projects/:projectId/members/:memberId` | Remove a member; owner only |

To add a member, send:

```json
{
  "user_id": 12
}
```

The frontend searches for the user by username or email and sends the selected ID internally.

### Tasks

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/tasks?project_id=1` | List tasks visible to the user |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks/:taskId` | Get a task |
| `PATCH` | `/tasks/:taskId` | Update task details |
| `DELETE` | `/tasks/:taskId` | Delete a task |
| `PATCH` | `/tasks/:taskId/status` | Change task status |
| `PATCH` | `/tasks/:taskId/assignee` | Assign or unassign a task |

Supported task statuses:

```text
todo
in_progress
done
```

Supported priorities:

```text
low
medium
high
```

## Database Design

### `users`

Stores accounts and hashed passwords. Usernames and email addresses are unique.

### `projects`

Stores project names and descriptions. Each project has one owner through `owner_id`.

### `project_members`

Connects users to projects. It stores the member role (`owner` or `member`) and prevents duplicate membership.

### `tasks`

Stores work items inside projects. Each task has a status, priority, creator, optional assignee, and optional due date.

Relationships:

```text
users 1 ---- many projects       (owner)
users many - many projects        (project_members)
projects 1 - many tasks
users 1 ---- many tasks           (created_by)
users 1 ---- many tasks           (assigned_to, optional)
```

Deleting a project deletes its membership records and tasks. Deleting an assigned user clears the task assignment.

## Assumptions And Additional Features

- Project and task routes are protected by JWT authentication.
- Only project owners can edit or delete projects and manage members.
- A user must belong to a project to view or modify its tasks.
- Passwords are hashed with bcrypt and are never returned by the API.
- The frontend stores the JWT in `localStorage` so login persists across refreshes.
- The dashboard supports project CRUD, task CRUD, task status and priority, assignment, due dates, member management, profile editing, loading states, and error messages.
- The backend supports CORS through the `FRONTEND_URL` environment variable.


