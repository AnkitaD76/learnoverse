<<<<<<< HEAD
=======
import CoursesPage from '../pages/courses/page';
import CourseDetailPage from '../pages/CourseDetails/page';
import CourseContentPage from '../pages/CourseContent/page';
import CreateCoursePage from '../pages/CreateCourse/page';


>>>>>>> 618ae80c8785cc51aaeb46b50103e6a39a7e6932
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
import ProfilePage from '../pages/Profile/page';
import SettingsPage from '../pages/Settings/page';
import PostsPage from '../pages/Posts/page';

// Courses
import CoursesPage from '../pages/courses/page';
import CourseDetailPage from '../pages/coursedetails/page';
import CreateCoursePage from '../pages/CreateCourse/page';

// ✅ NEW: My Courses
import MyCoursesPage from '../pages/MyCourses/page';

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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ My Courses */}
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <MyCoursesPage />
          </ProtectedRoute>
        }
      />

      {/* Course Routes */}
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/create"
        element={
          <ProtectedRoute>
            <CreateCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/content"
        element={
          <ProtectedRoute>
            <CourseContentPage />
          </ProtectedRoute>
        }
      />

      {/* Posts */}
      <Route path="/posts" element={<PostsPage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
