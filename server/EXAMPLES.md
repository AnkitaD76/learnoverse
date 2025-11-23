# Authentication Implementation Examples

## Frontend Integration Examples

### 1. React/Next.js Authentication Hook

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Axios instance with credentials
    const api = axios.create({
        baseURL:
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
        withCredentials: true, // Important: Send cookies
    });

    // Get current user on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
        });
        return data;
    };

    const verifyEmail = async (email, verificationToken) => {
        const { data } = await api.post('/auth/verify-email', {
            email,
            verificationToken,
        });
        return data;
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', {
            email,
            password,
        });
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const forgotPassword = async email => {
        const { data } = await api.post('/auth/forgot-password', { email });
        return data;
    };

    const resetPassword = async (email, token, password) => {
        const { data } = await api.post('/auth/reset-password', {
            email,
            token,
            password,
        });
        return data;
    };

    const updateProfile = async profileData => {
        const { data } = await api.patch('/users/updateUser', profileData);
        setUser(data.user);
        return data;
    };

    const value = {
        user,
        loading,
        register,
        verifyEmail,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        checkAuth,
        api, // Export api instance for other requests
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

### 2. Registration Component

```javascript
// components/RegisterForm.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const data = await register(
                formData.name,
                formData.email,
                formData.password
            );
            setSuccess(data.message);
            // Redirect to verify email page after 2 seconds
            setTimeout(() => {
                router.push('/verify-email');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Register</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            <div>
                <label className="block mb-2">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <div>
                <label className="block mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <div>
                <label className="block mb-2">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
}
```

### 3. Login Component

```javascript
// components/LoginForm.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Login</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <div>
                <label className="block mb-2">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <div className="flex items-center justify-between">
                <Link
                    href="/forgot-password"
                    className="text-blue-600 hover:underline"
                >
                    Forgot Password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center">
                Don't have an account?{' '}
                <Link
                    href="/register"
                    className="text-blue-600 hover:underline"
                >
                    Register
                </Link>
            </p>
        </form>
    );
}
```

### 4. Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, requiredRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null;
  }

  return children;
}

// Usage in pages
// pages/dashboard.jsx
import ProtectedRoute from '../components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </ProtectedRoute>
  );
}

// pages/admin.jsx
export default function AdminPanel() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div>
        <h1>Admin Panel</h1>
        {/* Admin content */}
      </div>
    </ProtectedRoute>
  );
}
```

### 5. Email Verification Component

```javascript
// components/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function VerifyEmail() {
    const router = useRouter();
    const { token, email } = router.query;
    const { verifyEmail } = useAuth();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token && email) {
            handleVerification();
        }
    }, [token, email]);

    const handleVerification = async () => {
        try {
            const data = await verifyEmail(email, token);
            setStatus('success');
            setMessage(data.message);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Verification failed');
        }
    };

    if (status === 'verifying') {
        return <div>Verifying your email...</div>;
    }

    return (
        <div className="text-center">
            {status === 'success' ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {message}
                    <p className="mt-2">Redirecting to login...</p>
                </div>
            ) : (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {message}
                </div>
            )}
        </div>
    );
}
```

### 6. Forgot Password Component

```javascript
// components/ForgotPassword.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { forgotPassword } = useAuth();

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const data = await forgotPassword(email);
            setMessage(data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <p className="text-gray-600">
                Enter your email address and we'll send you a link to reset your
                password.
            </p>

            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block mb-2">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
        </form>
    );
}
```

### 7. Reset Password Component

```javascript
// components/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

export default function ResetPassword() {
    const router = useRouter();
    const { token, email } = router.query;
    const { resetPassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const data = await resetPassword(email, token, password);
            setSuccess(data.message);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return <div>Invalid reset link</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Reset Password</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                    <p className="mt-2">Redirecting to login...</p>
                </div>
            )}

            <div>
                <label className="block mb-2">New Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <div>
                <label className="block mb-2">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );
}
```

## Backend Testing Scripts

### Node.js Test Script

```javascript
// scripts/test-auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Create axios instance with cookie support
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

async function testAuthFlow() {
    console.log('🚀 Starting Authentication Test\n');

    try {
        // 1. Register
        console.log('1️⃣ Registering user...');
        const registerRes = await api.post('/auth/register', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123',
        });
        console.log('✅ Registration successful:', registerRes.data.message);
        console.log('User role:', registerRes.data.user.role, '\n');

        // Note: In real scenario, you'd get verificationToken from email
        console.log('⚠️  Check your email for verification token\n');

        // 2. Verify Email (skipping in this test)
        // console.log('2️⃣ Verifying email...');
        // const verifyRes = await api.post('/auth/verify-email', {
        //   email: 'test@example.com',
        //   verificationToken: 'token-from-email'
        // });
        // console.log('✅ Email verified:', verifyRes.data.message, '\n');

        // 3. Login (will fail if not verified)
        // console.log('3️⃣ Logging in...');
        // const loginRes = await api.post('/auth/login', {
        //   email: 'test@example.com',
        //   password: 'test123'
        // });
        // console.log('✅ Login successful');
        // console.log('User:', loginRes.data.user, '\n');

        // 4. Get Current User
        // console.log('4️⃣ Getting current user...');
        // const meRes = await api.get('/auth/me');
        // console.log('✅ Current user:', meRes.data.user, '\n');

        console.log('✅ Test completed!\n');
        console.log('📝 Next steps:');
        console.log('1. Check email for verification token');
        console.log('2. Verify email using the token');
        console.log('3. Login with credentials');
    } catch (error) {
        console.error(
            '❌ Error:',
            error.response?.data?.message || error.message
        );
    }
}

testAuthFlow();
```

## Postman Collection JSON

```json
{
    "info": {
        "name": "Learnoverse Authentication API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:5000/api/v1"
        }
    ],
    "item": [
        {
            "name": "Auth",
            "item": [
                {
                    "name": "Register",
                    "request": {
                        "method": "POST",
                        "url": "{{baseUrl}}/auth/register",
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\"\n}"
                        }
                    }
                },
                {
                    "name": "Login",
                    "request": {
                        "method": "POST",
                        "url": "{{baseUrl}}/auth/login",
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\"\n}"
                        }
                    }
                }
            ]
        }
    ]
}
```

## Summary

This authentication system provides:

- ✅ Complete user registration with email verification
- ✅ Secure JWT-based authentication
- ✅ Role-based authorization (4 roles)
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Admin panel for user management
- ✅ Production-ready security features

All code follows intermediate-level best practices with proper error handling, validation, and security measures.
