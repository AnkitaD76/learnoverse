# Learnoverse - Authentication & Authorization System

## 🎯 Overview

This is a **production-grade role-based authentication and authorization system** built with:

- **Express.js** (v5.1.0)
- **MongoDB** with Mongoose (v8.19.2)
- **JWT** for access tokens (15 min expiry)
- **Refresh Tokens** stored in database (30 days expiry)
- **bcryptjs** for password hashing
- **Role-Based Access Control (RBAC)** with 3 roles: Admin, Instructor, Student

---

## 🏗️ Architecture

### **Authentication Flow**

```
1. User Registration
   ↓
2. Email Verification (optional in dev, required in production)
   ↓
3. Login → Access Token (15 min) + Refresh Token (30 days)
   ↓
4. Access Protected Routes (with Access Token in Authorization header)
   ↓
5. Token Expires → Use Refresh Token to get new Access Token
   ↓
6. Logout → Revoke Refresh Token
```

### **Token Strategy**

- **Access Token**: Short-lived (15 min), sent in response, stored client-side
- **Refresh Token**: Long-lived (30 days), stored in database + httpOnly cookie
- **Token Rotation**: Refresh tokens are rotated on use for security
- **Revocation**: Refresh tokens can be revoked (logout, password change, etc.)

---

## 📁 Project Structure

```
server/
├── src/
│   ├── models/
│   │   ├── User.js              # User model with auth fields
│   │   ├── Role.js              # Role model with permissions
│   │   ├── RefreshToken.js      # Refresh token storage
│   │   └── Profile.js           # Extended profile (optional)
│   ├── controllers/
│   │   └── auth.controller.js   # All authentication logic
│   ├── routers/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   └── user.routes.js       # Protected user endpoints
│   ├── middleware/
│   │   ├── authenticate.js      # JWT verification middleware
│   │   └── error-handler.js     # Global error handler
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   ├── authorizePermissions.js  # RBAC middleware
│   │   ├── createTokenUser.js   # Token payload creator
│   │   ├── createHash.js        # SHA256 hashing
│   │   ├── sendVerificationEmail.js
│   │   ├── sendResetPasswordEmail.js
│   │   └── seedDatabase.js      # Database seeder
│   └── server.js                # Express app setup
└── package.json
```

---

## 🚀 Getting Started

### **1. Install Dependencies**

```bash
cd server
npm install
```

### **2. Configure Environment Variables**

Create `.env` file in `server/` directory:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/learnoverse
# OR use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/learnoverse

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters_long

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@learnoverse.com
```

**⚠️ Security Note**: Generate strong random secrets for production:

```bash
# In Node.js REPL or terminal:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **3. Seed Database**

Seed default roles and create admin user:

```bash
npm run seed
```

This creates:

- ✅ Roles: `admin`, `instructor`, `student`
- ✅ Admin user: `admin@learnoverse.com` / `Admin@123456`

**⚠️ Change the admin password immediately after first login!**

### **4. Start Server**

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

---

## 📚 API Documentation

### **Base URL**: `http://localhost:3000/api/v1`

---

## 🔓 Public Endpoints (No Authentication Required)

### **1. Register User**

**POST** `/auth/register`

