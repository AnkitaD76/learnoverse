import { useSession } from '../../contexts/SessionContext';
import { Card } from '../../components/Card';
import { StudentDashboard } from './_components/StudentDashboard';
import { InstructorDashboard } from './_components/InstructorDashboard';
import { AdminDashboard } from './_components/AdminDashboard';

const DashboardPage = () => {
  const { user } = useSession();

  const renderRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'student':
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}! Here's your overview.
          </p>
        </div>

        {renderRoleBasedDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;
