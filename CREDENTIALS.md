# Adiptify - Test Credentials

## Seed Data Credentials

After running `npm run seed` in the backend, you can use these credentials to test different roles:

### Instructor Account
- **Email:** `instructor@example.com`
- **Password:** `password123`
- **Role:** Instructor
- **Access:** Can view all students, create quizzes, see analytics

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** Admin
- **Access:** Full system access - AI logs, issue reports, user management, analytics

### Student Account
- **Note:** Students must register with a Student ID (Roll No)
- You can register a new student account via the registration page
- Or create manually in MongoDB:
  ```javascript
  {
    name: "Test Student",
    email: "student@example.com",
    passwordHash: "<bcrypt hash of password123>",
    studentId: "STU001",
    role: "student"
  }
  ```

## Quick Start

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run seed  # Creates instructor and admin users
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Login:**
   - Go to http://localhost:5173
   - Click "Login"
   - Use instructor or admin credentials above
   - For student, register first with Student ID

## Fixed Issues

✅ Student dashboard now properly fetches mastery data from `/api/auth/me`
✅ Quiz page now properly loads and saves session state
✅ Instructor and Admin dashboards are fully connected to backend
✅ All routes are properly protected by role
✅ Seed script creates instructor and admin users