**Request Body**:

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "age": 25,
    "gender": "male",
    "location": {
        "country": "USA",
        "state": "California",
        "city": "San Francisco"
    },
    "occupation": "Software Engineer"
}
```

**Response** (201):

```json
{
    "success": true,
    "message": "Registration successful! Please check your email to verify your account.",
    "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student"
    }
}
```

**Notes**:

- First registered user becomes `admin` automatically
- Demographics (age, gender, location, occupation) are optional
- Password must be at least 8 characters
- Email verification required in production

---

### **2. Verify Email**

**POST** `/auth/verify-email`

**Request Body**:

```json
{
    "email": "john@example.com",
    "verificationToken": "abc123...xyz"
}
```

**Response** (200):

```json
{
    "success": true,
    "message": "Email verified successfully! You can now login."
}
```

---

### **3. Login**

**POST** `/auth/login`

**Request Body**:

```json
{
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

**Response** (200):

```json
{
    "success": true,
    "user": {
        "name": "John Doe",
        "userId": "673abc123...",
        "role": "student",
        "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Headers/Cookies**:

- `Set-Cookie: refreshToken=...` (httpOnly, secure in production)

**Notes**:

- Access token expires in 15 minutes
- Refresh token stored in httpOnly cookie (expires in 30 days)
- Account locked after 5 failed attempts (2 hours)

---

### **4. Refresh Access Token**

**POST** `/auth/refresh-token`

**Headers**: (optional, if not in cookie)

```
x-refresh-token: <refresh_token>
```

**Cookies**:

- `refreshToken` (sent automatically by browser)

**Response** (200):

```json
{
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "name": "John Doe",
        "userId": "673abc123...",
        "role": "student",
        "email": "john@example.com"
    }
}
```

**Notes**:

- Old refresh token is revoked, new one issued (rotation)
- Use when access token expires

---

### **5. Forgot Password**

**POST** `/auth/forgot-password`

**Request Body**:

```json
{
    "email": "john@example.com"
}
```

**Response** (200):

```json
{
    "success": true,
    "message": "If an account exists with that email, a password reset link has been sent."
}
```

**Notes**:

- Same response regardless of email existence (security)
- Reset token valid for 10 minutes

---

### **6. Reset Password**

**POST** `/auth/reset-password`

**Request Body**:

```json
{
    "email": "john@example.com",
    "token": "reset_token_from_email",
    "password": "NewSecurePass123!"
}
```

**Response** (200):

```json
{
    "success": true,
    "message": "Password reset successfully! Please login with your new password."
}
```

**Notes**:

- All existing sessions are revoked (force re-login)

---

## 🔒 Protected Endpoints (Authentication Required)

**All protected endpoints require**:

```
Authorization: Bearer <access_token>
```

---

### **7. Get Current User**

**GET** `/auth/me`

**Response** (200):

```json
{
    "success": true,
    "user": {
        "_id": "673abc123...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "age": 25,
        "gender": "male",
        "location": {
            "country": "USA",
            "state": "California",
            "city": "San Francisco"
        },
        "occupation": "Software Engineer",
        "isVerified": true,
        "status": "active",
        "createdAt": "2025-11-05T10:30:00.000Z",
        "updatedAt": "2025-11-05T10:30:00.000Z"
    }
}
```

---

### **8. Logout**

**POST** `/auth/logout`

**Response** (200):

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

**Notes**:

- Revokes refresh token from database
- Clears refresh token cookie

---

### **9. Update Password**

**PATCH** `/auth/update-password`

**Request Body**:

```json
{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
}
```

**Response** (200):

```json
{
    "success": true,
    "message": "Password updated successfully"
}
```

**Notes**:

- Requires current password verification
- Revokes all other sessions (except current)

---

### **10. Get Active Sessions**

**GET** `/auth/sessions`

**Response** (200):

```json
{
    "success": true,
    "count": 2,
    "sessions": [
        {
            "_id": "673session1...",
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
            "ipAddress": "192.168.1.100",
            "device": "Desktop",
            "createdAt": "2025-11-05T10:30:00.000Z"
        }
    ]
}
```

---

### **11. Revoke All Sessions**

**POST** `/auth/revoke-all-sessions`

**Response** (200):

```json
{
    "success": true,
    "message": "All sessions revoked successfully. Please login again."
}
```

**Notes**:

- Logs out from all devices
- Useful if account is compromised

---

## 👤 User Profile Endpoints

### **12. Get My Profile**

**GET** `/users/me`

**Response**: Same as `/auth/me`

---

### **13. Update My Profile**

**PATCH** `/users/me`

**Request Body**:

```json
{
    "name": "John Updated",
    "age": 26,
    "occupation": "Senior Software Engineer"
}
```

**Response** (200):

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "user": {
        /* updated user */
    }
}
```

**Allowed fields**: `name`, `age`, `gender`, `location`, `occupation`
**Not allowed**: `email`, `password`, `role` (use specific endpoints)

---

## 👨‍🎓 Student Dashboard

### **14. Student Dashboard**

**GET** `/users/student/dashboard`

**Access**: Any authenticated user

**Response** (200):

```json
{
    "success": true,
    "message": "Welcome to Student Dashboard",
    "user": {
        "name": "John Doe",
        "role": "student"
    },
    "features": [
        "View enrolled courses",
        "Access course materials",
        "Submit assignments",
        "Track your progress"
    ]
}
```

---

## 👨‍🏫 Instructor Endpoints

### **15. Instructor Dashboard**

**GET** `/users/instructor/dashboard`

**Access**: `instructor` and `admin` roles

**Response** (200):

```json
{
    "success": true,
    "message": "Welcome to Instructor Dashboard",
    "user": {
        "name": "Jane Teacher",
        "role": "instructor"
    },
    "features": [
        "Create and manage courses",
        "View student progress",
        "Manage assignments and grades",
        "Upload course content"
    ]
}
```

