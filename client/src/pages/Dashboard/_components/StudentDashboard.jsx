import { Card } from '../../../components/Card';

export const StudentDashboard = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Student Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="mt-1 text-sm text-gray-600">Enrolled Courses</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="mt-1 text-sm text-gray-600">Completed Courses</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="mt-1 text-sm text-gray-600">Certificates</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-gray-800">
          Recent Activity
        </h3>
        <p className="text-sm text-gray-600">No recent activity to display.</p>
      </Card>
    </div>
  );
};
