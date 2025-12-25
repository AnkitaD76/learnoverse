import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { fetchCourses } from '../../api/courses';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = async (params = {}) => {
    try {
      setIsLoading(true);
      const res = await fetchCourses(params);
      setCourses(res.courses || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to load courses'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    loadCourses({ search, level });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">
              Browse Courses
            </h1>
            <p className="text-sm text-[#4A4A4A]">
              Explore learning opportunities
            </p>
          </div>
          <Link to="/courses/create">
            <Button className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">
              Create Course
            </Button>
          </Link>
        </div>

        <Card>
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row md:items-end"
          >
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]"
              >
                <option value="">All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Button
              type="submit"
              className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
            >
              Apply Filters
            </Button>
          </form>
        </Card>

        {isLoading && (
          <p className="text-sm text-[#4A4A4A]">Loading courses...</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {courses.map(course => (
            <Card key={course._id}>
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    {course.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#4A4A4A]">
                    {course.category} · {course.level}
                  </p>
                  <p className="mt-1 text-xs text-[#4A4A4A]">
                    Instructor: {course.instructor?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm font-semibold text-[#FF6A00]">
                    {course.pricePoints} pts
                  </span>
                  <Link to={`/courses/${course._id}`}>
                    <Button
                      size="sm"
                      className="mt-2 bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {courses.length === 0 && !isLoading && !error && (
            <p className="text-sm text-[#4A4A4A]">
              No courses yet. Be the first to create one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