---

## 👑 Admin Endpoints

### **16. Admin Dashboard**

**GET** `/users/admin/dashboard`

**Access**: `admin` role only

**Response** (200):

```json
{
    "success": true,
    "dashboard": {
        "statistics": {
            "totalUsers": 150,
            "adminCount": 2,
            "instructorCount": 15,
            "studentCount": 133,
            "verifiedUsers": 145,
            "unverifiedUsers": 5
        },
        "recentUsers": [
            {
                "_id": "673abc...",
                "name": "Recent User",
                "email": "recent@example.com",
                "role": "student",
                "isVerified": true,
                "createdAt": "2025-11-05T10:30:00.000Z"
            }
        ]
    }
}
```

---

### **17. Get All Users**

**GET** `/users/admin/users`

**Access**: `admin` role only

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 20)
- `role` (filter: admin/instructor/student)
- `status` (filter: active/inactive/suspended/deleted)
- `search` (search in name and email)

**Example**: `/users/admin/users?page=1&limit=10&role=student&search=john`

**Response** (200):

```json
{
    "success": true,
    "count": 10,
    "total": 133,
    "page": 1,
    "pages": 14,
    "users": [
        {
            "_id": "673abc...",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "student",
            "status": "active",
            "isVerified": true,
            "createdAt": "2025-11-05T10:30:00.000Z"
        }
    ]
}
```

---

### **18. Update User Role**

**PATCH** `/users/admin/users/:id/role`

**Access**: `admin` role only

**Request Body**:

```json
{
    "role": "instructor"
}
```

**Response** (200):

```json
{
    "success": true,
    "message": "User role updated successfully",
    "user": {
        /* updated user */
    }
}
```

**Valid roles**: `admin`, `instructor`, `student`

---

## 🔐 Roles & Permissions

### **Role Hierarchy**

| Role           | Level | Description                                                                 |
| -------------- | ----- | --------------------------------------------------------------------------- |
| **Admin**      | 100   | Full system access. Can manage everything.                                  |
| **Instructor** | 50    | Can create/manage courses, content, assignments, grades. Can view students. |
| **Student**    | 10    | Can view courses, content, submit assignments, update own profile.          |

### **Permission Matrix**

| Resource          | Admin     | Instructor | Student            |
| ----------------- | --------- | ---------- | ------------------ |
| **All Resources** | ✅ Manage | ❌         | ❌                 |
| **Courses**       | ✅ CRUD   | ✅ CRUD    | 📖 Read            |
| **Content**       | ✅ CRUD   | ✅ CRUD    | 📖 Read            |
| **Assignments**   | ✅ CRUD   | ✅ CRUD    | 📖 Read, ✍️ Submit |
| **Grades**        | ✅ CRUD   | ✅ CRU     | 📖 Read (own)      |
| **Students**      | ✅ CRUD   | 📖 Read    | 📖 Read (own)      |
| **Users**         | ✅ CRUD   | ❌         | ❌                 |
| **Profile**       | ✅ All    | ✅ Own     | ✅ Own             |

**Legend**: CRUD = Create, Read, Update, Delete

---

## 🛡️ Security Features

### **1. Password Security**

- ✅ Bcrypt hashing with salt (10 rounds)
- ✅ Minimum 8 characters
- ✅ Never returned in API responses
- ✅ Hashed before saving to database

### **2. Token Security**

- ✅ Access tokens: 15 min expiry (short-lived)
- ✅ Refresh tokens: 30 days expiry, stored in database
- ✅ Token rotation on refresh
- ✅ httpOnly cookies for refresh tokens
- ✅ Signed cookies to prevent tampering
- ✅ Token revocation support

### **3. Authentication Protection**

- ✅ Account lockout after 5 failed attempts (2 hours)
- ✅ Email verification (production)
- ✅ Password reset with expiring tokens (10 min)
- ✅ Device/IP tracking for sessions
- ✅ Logout from all devices

### **4. Authorization**

- ✅ Role-based access control (RBAC)
- ✅ Permission checks on protected routes
- ✅ Admin bypass for all restrictions

### **5. Input Validation**

- ✅ Email validation
- ✅ Password strength requirements
- ✅ Age validation (13-120)
- ✅ MongoDB schema validation

### **6. Infrastructure Security**

