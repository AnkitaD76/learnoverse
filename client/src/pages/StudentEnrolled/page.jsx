import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { fetchCourseById, fetchCourseEnrollments } from '../../api/courses';

const StudentEnrolledPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        // Fetch course details
        const courseRes = await fetchCourseById(courseId);
        setCourse(courseRes.course);

        // Fetch enrolled students
        const enrollmentsRes = await fetchCourseEnrollments(courseId);
        setEnrolledUsers(enrollmentsRes.enrollments || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            'Failed to load enrolled students'
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="text-[#FF6A00] hover:underline text-sm font-medium mb-4"
          >
            ← Back
          </button>
          <Card className="bg-red-50 border border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-[#FF6A00] hover:underline text-sm font-medium mb-4"
          >
            ← Back to Course
          </button>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Students Enrolled in {course?.title}
          </h1>
          <p className="mt-2 text-sm text-[#4A4A4A]">
            Total: {enrolledUsers.length} student{enrolledUsers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Students List */}
        <Card>
          {enrolledUsers.length === 0 ? (
            <p className="text-center text-[#4A4A4A] py-8">No students enrolled yet.</p>
          ) : (
            <div className="space-y-3">
              {enrolledUsers.map((enrollment, index) => (
                <div
                  key={enrollment._id}
                  className="flex items-center gap-4 rounded-lg border border-[#E5E5E5] p-4 hover:bg-[#F9F9F9] transition"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {enrollment.user.avatar ? (
                      <img
                        src={enrollment.user.avatar}
                        alt={enrollment.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#e85f00] flex items-center justify-center text-white font-semibold text-lg">
                        {enrollment.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1A1A1A]">
                        {index + 1}. {enrollment.user.name}
                      </p>
                      <span className="text-xs font-semibold capitalize text-white bg-[#FF6A00] px-2 py-1 rounded">
                        {enrollment.user.role}
                      </span>
                    </div>
                    <p className="text-sm text-[#4A4A4A] truncate">
                      {enrollment.user.email}
                    </p>
                    <p className="text-xs text-[#4A4A4A] mt-1">
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Course Info */}
        <Card>
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Course Information</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-[#4A4A4A]">Category</p>
              <p className="font-medium text-[#1A1A1A]">{course?.category}</p>
            </div>
            <div>
              <p className="text-xs text-[#4A4A4A]">Level</p>
              <p className="font-medium text-[#1A1A1A]">{course?.level}</p>
            </div>
            <div>
              <p className="text-xs text-[#4A4A4A]">Points</p>
              <p className="font-medium text-[#FF6A00]">{course?.pricePoints}</p>
            </div>
            <div>
              <p className="text-xs text-[#4A4A4A]">Total Enrolled</p>
              <p className="font-medium text-[#1A1A1A]">{course?.enrollCount}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentEnrolledPage;
