# Learnoverse Authentication System

A comprehensive role-based authentication and authorization system built with Node.js, Express, MongoDB, and JWT.

## 🚀 Features

### Authentication

- ✅ User registration with email verification
- ✅ JWT-based authentication (access & refresh tokens)
- ✅ Email verification required before login
- ✅ Forgot password with email reset link
- ✅ Secure password hashing with bcrypt
- ✅ HTTP-only cookie-based token storage
- ✅ Token refresh mechanism

### Authorization

- ✅ Role-based access control (RBAC)
- ✅ 4 User Roles: Admin, Instructor, Moderator, Student
- ✅ First user automatically becomes Admin
- ✅ Route-level authorization middleware
- ✅ Resource ownership validation

### User Management

- ✅ User profile management
- ✅ Password change functionality
- ✅ Account deletion
- ✅ User search and filtering (admin)

### Admin Features

- ✅ View all users with filters
- ✅ Search users by name/email
- ✅ Change user roles
- ✅ Activate/deactivate users
- ✅ Delete users
- ✅ User statistics dashboard

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup and installation guide
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete API documentation
- **[EXAMPLES.md](./EXAMPLES.md)** - Frontend integration examples
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview and file structure
- **[api-tests.http](./api-tests.http)** - REST Client test file

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Email**: Nodemailer
- **Validation**: Validator.js, Zod
- **Security**: Helmet, CORS, Cookie-Parser

## 📦 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd learnovers/server
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy and rename `src/config/notENV.env` to `.env` and update the values:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
JWT_ACCESS_LIFETIME=15m
JWT_REFRESH_LIFETIME=7d
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

4. **Seed the database**

```bash
npm run seed
```

This will create:

- 4 default roles (Admin, Instructor, Student, Moderator)
- 7 sample users with different roles
- Complete with demographics and education info

5. **Start the server**

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🔑 Default Credentials

After seeding, use these credentials to test:

### Admin Account

- **Email**: admin@learnoverse.com
- **Password**: Admin@123456

### Instructor Account

- **Email**: john.instructor@learnoverse.com
- **Password**: Instructor@123

### Student Account

- **Email**: alice.student@learnoverse.com
- **Password**: Student@123

### Moderator Account

- **Email**: mike.moderator@learnoverse.com
- **Password**: Moderator@123

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Overview

#### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/update-password` - Change password

#### User Endpoints (Protected)

- `GET /api/v1/users/profile` - Get profile
- `PATCH /api/v1/users/profile` - Update profile
- `GET /api/v1/users/stats` - Get user statistics
- `GET /api/v1/users/search` - Search users

#### Admin Endpoints (Admin Only)

- `GET /api/v1/admin/users` - Get all users
- `PATCH /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `GET /api/v1/admin/stats` - System statistics
- `GET /api/v1/admin/roles` - Manage roles
- `GET /api/v1/admin/sessions` - View all sessions

## 🏗️ Project Structure

```
server/
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── admin.controller.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Role.js
│   │   └── RefreshToken.js
│   ├── middleware/          # Express middleware
│   │   ├── authenticate.js
│   │   ├── authorization.js
│   │   └── error-handler.js
│   ├── routers/             # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── admin.routes.js
│   ├── utils/               # Helper functions
│   │   ├── jwt.js
│   │   ├── checkPermissions.js
│   │   ├── sendEmail.js
│   │   └── seedDatabase.js
│   ├── errors/              # Custom error classes
│   ├── db/                  # Database connection
│   └── server.js            # Entry point
├── package.json
└── API_DOCUMENTATION.md
```

## 🔐 Security Features

### Password Security

- Passwords hashed with bcryptjs (10 salt rounds)
- Minimum 6 characters required
- Password change tracking
- All sessions invalidated on password reset

### Token Security

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- HttpOnly cookies (XSS protection)
- Signed cookies
- Token invalidation on logout

### Account Protection

- Email verification required
- Login attempt tracking (max 5 attempts)
- 2-hour account lock after failed attempts
- Admin can manually unlock accounts

### API Security

- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting ready
- Request body size limits (10kb)

## 👥 User Roles & Permissions

### Admin (Priority: 100)

Full system access - can manage everything

**Permissions:**

- All user operations
- All role operations
- All course operations
- System management

### Instructor (Priority: 50)

Can create and manage courses

**Permissions:**

- Create, read, update courses
- Create, read, update content
- Read students

### Student (Priority: 10)

Can view courses and enroll

**Permissions:**

- Read courses
- Read content
- Update own profile

### Moderator (Priority: 30)

Can moderate content and assist users

**Permissions:**

- Read, update users
- Read, update, delete content
- Read courses

## 📊 Database Schema

### User Model

Stores user information, authentication data, and education demographics.

**Key Fields:**

- Basic: name, email, password, role
- Profile: avatar, phone, location, bio
- Education: level, institution, field of study, interests
- Security: verification tokens, reset tokens, login attempts
- Learning: enrolled courses, completed courses

### Role Model

Defines user roles and their permissions.

**Key Fields:**

- name (unique): admin, instructor, student, moderator
- displayName: User-friendly role name
- permissions: Array of permission strings
- priority: Role hierarchy number

### RefreshToken Model

Tracks active user sessions.

**Key Fields:**

- user: Reference to User
- token: JWT refresh token
- userAgent: Browser/device info
- ip: User's IP address
- isValid: Token validity status
- expiresAt: Token expiration

## 🧪 Testing

Test the API using:

- **Postman** - Import endpoints and test
- **Thunder Client** (VS Code) - Quick API testing
- **cURL** - Command-line testing

Example Login Request:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnoverse.com","password":"Admin@123456"}'
```

## 🔄 Development Workflow

1. **Start development server**

```bash
npm run dev
```

2. **Make changes** to controllers, routes, or models

3. **Server auto-restarts** (using Node.js --watch flag)

4. **Test endpoints** with Postman/Thunder Client

5. **Check errors** in terminal output

## 📝 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm run seed       # Seed database with initial data
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
```

## 🌐 Environment Variables

Required environment variables:

| Variable               | Description                 | Example                 |
| ---------------------- | --------------------------- | ----------------------- |
| `PORT`                 | Server port                 | `3000`                  |
| `NODE_ENV`             | Environment                 | `development`           |
| `MONGO_URI`            | MongoDB connection string   | `mongodb://...`         |
| `JWT_SECRET`           | JWT signing secret          | `min_32_chars`          |
| `JWT_REFRESH_SECRET`   | Refresh token secret        | `min_32_chars`          |
| `JWT_ACCESS_LIFETIME`  | Access token expiry         | `15m`                   |
| `JWT_REFRESH_LIFETIME` | Refresh token expiry        | `7d`                    |
| `FRONTEND_URL`         | Frontend URL for CORS       | `http://localhost:5173` |
| `EMAIL_HOST`           | SMTP server                 | `smtp.gmail.com`        |
| `EMAIL_PORT`           | SMTP port                   | `587`                   |
| `EMAIL_USER`           | Email account               | `your@email.com`        |
| `EMAIL_PASSWORD`       | Email password/app password | `your_password`         |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Learnoverse Development Team

## 🙏 Acknowledgments

- Express.js community
- MongoDB and Mongoose teams
- JWT authentication best practices
- Node.js security guidelines

---

**Need help?** Check the [API Documentation](./API_DOCUMENTATION.md) or create an issue in the repository.
