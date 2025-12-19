import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { fetchDashboard } from '../../../api/dashboard';
import { useSession } from '../../../contexts/SessionContext';

export const StudentDashboard = () => {
  const { user } = useSession();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            'Failed to load dashboard'
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const enrolledCourses = data?.enrolledCourses || [];
  const recommendations = data?.recommendedCourses || [];
  const skillSwapMatches = data?.skillSwapMatches || [];
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            Welcome back, {user?.name || 'Learner'} 👋
          </h1>
          <p className="mt-1 text-sm text-[#4A4A4A]">
            Here’s an overview of your learning progress and new opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/courses">
            <Button className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">
              Browse Courses
            </Button>
          </Link>
          <Link to="/courses/create">
            <Button
              variant="secondary"
              className="border border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF2E8]"
            >
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#FFF2E8]">
          <p className="text-sm text-[#4A4A4A]">Active Enrollments</p>
          <p className="mt-2 text-3xl font-semibold text-[#FF6A00]">
            {stats.totalEnrolledCourses || 0}
          </p>
        </Card>
        <Card className="bg-[#E8F5FF]">
          <p className="text-sm text-[#4A4A4A]">Skill Swap Points</p>
          <p className="mt-2 text-3xl font-semibold text-[#0077CC]">
            {stats.pointsBalance ?? 0}
          </p>
        </Card>
        <Card className="bg-[#F3E8FF]">
          <p className="text-sm text-[#4A4A4A]">Skill Matches</p>
          <p className="mt-2 text-3xl font-semibold text-[#7A3EFF]">
            {skillSwapMatches.length}
          </p>
        </Card>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <p className="text-sm text-[#4A4A4A]">Loading dashboard...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Enrolled Courses */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Your Courses</h2>
          <Link
            to="/courses"
            className="text-sm font-medium text-[#FF6A00] hover:underline"
          >
            View all
          </Link>
        </div>
        {enrolledCourses.length === 0 ? (
          <p className="text-sm text-[#4A4A4A]">
            You’re not enrolled in any courses yet. Start by exploring the
            catalog!
          </p>
        ) : (
          <div className="space-y-3">
            {enrolledCourses.map(({ course, _id }) => (
              <div
                key={_id}
                className="flex items-center justify-between rounded-lg border border-[#E5E5E5] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {course?.title}
                  </p>
                  <p className="text-xs text-[#4A4A4A]">
                    {course?.category} · {course?.level}
                  </p>
                </div>
                <Link to={`/courses/${course?._id}`}>
                  <Button
                    size="sm"
                    className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                  >
                    Continue
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recommendations */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            Recommended for You
          </h2>
        </div>
        {recommendations.length === 0 ? (
          <p className="text-sm text-[#4A4A4A]">
            No recommendations yet. Enroll in some courses to get smarter
            suggestions.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map(course => (
              <div
                key={course._id}
                className="rounded-lg border border-[#E5E5E5] p-4"
              >
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {course.title}
                </p>
                <p className="mt-1 text-xs text-[#4A4A4A]">
                  {course.category} · {course.level}
                </p>
                <p className="mt-1 text-xs text-[#4A4A4A]">
                  Instructor: {course.instructor?.name}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#FF6A00]">
                    {course.pricePoints} pts
                  </span>
                  <Link to={`/courses/${course._id}`}>
                    <Button
                      size="sm"
                      className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Skill Swap Matches */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            Skill Swap Opportunities
          </h2>
          <p className="text-xs text-[#4A4A4A]">
            Based on your skills offered & wanted
          </p>
        </div>
        {skillSwapMatches.length === 0 ? (
          <p className="text-sm text-[#4A4A4A]">
            No matches yet. Update your profile with skills you can offer and
            skills you want to learn.
          </p>
        ) : (
          <div className="space-y-3">
            {skillSwapMatches.map(match => (
              <div
                key={match._id}
                className="flex items-center justify-between rounded-lg border border-[#E5E5E5] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {match.name}
                  </p>
                  <p className="mt-1 text-xs text-[#4A4A4A]">
                    Offers: {(match.skillsOffered || []).join(', ') || '—'}
                  </p>
                  <p className="text-xs text-[#4A4A4A]">
                    Wants: {(match.skillsWanted || []).join(', ') || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
