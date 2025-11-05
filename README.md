# 🎓 Learnoverse - Learning Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19.2-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A **production-grade full-stack Learning Management System** with comprehensive authentication, role-based authorization, and modern UI/UX.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT-based Authentication** (Access + Refresh tokens)
- **Email Verification** with secure token system
- **Password Reset** functionality
- **Multi-device Session Management**
- **Role-Based Access Control** (Admin, Instructor, Student)
- **Security Hardening** (bcrypt, rate limiting, CORS, XSS protection, helmet)

### 👥 User Management
- **User Registration** with optional demographics (age, gender, location, occupation)
- **Profile Management** (view, edit, update)
- **Role-based Dashboards** for different user types
- **Multi-device Logout** support

### 🎨 Modern Frontend
- **React 19** with latest features
- **Responsive Design** with Tailwind CSS 4
- **Protected Routes** with automatic token refresh
- **Reusable Components** (Button, Card, Input, LoadingSpinner)
- **Context-based State Management**

### 🛡️ Backend Architecture
- **RESTful API** with 17+ production-ready endpoints
- **MongoDB** with Mongoose ODM
- **Middleware** for authentication, error handling, rate limiting
- **Email Service** with Nodemailer
- **Comprehensive Documentation**

---

## 📁 Project Structure

```
learnoverse/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # Axios client with interceptors
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React Context (Session management)
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── ForgotPassword/
│   │   │   ├── ResetPassword/
│   │   │   └── VerifyEmail/
│   │   ├── router/        # React Router configuration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── server/                # Node.js + Express Backend
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── controllers/   # Request handlers
    │   ├── db/            # Database connection
    │   ├── errors/        # Custom error classes
    │   ├── middleware/    # Express middleware
    │   ├── models/        # MongoDB models
    │   ├── routers/       # API routes
    │   ├── utils/         # Helper functions
    │   └── index.js       # Entry point
    ├── package.json
    ├── AUTH_DOCUMENTATION.md
    ├── QUICK_START.md
    └── Learnoverse_Auth_API.postman_collection.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local installation)
- **npm** or **yarn** package manager

### 1. Clone the Repository

```bash
git clone https://github.com/AnkitaD76/learnoverse.git
cd learnoverse
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGO_URI (MongoDB connection string)
# - JWT_SECRET (random 32+ character string)
# - JWT_REFRESH_SECRET (random 32+ character string)
# - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS (SMTP settings)
```

#### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/learnoverse
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/learnoverse

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long
JWT_LIFETIME=15m
JWT_REFRESH_LIFETIME=7d

# Email Configuration (for verification & password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cookie Configuration
COOKIE_SECURE=false  # Set to true in production with HTTPS
COOKIE_DOMAIN=localhost
```

#### Seed the Database

```bash
# This creates default roles and an admin user
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@learnoverse.com`
- Password: `Admin@123456`

⚠️ **Change this password immediately in production!**

#### Start Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Backend runs on: **http://localhost:3000**

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 4. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/verify-email` | Verify email with token | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/logout` | Logout current session | Yes |
| POST | `/auth/logout-all` | Logout all sessions | Yes |
| GET | `/auth/refresh` | Refresh access token | Yes (Refresh Token) |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get current user profile | Yes |
| PATCH | `/users/profile` | Update user profile | Yes |
| PATCH | `/users/change-password` | Change password | Yes |
| GET | `/users` | Get all users (Admin only) | Yes (Admin) |
| GET | `/users/:id` | Get user by ID (Admin/Instructor) | Yes |
| PATCH | `/users/:id` | Update user (Admin only) | Yes (Admin) |
| DELETE | `/users/:id` | Delete user (Admin only) | Yes (Admin) |
| PATCH | `/users/:id/role` | Change user role (Admin only) | Yes (Admin) |

For detailed API examples and Postman collection, see:
- `server/AUTH_DOCUMENTATION.md`
- `server/Learnoverse_Auth_API.postman_collection.json`

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library with latest features
- **Vite 7.1.7** - Fast build tool and dev server
- **React Router DOM 7.9.5** - Client-side routing
- **Axios 1.13.2** - HTTP client with interceptors
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **ESLint + Prettier** - Code linting and formatting

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MongoDB 8.19.2** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **XSS-Clean** - XSS protection
- **Mongo Sanitize** - NoSQL injection prevention