- ✅ Helmet.js (HTTP headers)
- ✅ CORS configuration
- ✅ Rate limiting (100 req/15 min)
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ XSS protection
- ✅ Request size limits (10kb)

### **7. Error Handling**

- ✅ Custom error classes
- ✅ Secure error messages (no sensitive info)
- ✅ MongoDB error handling
- ✅ Validation error formatting

---

## 🧪 Testing with Postman/Thunder Client

### **Setup**

1. Import environment variables:
    - `BASE_URL`: `http://localhost:3000/api/v1`
    - `ACCESS_TOKEN`: (set after login)

2. Enable cookie handling in Postman

### **Test Flow**

#### **1. Register**

```http
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

#### **2. Verify Email** (Development)

```http
POST {{BASE_URL}}/auth/verify-email
Content-Type: application/json

{
  "email": "test@example.com",
  "verificationToken": "<token_from_registration_response>"
}
```

#### **3. Login**

```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123456"
}
```

**Save the `accessToken` from response to environment variable**

#### **4. Access Protected Route**

```http
GET {{BASE_URL}}/auth/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

#### **5. Refresh Token**

```http
POST {{BASE_URL}}/auth/refresh-token
```

(Cookie sent automatically)

#### **6. Admin Access** (use admin@learnoverse.com)

```http
GET {{BASE_URL}}/users/admin/dashboard
Authorization: Bearer {{ACCESS_TOKEN}}
```

#### **7. Logout**

```http
POST {{BASE_URL}}/auth/logout
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 🔄 How to Add New Roles

### **1. Update Role Model** (`src/models/Role.js`)

Add new role to `getDefaultRoles()`:

```javascript
{
  name: 'moderator',
  displayName: 'Moderator',
  description: 'Can moderate content and users',
  level: 30,
  permissions: [
    {
      resource: 'content',
      actions: ['read', 'update', 'delete'],
    },
    {
      resource: 'users',
      actions: ['read', 'update'],
    },
  ],
  isActive: true,
}
```

### **2. Update User Model** (`src/models/User.js`)

Add to role enum:

```javascript
role: {
  type: String,
  enum: {
    values: ['admin', 'instructor', 'student', 'moderator'],
    message: '{VALUE} is not a valid role',
  },
  default: 'student',
},
```

### **3. Update Authorization Middleware** (`src/utils/authorizePermissions.js`)

Add permissions logic:

```javascript
if (userRole === 'moderator') {
    const hasPermission = requiredPermissions.every(({ resource, action }) => {
        const moderatorPermissions = {
            content: ['read', 'update', 'delete'],
            users: ['read', 'update'],
        };
        // ... permission check logic
    });
}
```

### **4. Re-seed Database**

```bash
npm run seed
```

---

## 🎨 How to Protect New Routes

### **Method 1: Simple Authentication** (any logged-in user)

```javascript
import { authenticate } from '../middleware/authenticate.js';

router.get('/my-route', authenticate, async (req, res) => {
    // req.user contains: userId, name, email, role
    res.json({ message: 'Protected route', user: req.user });
});
```

### **Method 2: Role-Based** (specific roles)

```javascript
import { authenticate } from '../middleware/authenticate.js';
import authorizePermissions from '../utils/authorizePermissions.js';

