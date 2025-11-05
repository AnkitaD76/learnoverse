# 🚀 Quick Start Guide - Learnoverse Auth

## Setup (5 minutes)

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with your values
# At minimum, set:
# - MONGO_URI (your MongoDB connection)
# - JWT_SECRET (random 32+ char string)
# - JWT_REFRESH_SECRET (random 32+ char string)

# 4. Seed database (creates roles + admin user)
npm run seed

# 5. Start server
npm run dev
```

## Default Admin Credentials

```
Email: admin@learnoverse.com
Password: Admin@123456
```

**⚠️ CHANGE THIS PASSWORD IMMEDIATELY!**

---

## API Endpoints Cheat Sheet

### Base URL

```
http://localhost:3000/api/v1
```

### Public (No Auth)

```http
POST /auth/register          # Register new user
POST /auth/verify-email      # Verify email
POST /auth/login             # Login
POST /auth/forgot-password   # Request password reset
POST /auth/reset-password    # Reset password
POST /auth/refresh-token     # Get new access token
```

### Protected (Requires Auth)

```http
# Add header to all requests:
Authorization: Bearer <access_token>

GET    /auth/me                    # Get current user
POST   /auth/logout                # Logout
PATCH  /auth/update-password       # Change password
GET    /auth/sessions              # View active sessions
POST   /auth/revoke-all-sessions   # Logout all devices

GET    /users/me                   # Get profile
PATCH  /users/me                   # Update profile
GET    /users/student/dashboard    # Student dashboard
GET    /users/instructor/dashboard # Instructor dashboard (instructor+)
GET    /users/admin/dashboard      # Admin dashboard (admin only)
GET    /users/admin/users          # List all users (admin only)
PATCH  /users/admin/users/:id/role # Update user role (admin only)
```

---

## Quick Test Flow

### 1️⃣ Register

```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

### 2️⃣ Verify Email (Dev Mode)

```bash
# In development, verification token is in registration response
POST http://localhost:3000/api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "test@example.com",
  "verificationToken": "<token_from_step_1>"
}
```

### 3️⃣ Login

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123456"
}

# Response includes accessToken - save it!
```

### 4️⃣ Access Protected Route

```bash
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer <accessToken_from_step_3>
```

---

## Roles & Access

| Role           | Can Do                                                  |
| -------------- | ------------------------------------------------------- |
| **Student**    | View courses, submit assignments, update own profile    |
| **Instructor** | Create/manage courses, view students, grade assignments |
| **Admin**      | Everything (full access)                                |

---

## Common Commands

```bash
# Development
npm run dev              # Start with nodemon

# Production
npm start                # Start server

# Database
npm run seed             # Seed roles + admin user

# Code Quality
npm run lint             # Check for issues
npm run lint:fix         # Fix issues
npm run format           # Format code with Prettier
```

---

## Environment Variables (Minimum Required)

```env
# .env file
MONGO_URI=mongodb://localhost:27017/learnoverse
JWT_SECRET=your_super_secret_key_at_least_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_key_at_least_32_characters
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Token Lifecycle

```
1. Login → Get Access Token (15 min) + Refresh Token (30 days)
2. Use Access Token for API calls
3. Access Token expires → Use Refresh Token to get new Access Token
4. Refresh Token expires → Must login again
```

### How to Refresh Token

```bash
POST http://localhost:3000/api/v1/auth/refresh-token
# Cookie sent automatically OR
x-refresh-token: <refresh_token>
```

---

## Protect Your Routes

### Simple Auth (any logged-in user)

```javascript
import { authenticate } from '../middleware/authenticate.js';

router.get('/my-route', authenticate, async (req, res) => {
    // req.user has: userId, name, email, role
    res.json({ user: req.user });
});
```

### Role-Based (specific roles)

```javascript
import { authenticate } from '../middleware/authenticate.js';
import authorizePermissions from '../utils/authorizePermissions.js';

// Admin only
router.delete(
    '/users/:id',
    authenticate,
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    async (req, res) => {
        // Only admins here
    }
);

// Instructor and Admin
router.post(
    '/courses',
    authenticate,
    authorizePermissions([{ resource: 'courses', action: 'create' }]),
    async (req, res) => {
        // Instructors and admins can create courses
    }
);
```

---

## Troubleshooting

### "JWT_SECRET not defined"

→ Create `.env` file with JWT_SECRET

### "Cannot connect to MongoDB"

→ Check MONGO_URI in `.env` and MongoDB is running

### "Token expired"

→ Use `/auth/refresh-token` endpoint

### "Account locked"

→ Wait 2 hours or reset in database

### Email not sending

→ Check email config in `.env`, use App Password for Gmail

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123456"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123456"}'

# Get profile (replace TOKEN)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## Project Structure

```
server/
├── src/
│   ├── models/           # Database schemas
│   │   ├── User.js       # User with auth fields
│   │   ├── Role.js       # Roles with permissions
│   │   └── RefreshToken.js
│   ├── controllers/      # Business logic
│   │   └── auth.controller.js
│   ├── routers/          # Route definitions
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── middleware/       # Auth, error handling
│   │   ├── authenticate.js
│   │   └── error-handler.js
│   ├── utils/            # Helper functions
│   │   ├── jwt.js
│   │   └── authorizePermissions.js
│   └── server.js         # Express app
└── package.json
```

---

## Security Features ✅

- ✅ Bcrypt password hashing
- ✅ JWT tokens (15 min access, 30 day refresh)
- ✅ Token rotation
- ✅ Account lockout (5 failed attempts)
- ✅ Email verification
- ✅ Password reset
- ✅ Role-based access control
- ✅ httpOnly cookies
- ✅ CORS protection
- ✅ Rate limiting
- ✅ XSS protection
- ✅ NoSQL injection prevention

---

## Next Steps

1. ✅ Test all endpoints
2. ✅ Change admin password
3. ✅ Configure email (if needed)
4. ✅ Add your business logic
5. ✅ Deploy to production

📚 **Full Documentation**: `AUTH_DOCUMENTATION.md`

🎉 Happy coding!