---

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password requirements (8+ chars, uppercase, lowercase, number, special char)
   - Secure password reset flow

2. **Token Management**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Refresh tokens stored in httpOnly cookies
   - Access tokens stored in memory (not localStorage)
   - Automatic token refresh

3. **API Security**
   - Rate limiting on authentication endpoints
   - Helmet for security headers
   - CORS configuration
   - XSS protection
   - NoSQL injection prevention
   - Input validation with validator

4. **Session Management**
   - Multi-device session tracking
   - Individual session logout
   - Logout from all devices
   - Session revocation

---

## 👥 User Roles & Permissions

### Student
- View own profile
- Edit own profile
- Access student dashboard
- Change own password

### Instructor
- All student permissions
- View other users (limited)
- Access instructor dashboard
- Manage courses (future feature)

### Admin
- All instructor permissions
- View all users
- Create/update/delete users
- Change user roles
- View system statistics
- Access admin dashboard

---

## 📖 Available Scripts

### Backend (server/)

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with roles and admin user
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm run format     # Format code with Prettier
```

### Frontend (client/)

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm run format     # Format code with Prettier
```

---

## 🧪 Testing the API

### Using Postman

1. Import the collection: `server/Learnoverse_Auth_API.postman_collection.json`
2. Set the base URL to `http://localhost:3000/api/v1`
3. Register a new user or login with admin credentials
4. Token is automatically saved and used in subsequent requests

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Test@123456",
    "age": 25,
    "gender": "male"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123456"
  }'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Ensure `NODE_ENV=production`
3. Set `COOKIE_SECURE=true` for HTTPS
4. Update `FRONTEND_URL` to your deployed frontend URL
5. Update `COOKIE_DOMAIN` to your domain

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL in `client/src/api/client.js` to your backend URL
4. Configure environment variables if needed

### Environment-Specific Configuration

**Production Backend (.env):**
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📝 Development Workflow

### Adding New Features

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Backend changes:**
   - Add models in `server/src/models/`
   - Add controllers in `server/src/controllers/`
   - Add routes in `server/src/routers/`
   - Update middleware if needed

3. **Frontend changes:**
   - Add components in `client/src/components/`
   - Add pages in `client/src/pages/`
   - Update router in `client/src/router/`
   - Add API calls in `client/src/api/`

4. **Test your changes:**
   - Test API endpoints with Postman
   - Test UI in browser
   - Check for console errors

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Ensure port 3000 is not already in use

**Frontend can't connect to backend:**
- Verify backend is running on http://localhost:3000
- Check CORS configuration in `server/src/server.js`
- Clear browser cache and cookies

**Email verification not working:**
- Check email configuration in `.env`
- For Gmail, use App-Specific Password
- Check spam folder

**Token refresh errors:**
- Clear browser cookies
- Login again to get new tokens
- Check JWT_REFRESH_SECRET in `.env`

---

## 📚 Documentation

- **Server Documentation:** [server/README.md](server/README.md)
- **Client Documentation:** [client/README.md](client/README.md)
- **API Documentation:** [server/AUTH_DOCUMENTATION.md](server/AUTH_DOCUMENTATION.md)
- **Quick Start Guide:** [server/QUICK_START.md](server/QUICK_START.md)
- **System Overview:** [server/SYSTEM_COMPLETE.md](server/SYSTEM_COMPLETE.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**AnkitaD76**
- GitHub: [@AnkitaD76](https://github.com/AnkitaD76)

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Backend powered by [Express](https://expressjs.com/)
- Database by [MongoDB](https://www.mongodb.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support

If you have any questions or need help, please:
1. Check the documentation in the `server/` and `client/` folders
2. Review the [AUTH_DOCUMENTATION.md](server/AUTH_DOCUMENTATION.md)
3. Open an issue on GitHub

---

## 🗺️ Roadmap

### Current Features ✅
- User authentication and authorization
- Email verification
- Password reset
- Role-based access control
- User profile management
- Session management

### Planned Features 🚧
- Course management
- Enrollment system
- Assignment submission
- Quiz/Assessment module
- Discussion forums
- Real-time notifications
- File upload/download
- Analytics dashboard
- Mobile responsive improvements
- Dark mode

---

**Made with ❤️ for the learning community**
