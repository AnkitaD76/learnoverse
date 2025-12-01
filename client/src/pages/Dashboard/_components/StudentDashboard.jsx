import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  // Mock data - replace with actual API calls
  const enrolledCourses = [
    // { id: 1, title: 'Web Development Bootcamp', progress: 65, instructor: 'John Doe' },
    // { id: 2, title: 'Data Science Fundamentals', progress: 30, instructor: 'Jane Smith' },
  ];

  const recentActivity = [
    // { id: 1, action: 'Completed lesson', course: 'Web Development', time: '2 hours ago' },
    // { id: 2, action: 'Enrolled in course', course: 'Data Science', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#FF6A00]">
              {enrolledCourses.length}
            </p>
            <p className="mt-2 text-sm text-[#4A4A4A]">Enrolled Courses</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#1EB5A6]">0</p>
            <p className="mt-2 text-sm text-[#4A4A4A]">Completed Courses</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#043F7B]">0</p>
            <p className="mt-2 text-sm text-[#4A4A4A]">Certificates Earned</p>
          </div>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            My Enrolled Courses
          </h3>
          <Link to="/courses">
            <Button variant="outline" size="sm">
              Browse Courses
            </Button>
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-[#4A4A4A]">
              You haven't enrolled in any courses yet.
            </p>
            <Link to="/courses">
              <Button className="mt-4">Explore Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrolledCourses.map(course => (
              <div
                key={course.id}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#FF6A00]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">
                      {course.title}
                    </h4>
                    <p className="text-sm text-[#4A4A4A]">
                      by {course.instructor}
                    </p>
                  </div>
                  <Button size="sm">Continue</Button>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-sm text-[#4A4A4A]">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-[#FF6A00]"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
          Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-[#4A4A4A]">No recent activity to display.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {activity.action}
                  </p>
                  <p className="text-xs text-[#4A4A4A]">{activity.course}</p>
                </div>
                <span className="text-xs text-[#4A4A4A]">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
