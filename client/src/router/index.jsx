import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import LandingPage from '../pages/Landing/page';
import LoginPage from '../pages/Login/page';
import RegisterPage from '../pages/Register/page';
import VerifyEmailPage from '../pages/VerifyEmail/page';
import ForgotPasswordPage from '../pages/ForgotPassword/page';
import ResetPasswordPage from '../pages/ResetPassword/page';
import DashboardPage from '../pages/Dashboard/page';
import PostsPage from '../pages/Posts/page';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/posts" element={<PostsPage />} />

      {/* Redirect unknown routes to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
