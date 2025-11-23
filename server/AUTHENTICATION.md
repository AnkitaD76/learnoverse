# Authentication System Documentation

## Overview

Complete role-based authentication system with JWT tokens, email verification, and password reset functionality.

## Features

- ✅ User registration with email verification
- ✅ JWT-based authentication (Access & Refresh tokens)
- ✅ Role-based authorization (Admin, Instructor, Student, Moderator)
- ✅ Email verification
- ✅ Forgot password / Reset password
- ✅ Secure password hashing with bcrypt
- ✅ HTTP-only cookies for token storage
- ✅ User profile management
- ✅ Admin user management

## User Roles

### Available Roles

1. **Admin** - Full system access, can manage all users
2. **Instructor** - Can create and manage courses
3. **Moderator** - Can moderate content
4. **Student** - Default role, basic access

### Role Assignment

- First registered user automatically becomes Admin
- Subsequent users default to Student role
- Admins can change user roles via admin panel

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

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

#### Verify Email

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "verificationToken": "token-from-email"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "userId": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "isVerified": true
    }
}
```

**Note:** Access token and refresh token are set as HTTP-only cookies.

#### Logout

```http
POST /api/v1/auth/logout
```

Requires authentication (access token in cookies).

#### Forgot Password

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Password reset email sent. Please check your email."
}
```

#### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

#### Get Current User

```http
GET /api/v1/auth/me
```

Requires authentication.

#### Refresh Access Token

```http
POST /api/v1/auth/refresh-token
```

Requires refresh token in cookies.

### User Routes (`/api/v1/users`)

All user routes require authentication.

#### Get Current User Profile

```http
GET /api/v1/users/showMe
```

#### Update User Profile

```http
PATCH /api/v1/users/updateUser
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "country": "USA",
  "city": "New York",
  "bio": "Software developer",
  "interests": ["coding", "teaching"]
}
```

#### Update Password

```http
PATCH /api/v1/users/updateUserPassword
Content-Type: application/json

{
  "oldPassword": "currentPassword",
  "newPassword": "newPassword123"
}
```

#### Get Single User

```http
GET /api/v1/users/:id
```

Users can only view their own profile unless they're admin.

#### Delete User Account

```http
DELETE /api/v1/users/:id
```

Users can only delete their own account unless they're admin.

#### Get All Users (Admin Only)

```http
GET /api/v1/users
```

### Admin Routes (`/api/v1/admin`)

All admin routes require authentication and admin role.

#### Get User Statistics

```http
GET /api/v1/admin/stats
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalUsers": 100,
    "verifiedUsers": 85,
    "activeUsers": 90,
    "usersByRole": [
      { "_id": "student", "count": 80 },
      { "_id": "instructor", "count": 15 },
      { "_id": "admin", "count": 5 }
    ],
    "recentUsers": [...]
  }
}
```

#### Get All Users with Filters

```http
GET /api/v1/admin/users?role=student&isVerified=true&isActive=true&search=john
```

Query Parameters:

- `role`: Filter by role (admin, instructor, student, moderator)
- `isVerified`: Filter by verification status (true/false)
- `isActive`: Filter by active status (true/false)
- `search`: Search by name or email

#### Get Single User

```http
GET /api/v1/admin/users/:id
```

#### Update User Role

```http
PATCH /api/v1/admin/users/:id/role
Content-Type: application/json

{
  "role": "instructor"
}
```

**Note:** Admins cannot change their own role.

#### Update User Status (Activate/Deactivate)

```http
PATCH /api/v1/admin/users/:id/status
Content-Type: application/json

{
  "isActive": false
}
```

**Note:** Admins cannot change their own status.

#### Delete User

```http
DELETE /api/v1/admin/users/:id
```

**Note:** Admins cannot delete their own account.

## Security Features

### Password Security

- Passwords are hashed using bcrypt (10 salt rounds)
- Minimum password length: 6 characters
- Passwords are never returned in API responses

### Token Security

- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens stored in HTTP-only, signed cookies
- Tokens include user ID, name, email, and role

### Email Verification

- Verification tokens expire in 24 hours
- Unverified users cannot login
- Tokens are cryptographically secure (40 bytes)

### Password Reset

- Reset tokens expire in 10 minutes
- Tokens are hashed before storage in database
- All refresh tokens invalidated after password reset

