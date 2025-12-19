# Learnoverse Frontend

A modern, secure authentication frontend built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Complete Authentication Flow**
    - User Registration with optional demographics
    - Email Verification
    - Login with secure token management
    - Forgot Password / Reset Password
    - Automatic token refresh
    - Secure logout

- **Role-Based Dashboards**
    - Student Dashboard
    - Instructor Dashboard
    - Admin Dashboard with statistics

- **Profile Management**
    - View user profile
    - Edit profile information
    - Update demographics

- **Security Best Practices**
    - Access tokens stored in memory (not localStorage)
    - Refresh tokens in httpOnly cookies
    - Automatic token refresh on expiration
    - Protected routes

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Tailwind CSS 4** - Styling
- **Context API** - State management

## 📁 Project Structure

```
src/
├── api/
│   └── client.js              # Axios instance with interceptors
├── components/
│   ├── Button.jsx             # Reusable button component
│   ├── Card.jsx               # Card container component
│   ├── Input.jsx              # Form input component
│   └── LoadingSpinner.jsx     # Loading indicator
├── contexts/
│   └── SessionContext.jsx     # Authentication context
├── pages/
│   ├── Dashboard/
│   │   ├── page.jsx
│   │   └── _components/
│   │       ├── UserAvatar.jsx
│   │       ├── UserDetails.jsx
│   │       ├── LogoutButton.jsx
│   │       ├── ProfileEditForm.jsx
│   │       ├── StudentDashboard.jsx
│   │       ├── InstructorDashboard.jsx
│   │       └── AdminDashboard.jsx
│   ├── Login/
│   │   ├── page.jsx
│   │   └── _components/
│   ├── Register/
│   │   ├── page.jsx
│   │   └── _components/
│   ├── VerifyEmail/
│   │   ├── page.jsx
│   │   └── _components/
│   ├── ForgotPassword/
│   │   ├── page.jsx
│   │   └── _components/
│   └── ResetPassword/
│       ├── page.jsx
│       └── _components/
├── router/
│   ├── index.jsx              # Main router configuration
│   └── ProtectedRoute.jsx     # Route guard component
├── App.jsx                    # Root component
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## 🎨 Component Philosophy

Each component follows the **Single Responsibility Principle**:

- Very small, focused components
- Page components import UI parts from `_components/` folder
- No mega-components
- Business logic stays in contexts
- UI components are pure and reusable

## 🔐 Authentication Flow

1. **Registration**
    - User registers with email, name, password
    - Optional: age, gender, location, occupation
    - Verification email sent
    - Redirect to email verification page

2. **Email Verification**
    - User enters email and verification token
    - Or clicks link in email (auto-fills token)
    - Account activated
    - Redirect to login

3. **Login**
    - User enters email and password
    - Server returns access token (stored in memory)
    - Server sets refresh token in httpOnly cookie
    - Redirect to dashboard

4. **Token Refresh**
    - Access token expires after 15-30 minutes
    - Axios interceptor catches 401 errors
    - Automatically calls `/auth/refresh-token`
    - Gets new access token
    - Retries failed request
    - If refresh fails → logout and redirect to login

5. **Logout**
    - Calls `/auth/logout` endpoint
    - Clears access token from memory
    - Server removes refresh token
    - Redirect to login

## 🚦 API Integration

The frontend connects to the backend API at `http://localhost:3000/api/v1` by default.

**Environment Variables:**

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**API Endpoints Used:**

- `POST /auth/register` - User registration
- `POST /auth/verify-email` - Email verification
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /users/me` - Get user profile
- `PATCH /users/me` - Update user profile
- `GET /users/admin/dashboard` - Admin dashboard data

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Create `.env` file:**

    ```bash
    cp .env.example .env
    ```

3. **Update environment variables if needed:**

    ```env
    VITE_API_BASE_URL=http://localhost:3000/api/v1
    ```

4. **Start development server:**

    ```bash
    npm run dev
    ```

5. **Open browser:**
    ```
    http://localhost:5173
    ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🧪 Testing the Application

1. **Start the backend server** (on port 3000)
2. **Start the frontend** with `npm run dev`
3. **Navigate to** `http://localhost:5173`

### Test Flow:

1. Click "Register" → Create an account
2. Check console/email for verification token
3. Verify email with token
4. Login with credentials
5. View dashboard (role-based content)
6. Edit profile information
7. Logout

## 🎯 Role-Based Access

### Student (default role)

- View enrolled courses (placeholder)
- Track progress
- Access learning materials

### Instructor

- Create and manage courses
- View student enrollments
- Manage course content

### Admin (first registered user)

- View system statistics
- Manage all users
- Access admin dashboard with metrics

## 🔒 Security Features

1. **Token Storage**
    - Access tokens: In-memory only (cleared on page refresh)
    - Refresh tokens: httpOnly cookies (not accessible via JavaScript)

2. **Automatic Token Refresh**
    - Axios interceptor handles expired tokens
    - Seamless user experience
    - No manual intervention needed

3. **Protected Routes**
    - Unauthenticated users redirected to login
    - Session checked on mount
    - Loading state during initialization

4. **CORS Configuration**
    - Credentials sent with every request
    - Backend validates origin

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Environment Variables for Production

Update `.env` with production API URL:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

### Deploy Options

- **Vercel** (recommended for Vite)

    ```bash
    vercel --prod
    ```

- **Netlify**

    ```bash
    netlify deploy --prod
    ```

- **Static Hosting** (S3, GitHub Pages, etc.)
    - Upload `dist/` folder contents
    - Configure routing for SPA

## 🐛 Troubleshooting

### "Network Error" or "CORS Error"

- Ensure backend server is running
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend CORS configuration includes frontend URL

### Token Refresh Fails

- Check backend `/auth/refresh-token` endpoint
- Ensure cookies are enabled in browser
- Verify `withCredentials: true` in axios config

### Protected Routes Not Working

- Check `SessionContext` initialization
- Verify token is being set after login
- Check browser console for errors

### Email Verification Not Working

- In development, verification token is logged to console
- Check backend email configuration
- Verify SMTP settings in backend `.env`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

## 🤝 Contributing

1. Follow the component structure
2. Keep components small and focused
3. Use TypeScript types if converting to TS
4. Write meaningful commit messages
5. Test all authentication flows before PR

## 📝 License

This project is part of the Learnoverse learning platform.

---

**Built with ❤️ using modern web technologies**