// Admin only
router.delete(
    '/users/:id',
    authenticate,
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    async (req, res) => {
        // Only admins can access this
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

### **Method 3: Manual Role Check** (simple cases)

```javascript
router.get('/admin-only', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }
    // Admin logic here
});
```

---

## 📧 Email Configuration

### **Gmail Setup**

1. Enable 2-Factor Authentication on your Google Account
2. Generate App Password:
    - Go to: https://myaccount.google.com/apppasswords
    - Select "Mail" and "Other (Custom name)"
    - Copy the 16-character password

3. Update `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=noreply@learnoverse.com
```

### **Other Email Providers**

**SendGrid**:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun**:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your_mailgun_password
```

---

## 🐛 Troubleshooting

### **Issue: "JWT_SECRET is not defined"**

**Solution**: Create `.env` file with JWT secrets:

```bash
cp .env.example .env
# Then edit .env and add secrets
```

### **Issue: "Cannot connect to MongoDB"**

**Solution**:

1. Check MongoDB is running: `mongod --version`
2. Check connection string in `.env`
3. For Atlas, whitelist your IP

### **Issue: "Email not sending"**

**Solution**:

1. Check email credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. In development, check console for verification token

### **Issue: "Token expired"**

**Solution**: Use refresh token endpoint to get new access token:

```http
POST /api/v1/auth/refresh-token
```

### **Issue: "Account locked"**

**Solution**: Wait 2 hours or reset via database:

```javascript
// In MongoDB
db.users.updateOne(
    { email: 'user@example.com' },
    { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
);
```

---

## 🚀 Production Deployment Checklist

### **Environment**

- [ ] Set `NODE_ENV=production`
- [ ] Use strong random JWT secrets (64+ chars)
- [ ] Configure production MongoDB URI
- [ ] Set up production email service
- [ ] Configure CORS_ORIGINS with production domains
- [ ] Enable HTTPS
- [ ] Set secure cookie settings

### **Security**

- [ ] Change default admin password
- [ ] Review rate limits
- [ ] Enable email verification
- [ ] Set up monitoring/logging
- [ ] Configure firewall rules
- [ ] Regular security audits
- [ ] Keep dependencies updated

### **Database**

- [ ] Set up MongoDB replica set (high availability)
- [ ] Configure backups
- [ ] Set up indexes
- [ ] Monitor performance

### **Scaling**

- [ ] Use load balancer
- [ ] Set up Redis for session storage (optional)
- [ ] Configure PM2 or similar for process management
- [ ] Set up health check endpoints

---

## 📝 Code Examples

### **Example: Creating a New Protected Controller**

```javascript
// controllers/course.controller.js
import { StatusCodes } from 'http-status-codes';
import Course from '../models/Course.js';
import { NotFoundError, UnauthorizedError } from '../errors/index.js';

export const createCourse = async (req, res) => {
    const { title, description } = req.body;

    // req.user is available (set by authenticate middleware)
    const course = await Course.create({
        title,
        description,
        instructor: req.user.userId,
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        course,
    });
};

export const getMyCourses = async (req, res) => {
    const courses = await Course.find({ instructor: req.user.userId });

    res.status(StatusCodes.OK).json({
        success: true,
        count: courses.length,
        courses,
    });
};
```

### **Example: Route with Multiple Middleware**

```javascript
// routes/course.routes.js
import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import authorizePermissions from '../utils/authorizePermissions.js';
import {
    createCourse,
    getMyCourses,
} from '../controllers/course.controller.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// Instructor+ can create
router.post(
    '/',
    authorizePermissions([{ resource: 'courses', action: 'create' }]),
    createCourse
);

// Own courses (any authenticated user)
router.get('/my-courses', getMyCourses);

export default router;
```

---

## 🎓 Best Practices

### **1. Never Hardcode Secrets**

❌ Bad:

```javascript
const token = jwt.sign(payload, 'my-secret-key');
```

✅ Good:

```javascript
const token = jwt.sign(payload, process.env.JWT_SECRET);
```

### **2. Always Validate Input**

❌ Bad:

```javascript
const user = await User.create(req.body);
```

✅ Good:

```javascript
const { name, email, password } = req.body;
if (!name || !email || !password) {
    throw new BadRequestError('Missing required fields');
}
const user = await User.create({ name, email, password });
```

### **3. Use Try-Catch for Async Routes**

❌ Bad:

```javascript
router.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});
```

✅ Good:

```javascript
// Option 1: Express 5 handles async errors automatically
router.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Option 2: Explicit try-catch
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        next(error);
    }
});
```

### **4. Don't Expose Sensitive Info in Errors**

❌ Bad:

```javascript
throw new Error(`User ${email} not found in database`);
```

✅ Good:

```javascript
throw new NotFoundError('User not found');
```

### **5. Use Status Codes Consistently**

```javascript
import { StatusCodes } from 'http-status-codes';

res.status(StatusCodes.CREATED).json(...)  // 201
res.status(StatusCodes.OK).json(...)       // 200
res.status(StatusCodes.NO_CONTENT).send()  // 204
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

## 💬 Support

For issues or questions:

1. Check this documentation
2. Review error messages in console
3. Check MongoDB logs
4. Review authentication flow

---

## ✅ Summary

You now have a **production-grade authentication system** with:

✅ User registration with email verification  
✅ Secure login with JWT tokens  
✅ Refresh token rotation  
✅ Password reset flow  
✅ Role-based access control (Admin, Instructor, Student)  
✅ Protected routes with middleware  
✅ Session management  
✅ Account security (lockout, password hashing)  
✅ Comprehensive error handling  
✅ Full API documentation

**Next Steps**:

1. Test all endpoints with Postman
2. Customize roles and permissions
3. Build your application features
4. Deploy to production

Happy coding! 🚀
