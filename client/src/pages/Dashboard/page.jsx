import { useSession } from '../../contexts/SessionContext';
import { Card } from '../../components/Card';
import { UserAvatar } from './_components/UserAvatar';
import { UserDetails } from './_components/UserDetails';
import { LogoutButton } from './_components/LogoutButton';
import { ProfileEditForm } from './_components/ProfileEditForm';
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1">
            <Card>
              <UserAvatar name={user?.name} email={user?.email} />

              <div className="mt-6 border-t border-gray-200 pt-6">
                <UserDetails user={user} />
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <ProfileEditForm user={user} />
              </div>
            </Card>
          </div>

          {/* Right Column - Role-Based Dashboard */}
          <div className="lg:col-span-2">{renderRoleBasedDashboard()}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
