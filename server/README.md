# DOTS Daily Backend

This backend is built with Node.js, Express, TypeScript, MySQL, JWT authentication, and role-based authorization.

## Setup

1. Copy the example environment file:

```bash
cd server
copy .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Create the database and apply the schema:

```sql
CREATE DATABASE dots_daily CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dots_daily;
SOURCE database/schema.sql;
```

4. Start the backend:

```bash
npm run dev
```

## API routes

- `POST /api/auth/login` — login with email/password
- `POST /api/auth/signup` — create a new user
- `GET /api/auth/me` — get authenticated user profile
- `PUT /api/auth/profile` — update profile for current user
- `GET /api/users` — admin only, list users
- `GET /api/users/:id` — admin or self, get a user profile
- `POST /api/users` — admin only, create a user
- `PUT /api/users/:id` — admin only, update a user
- `DELETE /api/users/:id` — admin only, delete a user
- `GET /api/auth-logs` — admin only, read authentication audit logs

## Notes

- The backend uses JWT tokens returned from login/signup.
- Set `JWT_SECRET` in `.env` to a strong secret before running in production.
- The default frontend origin is `http://localhost:5173`.
