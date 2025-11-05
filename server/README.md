# 🎓 Learnoverse - Learning Management System

## Complete Role-Based Authentication & Authorization System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19.2-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## ✨ What's Included

This is a **production-grade authentication and authorization system** featuring:

- 🔐 **JWT Authentication** (Access + Refresh tokens)
- 👥 **Role-Based Access Control** (Admin, Instructor, Student)
- 📧 **Email Verification** (with nodemailer)
- 🔑 **Password Reset** (secure token-based)
- 🛡️ **Security Features** (bcrypt, rate limiting, CORS, XSS protection)
- 📱 **Session Management** (multi-device, revocation)
- 📊 **User Demographics** (age, gender, location, occupation)
- 🎯 **17 Production-Ready API Endpoints**
- 📚 **Comprehensive Documentation**
- 🧪 **Postman Collection** for testing

---

## 🚀 Quick Start

### **1. Installation**

```bash
# Clone repository
git clone <your-repo-url>

# Navigate to server
cd server

# Install dependencies
npm install
```

### **2. Environment Setup**

```bash
# Copy environment example
cp .env.example .env

# Edit .env with your values
# Minimum required:
# - MONGO_URI
# - JWT_SECRET
# - JWT_REFRESH_SECRET
```

### **3. Database Setup**

```bash
# Seed database with roles and admin user
npm run seed
```

This creates:

- ✅ Default roles (admin, instructor, student)
- ✅ Admin user: `admin@learnoverse.com` / `Admin@123456`

### **4. Start Server**

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server runs on: **http://localhost:3000**

### **5. Test the API**

Import the Postman collection:

```
server/Learnoverse_Auth_API.postman_collection.json
```

Or test with cURL:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test@123456"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123456"}'
```

---

## 📚 Documentation

| Document                                                                      | Description                                                          |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **[AUTH_DOCUMENTATION.md](server/AUTH_DOCUMENTATION.md)**                     | Complete API reference, security features, examples, troubleshooting |
| **[QUICK_START.md](server/QUICK_START.md)**                                   | Quick reference guide, cheat sheet, common commands                  |
| **[SYSTEM_COMPLETE.md](server/SYSTEM_COMPLETE.md)**                           | Implementation summary, features, architecture                       |
| **[Postman Collection](server/Learnoverse_Auth_API.postman_collection.json)** | Import into Postman for easy API testing                             |

---

## 🗂️ Project Structure

```
server/
├── src/
│   ├── models/                 # Database schemas
│   │   ├── User.js             # User model with auth + demographics
│   │   ├── Role.js             # Roles with permissions
│   │   ├── RefreshToken.js     # Token storage
│   │   └── Profile.js          # Extended profile (optional)
│   │
│   ├── controllers/            # Business logic
│   │   └── auth.controller.js  # Complete auth implementation
│   │
│   ├── routers/                # API routes
│   │   ├── auth.routes.js      # Authentication endpoints
│   │   └── user.routes.js      # User management endpoints
│   │
│   ├── middleware/             # Custom middleware
│   │   ├── authenticate.js     # JWT verification
│   │   ├── error-handler.js    # Global error handling
│   │   └── tokenRefresh.js     # Token refresh logic
│   │
│   ├── utils/                  # Helper functions
│   │   ├── jwt.js              # JWT utilities
│   │   ├── authorizePermissions.js  # RBAC middleware
│   │   ├── createTokenUser.js  # Token payload
│   │   ├── sendVerificationEmail.js
│   │   ├── sendResetPasswordEmail.js
│   │   └── seedDatabase.js     # DB seeder
│   │
│   ├── config/                 # Configuration
│   │   └── nodemailerConfig.js
│   │
│   ├── db/                     # Database
│   │   └── connectDB.js
│   │
│   ├── errors/                 # Custom errors
│   │   ├── bad-request.js
│   │   ├── unauthenticated.js
│   │   ├── unauthorized.js
│   │   └── not-found.js
│   │
│   └── server.js               # Express app setup
│
├── .env.example                # Environment variables template
├── package.json                # Dependencies & scripts
├── AUTH_DOCUMENTATION.md       # Full API docs
├── QUICK_START.md              # Quick reference
└── Learnoverse_Auth_API.postman_collection.json
```

---

## 🔐 API Endpoints

### **Public Endpoints**

```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/verify-email      # Verify email address
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password
POST   /api/v1/auth/refresh-token     # Get new access token
```

### **Protected Endpoints** (Require Authentication)

```
GET    /api/v1/auth/me                      # Get current user
POST   /api/v1/auth/logout                  # Logout
PATCH  /api/v1/auth/update-password         # Update password
GET    /api/v1/auth/sessions                # View active sessions
POST   /api/v1/auth/revoke-all-sessions     # Logout all devices

