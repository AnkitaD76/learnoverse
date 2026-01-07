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

// ✅ Notifications
import NotificationsPage from '../pages/Notifications/page';

// Courses
import CoursesPage from '../pages/Courses/page';
import CourseDetailPage from '../pages/CourseDetails/page';
import CourseContentPage from '../pages/CourseContent/page';
import CreateCoursePage from '../pages/CreateCourse/page';
import ManageLessonsPage from '../pages/ManageLessons/page';
import LiveSessionPage from '../pages/LiveSession/page';

// ✅ NEW: My Courses
import MyCoursesPage from '../pages/MyCourses/page';

// ✅ NEW: Student Enrolled
import StudentEnrolledPage from '../pages/StudentEnrolled/page';

// Wallet
import WalletDashboard from '../pages/Wallet/page';
import BuyPoints from '../pages/BuyPoints/page';
import SellPoints from '../pages/SellPoints/page';
import TransactionHistory from '../pages/TransactionHistory/page';

// Q&A
import QuestionsListPage from '../pages/QA/QuestionsListPage';
import AskQuestionPage from '../pages/QA/AskQuestionPage';
import QuestionDetailPage from '../pages/QA/QuestionDetailPage';

// Search
import SearchPage from '../pages/Search/page';

// Reports
import MyReportsPage from '../pages/MyReports';
import AdminReportsPage from '../pages/AdminReports';

// Certificate
import CertificatePage from '../pages/Certificate/page';

// Achievements
import AchievementsPage from '../pages/Achievements/page';

// Evaluations
import { InstructorEvaluationsPage } from '../pages/InstructorEvaluations/page';
import { CreateEvaluationPage } from '../pages/CreateEvaluation/page';
import { EvaluationSubmissionsPage } from '../pages/EvaluationSubmissions/page';
import { StudentEvaluationsPage } from '../pages/StudentEvaluations/page';
import { AttemptEvaluationPage } from '../pages/AttemptEvaluation/page';
import { ViewSubmissionPage } from '../pages/ViewSubmission/page';

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

      {/* ✅ Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
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
      <Route
        path="/courses/:courseId/manage-lessons"
        element={
          <ProtectedRoute>
            <ManageLessonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/lessons/:lessonId/live"
        element={
          <ProtectedRoute>
            <LiveSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/enrolled-students"
        element={
          <ProtectedRoute>
            <StudentEnrolledPage />
          </ProtectedRoute>
        }
      />

      {/* Evaluation Routes - Instructor */}
      <Route
        path="/courses/:courseId/evaluations"
        element={
          <ProtectedRoute>
            <InstructorEvaluationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/evaluations/create"
        element={
          <ProtectedRoute>
            <CreateEvaluationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evaluations/:evaluationId/submissions"
        element={
          <ProtectedRoute>
            <EvaluationSubmissionsPage />
          </ProtectedRoute>
        }
      />

      {/* Evaluation Routes - Student */}
      <Route
        path="/courses/:courseId/student/evaluations"
        element={
          <ProtectedRoute>
            <StudentEvaluationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evaluations/:evaluationId/attempt"
        element={
          <ProtectedRoute>
            <AttemptEvaluationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evaluations/:evaluationId/view"
        element={
          <ProtectedRoute>
            <ViewSubmissionPage />
          </ProtectedRoute>
        }
      />

      {/* Posts */}
      <Route path="/posts" element={<PostsPage />} />

      {/* Search */}
      <Route path="/search" element={<SearchPage />} />

      {/* Certificate - Public Route */}
      <Route path="/certificates/:certificateId" element={<CertificatePage />} />

      {/* Achievements - Protected Route */}
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        }
      />

      {/* Q&A Routes */}
      <Route path="/qa" element={<QuestionsListPage />} />
      <Route
        path="/qa/ask"
        element={
          <ProtectedRoute>
            <AskQuestionPage />
          </ProtectedRoute>
        }
      />
      <Route path="/qa/:id" element={<QuestionDetailPage />} />

      {/* Wallet Routes */}
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet/buy"
        element={
          <ProtectedRoute>
            <BuyPoints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet/sell"
        element={
          <ProtectedRoute>
            <SellPoints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet/transactions"
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />

      {/* Report Routes */}
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <MyReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
