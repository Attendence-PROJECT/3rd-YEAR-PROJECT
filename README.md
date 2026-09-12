<<<<<<< HEAD
# Smart Attendance Management System

Full-stack attendance platform with role-based access (student, teacher, admin), expiring session QR codes, camera-based scanning, MongoDB persistence, JWT authentication, and reporting dashboards.

## Features

### Student

- Register / login
- Dashboard with overall %, subject-wise %, today status, low attendance warning (< 75%)
- Scan teacher session QR via device camera
- Attendance history

### Teacher

- Login
- Create attendance session (subject, class, duration)
- Display unique expiring QR (session token only) with live countdown
- View present students in real time (polling)
- Close session manually
- Class and subject reports



### Admin

- Manage students, teachers, subjects/classes
- Overview stats and students below 75%
- Bar chart by class (Recharts)



## Tech stack


| Layer    | Technologies                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------ |
| Frontend | React 18, Vite, JSX, Tailwind CSS, React Router, Axios, `qrcode.react`, `html5-qrcode`, Recharts |
| Backend  | Node.js, Express, Mongoose, MongoDB, JWT, bcryptjs, cors, dotenv, uuid                           |




## Project structure

```
smart-attendance-system/
├── client/          # Vite React app
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/api.js
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── .env.example
├── README.md
└── .gitignore
```



## Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))



## MongoDB Atlas setup

1. Create a free cluster on MongoDB Atlas.
2. Add a database user (username/password).
3. Allow network access (IP whitelist or `0.0.0.0/0` for development).
4. Copy the connection string, e.g. `mongodb+srv://USER:PASS@cluster.mongodb.net/smart-attendance?retryWrites=true&w=majority`
5. Set it as `MONGO_URI` in `server/.env`.



## Environment variables

Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-attendance
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Optional for first admin bootstrap:

```env
ADMIN_SEED_SECRET=some-dev-secret
```



## Install & run

Open two terminals.

**Backend**

```bash
cd smart-attendance-system/server
npm install
cp .env.example .env
# edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```

**Frontend**

```bash
cd smart-attendance-system/client
npm install
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5000/api](http://localhost:5000/api)
- Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

Vite proxies `/api` to the backend during development.

## Create an admin user

Admins cannot self-register via the UI. After the server is running:

```bash
curl -X POST http://localhost:5000/api/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@school.edu\",\"password\":\"admin123\"}"
```

If `ADMIN_SEED_SECRET` is set in `.env`, include `"secret":"YOUR_SECRET"` in the JSON body.

Then sign in at `/login` as admin and create subjects, teachers, and students.

## Authentication flow

1. `POST /api/auth/register` (student/teacher) or `POST /api/auth/login` returns JWT + user profile.
2. Client stores token in `localStorage` and sends `Authorization: Bearer <token>` on every request (`client/src/services/api.js`).
3. `authenticate` middleware verifies JWT and loads the user; **role is always taken from the database/JWT**, never from the client body.
4. `authorize('admin', ...)` guards routes by role.



## QR attendance flow

1. **Teacher** calls `POST /api/sessions` with `subjectId`, `class`, optional `durationMinutes` (default 15).
2. Server creates `AttendanceSession` with unique `sessionToken` (UUID), `expiresAt`, and `status: active`.
3. Teacher UI renders QR via `qrcode.react` encoding **only the session token string** (not a permanent student QR).
4. **Student** opens Scan page; `html5-qrcode` reads the token from the camera.
5. Client calls `POST /api/attendance/mark` with `{ sessionToken }`.
6. Server validates:
  - Session exists and is `active`
  - Not expired (`expiresAt`)
  - Student class matches session class
  - No duplicate mark for same student + session (unique index)
7. Creates `Attendance` document linked to student, teacher, subject, class, session.

Camera streams are stopped and cleared on component unmount (`useQrScanner` cleanup).

## API overview


| Method   | Path                                 | Role                         |
| -------- | ------------------------------------ | ---------------------------- |
| POST     | `/api/auth/register`                 | Public (student/teacher)     |
| POST     | `/api/auth/login`                    | Public                       |
| GET      | `/api/auth/me`                       | Auth                         |
| POST     | `/api/auth/seed-admin`               | Public (guarded)             |
| CRUD     | `/api/students`                      | Admin (read: teacher)        |
| CRUD     | `/api/teachers`                      | Admin                        |
| CRUD     | `/api/subjects`                      | Admin (read: all)            |
| POST/GET | `/api/sessions`                      | Teacher                      |
| POST     | `/api/sessions/:id/close`            | Teacher                      |
| GET      | `/api/sessions/:id/attendance`       | Teacher/Admin                |
| POST     | `/api/attendance/mark`               | Student                      |
| GET      | `/api/attendance/student/:studentId` | Student (self)/Admin/Teacher |
| GET      | `/api/attendance/session/:sessionId` | Teacher/Admin                |
| GET      | `/api/reports/overview`              | Admin                        |
| GET      | `/api/reports/student/:id`           | Admin/Teacher/Student (self) |
| GET      | `/api/reports/class/:classId`        | Admin/Teacher                |
| GET      | `/api/reports/subject/:subjectId`    | Admin/Teacher                |




## Suggested test flow

1. Seed admin → login → create subject (class `CSE-A`) and optionally assign teacher.
2. Register teacher + student (same class as subject) or create via admin.
3. Teacher: start session → QR visible with countdown.
4. Student: scan QR → attendance marked → appears in teacher present list.
5. Student dashboard shows percentages; admin overview lists below-75% if applicable.



## Future improvements

- Email notifications for low attendance
- Geofencing / IP checks for scan location
- Export reports to CSV/PDF
- Refresh tokens and httpOnly cookies
- WebSocket live present list instead of polling
- Bulk import students from spreadsheet



## License

MIT (adjust as needed for your institution).
=======
# 3rd-YEAR-PROJECT
>>>>>>> 98d73d6c89cf34b5b0fa1a1cd8be083fc1875719