GET    /api/v1/users/me                     # Get profile
PATCH  /api/v1/users/me                     # Update profile
GET    /api/v1/users/student/dashboard      # Student dashboard
GET    /api/v1/users/instructor/dashboard   # Instructor dashboard (instructor+)
GET    /api/v1/users/admin/dashboard        # Admin dashboard (admin only)
GET    /api/v1/users/admin/users            # List all users (admin only)
PATCH  /api/v1/users/admin/users/:id/role   # Update user role (admin only)
```

---

## 👥 Roles & Permissions

| Role           | Level | Access                                                  |
| -------------- | ----- | ------------------------------------------------------- |
| **Admin**      | 100   | Full system access - can do everything                  |
| **Instructor** | 50    | Create/manage courses, view students, grade assignments |
| **Student**    | 10    | View courses, submit assignments, update own profile    |

---

## 🛡️ Security Features

- ✅ **Password Security**: Bcrypt hashing (10 rounds)
- ✅ **JWT Tokens**: Access (15 min) + Refresh (30 days)
- ✅ **Token Rotation**: Refresh tokens rotated on use
- ✅ **Account Lockout**: 5 failed attempts → 2 hour lock
- ✅ **Email Verification**: Required in production
- ✅ **Password Reset**: Secure token-based (10 min expiry)
- ✅ **Session Management**: Track devices, revoke sessions
- ✅ **CORS Protection**: Configured origins
- ✅ **Rate Limiting**: 100 requests per 15 minutes
- ✅ **XSS Protection**: xss-clean middleware
- ✅ **NoSQL Injection**: express-mongo-sanitize
- ✅ **HTTP Headers**: Helmet.js security headers
- ✅ **Input Validation**: Comprehensive validation

---

## 🧰 Tech Stack

### **Backend**

- **Node.js** (18+)
- **Express.js** (5.1.0) - Web framework
- **MongoDB** (8.19.2) - Database
- **Mongoose** - ODM

### **Authentication**

- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie management

### **Security**

- **helmet** - HTTP headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection prevention
- **xss-clean** - XSS protection
- **validator** - Input validation

### **Email**

- **nodemailer** - Email sending

### **Development**

- **nodemon** - Auto-restart
- **eslint** - Code linting
- **prettier** - Code formatting

---

## 📝 NPM Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server (nodemon)
npm run seed           # Seed database (roles + admin)
npm run lint           # Lint code
npm run lint:fix       # Lint and fix issues
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
```

---

## 🔧 Environment Variables

Required variables in `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/learnoverse

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters

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

---

## 🧪 Testing

### **With Postman**

1. Import `Learnoverse_Auth_API.postman_collection.json`
2. Set `BASE_URL` to `http://localhost:3000/api/v1`
3. Run through the requests

### **With cURL**

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123456"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnoverse.com","password":"Admin@123456"}'

# Get user (replace TOKEN)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚀 Production Deployment

### **Prerequisites**

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Set up production email service (SendGrid, Mailgun, etc.)
- [ ] Enable HTTPS
- [ ] Configure firewall

### **Recommended**

- [ ] Use PM2 or similar for process management
- [ ] Set up MongoDB replica set
- [ ] Configure backups
- [ ] Set up monitoring (e.g., PM2, New Relic)
- [ ] Use load balancer for scaling
- [ ] Set up logging (Winston, Morgan)

### **Post-Deployment**

- [ ] Change default admin password
- [ ] Test all endpoints
- [ ] Monitor error rates
- [ ] Set up alerts

---

## 🐛 Troubleshooting

### Common Issues

**"JWT_SECRET is not defined"**
→ Create `.env` file with JWT secrets

**"Cannot connect to MongoDB"**
→ Check MongoDB is running and connection string

**"Token expired"**
→ Use refresh token endpoint to get new access token

**"Email not sending"**
→ Check email config, use Gmail App Password

**"Account locked"**
→ Wait 2 hours or reset in database

See [AUTH_DOCUMENTATION.md](server/AUTH_DOCUMENTATION.md) for detailed troubleshooting.

---

## 📖 How to Use

### **1. Protect a Route**

```javascript
import { authenticate } from '../middleware/authenticate.js';

router.get('/my-route', authenticate, async (req, res) => {
    // req.user has: userId, name, email, role
    res.json({ user: req.user });
});
```

### **2. Restrict by Role**

```javascript
import { authenticate } from '../middleware/authenticate.js';
import authorizePermissions from '../utils/authorizePermissions.js';

// Admin only
router.delete(
    '/users/:id',
    authenticate,
    authorizePermissions([{ resource: 'all', action: 'manage' }]),
    async (req, res) => {
        // Admin logic
    }
);

// Instructor and Admin
router.post(
    '/courses',
    authenticate,
    authorizePermissions([{ resource: 'courses', action: 'create' }]),
    async (req, res) => {
        // Course creation
    }
);
```

### **3. Add New Roles**

See detailed instructions in [AUTH_DOCUMENTATION.md](server/AUTH_DOCUMENTATION.md#-how-to-add-new-roles)

---

## 🤝 Contributing

This is a learning management system authentication foundation. You can:

1. Add course management features
2. Implement enrollment logic
3. Add assignment submission
4. Build grading system
5. Add real-time features (Socket.io)
6. Implement file uploads
7. Add analytics dashboard

---

## 📄 License

ISC License

---

## 🎓 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [OWASP Security Guide](https://owasp.org/)

---

## ⭐ Features Roadmap

Current features (✅ Complete):

- User authentication & authorization
- Role-based access control
- Email verification
- Password reset
- Session management
- User profiles

Future enhancements:

- [ ] Course management
- [ ] Enrollment system
- [ ] Assignment submissions
- [ ] Grading system
- [ ] Real-time notifications
- [ ] File uploads
- [ ] Video streaming
- [ ] Quiz/assessment engine
- [ ] Discussion forums
- [ ] Analytics dashboard

---

## 💬 Support

For questions or issues:

1. Check documentation files
2. Review code comments
3. Test with Postman collection
4. Check error logs

---

## ✨ Acknowledgments

Built with best practices from:

- Express.js security guidelines
- OWASP security standards
- JWT best practices
- MongoDB security recommendations

---

## 🎉 You're Ready!

You have a complete, production-grade authentication system. Start building your LMS features on this solid foundation!

```bash
npm run seed
npm run dev
# Happy coding! 🚀
```

---

**Made with ❤️ for learning management systems**