### Authorization

- Role-based access control (RBAC)
- Route-level authorization middleware
- Resource ownership validation
- Admin privilege checks

## Middleware

### Authentication Middleware

- `authenticate` - Requires valid access token
- `optionalAuthenticate` - Attaches user if token present
- `requireVerification` - Requires verified email

### Authorization Middleware

- `authorizeRoles(...roles)` - Allow specific roles
- `authorizeAdmin` - Admin only
- `authorizeInstructor` - Instructor or Admin
- `authorizeModerator` - Moderator, Instructor, or Admin
- `authorizeOwnerOrAdmin` - Resource owner or Admin

## Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique, validated),
  password: String (hashed),
  role: String (enum: admin, instructor, student, moderator),

  // Profile fields
  avatar: String,
  dateOfBirth: Date,
  gender: String,
  phone: String,
  country: String,
  city: String,
  address: String,
  bio: String,
  interests: [String],

  // Education
  educationLevel: String,
  institution: String,
  fieldOfStudy: String,

  // Course tracking
  enrolledCourses: [ObjectId],
  completedCourses: [ObjectId],

  // Verification
  isVerified: Boolean,
  verificationToken: String,
  verificationTokenExpires: Date,

  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Account status
  isActive: Boolean,
  lastLogin: Date,
  passwordChangedAt: Date,

  timestamps: true
}
```

### RefreshToken Model

```javascript
{
  user: ObjectId (ref: User),
  refreshToken: String (unique),
  userAgent: String,
  ip: String,
  isValid: Boolean,
  timestamps: true
}
```

## Email Templates

### Verification Email

- Includes verification link and manual token
- Link format: `{FRONTEND_URL}/verify-email?token={token}&email={email}`
- Expires in 24 hours

### Password Reset Email

- Includes reset link
- Link format: `{FRONTEND_URL}/reset-password?token={token}&email={email}`
- Expires in 10 minutes
- Security warning included

## Environment Variables

Required environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnoverse

JWT_SECRET=your_jwt_secret_key_min_32_characters_long_here
JWT_ACCESS_LIFETIME=15m
JWT_REFRESH_LIFETIME=7d

FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

SMTP_SERVER=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SENDER_EMAIL=your-email@gmail.com
```

## Setup Instructions

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Email (Gmail Example)**

- Enable 2-Factor Authentication
- Generate App Password: https://myaccount.google.com/apppasswords
- Use the 16-character app password as SMTP_PASS

4. **Start MongoDB**

```bash
# Make sure MongoDB is running
mongod
```

5. **Run Server**

```bash
# Development
npm run dev

# Production
npm start
```

## Testing the API

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

**Get Profile (with cookies):**

```bash
curl -X GET http://localhost:5000/api/v1/users/showMe \
  -b cookies.txt
```

### Using Postman/Thunder Client

1. Set `Content-Type: application/json` header
2. Enable cookie handling in settings
3. Send requests and cookies will be automatically managed

## Error Handling

All errors return consistent format:

```json
{
    "success": false,
    "message": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Best Practices

### Security

- Always use HTTPS in production
- Set `NODE_ENV=production`
- Use strong JWT secrets (32+ characters)
- Rotate JWT secrets periodically
- Implement rate limiting
- Add CSRF protection for state-changing operations

### Email Configuration

- Use transactional email services in production (SendGrid, Mailgun)
- Implement email queue for better performance
- Add email templates for branding
- Track email delivery status

### Database

- Create indexes for frequently queried fields
- Implement soft delete for user accounts
- Regular backups
- Monitor database performance

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Account lockout after failed login attempts
- [ ] Session management dashboard
- [ ] Email notification preferences
- [ ] Audit logs for admin actions
- [ ] Rate limiting per user/IP
- [ ] Password strength meter
- [ ] Remember me functionality
- [ ] Multi-device session management

## Troubleshooting

### Email not sending

- Check SMTP credentials
- Verify firewall settings
- Use app-specific passwords for Gmail
- Check spam folder

### Tokens not working

- Verify JWT_SECRET is set
- Check cookie settings (httpOnly, secure)
- Ensure frontend/backend on same domain or CORS configured
- Check token expiration times

### Database connection errors

- Verify MongoDB is running
- Check MONGO_URI format
- Ensure database permissions

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
