import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchMyEnrollments, fetchMyCreatedCourses } from '../../api/courses';

const ProgressBar = ({ percent = 0 }) => {
  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded bg-gray-200">
        <div
          className="h-2 rounded bg-[#FF6A00]"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[#4A4A4A]">{percent}% completed</p>
    </div>
  );
};

const MyCoursesPage = () => {
  const [tab, setTab] = useState('enrolled'); // enrolled | created
  const [enrolled, setEnrolled] = useState([]);
  const [created, setCreated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const [enRes, crRes] = await Promise.all([
        fetchMyEnrollments(),
        fetchMyCreatedCourses(),
      ]);

      setEnrolled(enRes?.enrollments || []);
      setCreated(crRes?.courses || []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.response?.data?.msg || 'Failed to load My Courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">My Courses</h1>
          <p className="text-sm text-[#4A4A4A]">Enrolled courses + courses you created</p>
        </div>
        <Link to="/courses">
          <Button className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">Browse Courses</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === 'enrolled' ? 'primary' : 'secondary'}
          className={tab === 'enrolled' ? 'bg-[#FF6A00] text-white' : 'border border-[#FF6A00] text-[#FF6A00]'}
          onClick={() => setTab('enrolled')}
        >
          Enrolled
        </Button>
        <Button
          variant={tab === 'created' ? 'primary' : 'secondary'}
          className={tab === 'created' ? 'bg-[#FF6A00] text-white' : 'border border-[#FF6A00] text-[#FF6A00]'}
          onClick={() => setTab('created')}
        >
          Created
        </Button>
        <Button
          variant="secondary"
          className="border border-gray-300 text-gray-700"
          onClick={load}
        >
          Refresh
        </Button>
      </div>

      {loading && <p className="text-sm text-[#4A4A4A]">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && tab === 'enrolled' && (
        <div className="grid gap-4 md:grid-cols-2">
          {enrolled.length === 0 ? (
            <Card>
              <p className="text-sm text-[#4A4A4A]">
                You are not enrolled in any course yet.
              </p>
            </Card>
          ) : (
            enrolled.map(item => (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[#1A1A1A]">
                      {item.course?.title}
                    </h2>
                    <p className="mt-1 text-xs text-[#4A4A4A]">
                      {item.course?.category} · {item.course?.level}
                    </p>

                    <ProgressBar percent={item.progress?.percent || 0} />
                  </div>

                  <Link to={`/courses/${item.course?._id}/content`}>
                    <Button size="sm" className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">
                      Open
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {!loading && !error && tab === 'created' && (
        <div className="grid gap-4 md:grid-cols-2">
          {created.length === 0 ? (
            <Card>
              <p className="text-sm text-[#4A4A4A]">
                You haven't created any courses yet.
              </p>
              <div className="mt-3">
                <Link to="/courses/create">
                  <Button className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">
                    Create Course
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            created.map(course => (
              <Card key={course._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[#1A1A1A]">
                      {course.title}
                    </h2>
                    <p className="mt-1 text-xs text-[#4A4A4A]">
                      {course.category} · {course.level}
                    </p>
                    <p className="mt-1 text-xs text-[#4A4A4A]">
                      Lessons: {course.totalLessons || 0} · Enrolled: {course.enrollCount || 0}
                    </p>
                    <p className="mt-1 text-xs">
                      Status:{' '}
                      <span className={course.isPublished ? 'text-green-700' : 'text-orange-600'}>
                        {course.isPublished ? 'Published' : 'Not Published'}
                      </span>
                    </p>
                  </div>

                  <Link to={`/courses/${course._id}/content`}>
                    <Button size="sm" className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
