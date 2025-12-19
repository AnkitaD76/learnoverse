import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { fetchCourseById, withdrawFromCourse, fetchCourseEnrollments } from '../../api/courses';

const CourseContentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewingLesson, setViewingLesson] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchCourseById(courseId);
        setCourse(res.course);

        // Fetch enrolled students
        setEnrollmentsLoading(true);
        const enrollmentsRes = await fetchCourseEnrollments(courseId);
        setEnrolledUsers(enrollmentsRes.enrollments || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            'Failed to load course'
        );
      } finally {
        setIsLoading(false);
        setEnrollmentsLoading(false);
      }
    };

    load();
  }, [courseId]);

  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await withdrawFromCourse(courseId);
      setInfo(res.message || 'Withdrawn successfully');
      setShowConfirm(false);
      // Navigate to courses page after 1 second
      setTimeout(() => {
        navigate('/courses');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to withdraw'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[#4A4A4A]">Loading course...</p>;
  }

  if (!course) {
    return <p className="text-sm text-red-600">Course not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Course Header */}
        <Card className="border-l-4 border-l-[#FF6A00]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {course.title}
              </h1>
              <p className="mt-2 text-sm text-[#4A4A4A]">
                {course.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex gap-4">
                <div>
                  <p className="text-xs text-[#4A4A4A]">Category</p>
                  <p className="font-semibold text-[#1A1A1A]">{course.category}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4A4A4A]">Level</p>
                  <p className="font-semibold text-[#1A1A1A]">{course.level}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4A4A4A]">Points</p>
                  <p className="font-semibold text-[#FF6A00]">{course.pricePoints}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructor Info */}
        <Card>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Instructor</h2>
          <div className="mt-4">
            <p className="font-medium text-[#1A1A1A]">
              {course.instructor?.name || 'Unknown'}
            </p>
            <p className="text-sm text-[#4A4A4A]">
              {course.instructor?.email || 'No email available'}
            </p>
          </div>
        </Card>

        {/* Course Content */}
        <Card>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Course Content</h2>
          {!course.lessons || course.lessons.length === 0 ? (
            <p className="mt-4 text-sm text-[#4A4A4A]">
              No lessons added yet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson._id || index}
                  className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4 hover:bg-white transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-[#1A1A1A]">
                        {lesson.order + 1}. {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-[#4A4A4A] capitalize">
                        {lesson.type === 'video' && '▶ Video Lesson'}
                        {lesson.type === 'text' && '📄 Text Lesson'}
                        {lesson.type === 'live' && '🔴 Live Session'}
                        {lesson.type === 'quiz' && '❓ Quiz'}
                      </p>
                      {lesson.type === 'video' && lesson.contentUrl && (
                        <p className="mt-2 text-xs text-[#FF6A00] truncate">
                          {lesson.contentUrl}
                        </p>
                      )}
                      {lesson.type === 'live' && lesson.live?.roomName && (
                        <p className="mt-2 text-xs text-[#4A4A4A]">
                          Room: {lesson.live.roomName}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => setViewingLesson(lesson)}
                      className="rounded bg-[#FF6A00] px-3 py-1 text-sm font-medium text-white hover:bg-[#e85f00] flex-shrink-0"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Enrollments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Students Enrolled ({enrolledUsers.length})
            </h2>
            <Button
              onClick={() => setShowConfirm(true)}
              variant="secondary"
              className="border border-red-600 text-red-600 hover:bg-red-50"
              isLoading={actionLoading}
            >
              Withdraw from Course
            </Button>
          </div>

          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : enrolledUsers.length === 0 ? (
            <p className="text-sm text-[#4A4A4A]">No students enrolled yet.</p>
          ) : (
            <div className="space-y-3">
              {enrolledUsers.map(enrollment => (
                <div
                  key={enrollment._id}
                  className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] p-4 hover:bg-[#F9F9F9] transition"
                >
                  {/* Avatar */}
                  {enrollment.user.avatar ? (
                    <img
                      src={enrollment.user.avatar}
                      alt={enrollment.user.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#e85f00] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {enrollment.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A1A]">
                      {enrollment.user.name}
                    </p>
                    <p className="text-sm text-[#4A4A4A] truncate">
                      {enrollment.user.email}
                    </p>
                    <p className="text-xs text-[#4A4A4A] mt-1">
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 flex-shrink-0">
                    {enrollment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
            {info}
          </div>
        )}

        {/* Withdrawal Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <Card className="w-full max-w-sm p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">
                Withdraw from Course?
              </h3>
              <p className="mt-3 text-sm text-[#4A4A4A]">
                Are you sure you want to withdraw from <strong>{course.title}</strong>?
                This action cannot be undone.
              </p>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={actionLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleWithdraw}
                  isLoading={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Withdraw
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Lesson Viewer Modal */}
        {viewingLesson && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                  {viewingLesson.order + 1}. {viewingLesson.title}
                </h2>
                <button
                  onClick={() => setViewingLesson(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Video Lesson */}
                {viewingLesson.type === 'video' && (
                  <div>
                    <p className="text-sm text-[#4A4A4A] mb-3">▶ Video Lesson</p>
                    {viewingLesson.contentUrl ? (
                      <div className="space-y-3">
                        <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4">
                          <p className="text-sm font-medium text-[#1A1A1A] mb-2">Video URL:</p>
                          <a
                            href={viewingLesson.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF6A00] hover:underline break-all text-sm"
                          >
                            {viewingLesson.contentUrl}
                          </a>
                        </div>
                        <Button
                          onClick={() => window.open(viewingLesson.contentUrl, '_blank')}
                          className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                        >
                          Open Video
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-[#4A4A4A]">No video URL provided.</p>
                    )}
                  </div>
                )}

                {/* Text Lesson */}
                {viewingLesson.type === 'text' && (
                  <div>
                    <p className="text-sm text-[#4A4A4A] mb-3">📄 Text Lesson</p>
                    {viewingLesson.textContent ? (
                      <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4 whitespace-pre-wrap text-sm text-[#1A1A1A]">
                        {viewingLesson.textContent}
                      </div>
                    ) : (
                      <p className="text-sm text-[#4A4A4A]">No text content provided.</p>
                    )}
                  </div>
                )}

                {/* Live Session */}
                {viewingLesson.type === 'live' && (
                  <div>
                    <p className="text-sm text-[#4A4A4A] mb-3">🔴 Live Session</p>
                    <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                      {viewingLesson.live?.roomName && (
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">Room:</p>
                          <p className="text-sm text-[#FF6A00]">{viewingLesson.live.roomName}</p>
                        </div>
                      )}
                      {viewingLesson.live?.startTime && (
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">Start Time:</p>
                          <p className="text-sm text-[#4A4A4A]">
                            {new Date(viewingLesson.live.startTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                      <Button className="bg-[#FF6A00] text-white hover:bg-[#e85f00] w-full">
                        Join Live Session
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quiz Lesson */}
                {viewingLesson.type === 'quiz' && (
                  <div>
                    <p className="text-sm text-[#4A4A4A] mb-3">❓ Quiz</p>
                    <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg p-4">
                      <p className="text-sm text-[#4A4A4A]">Quiz content coming soon...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  onClick={() => setViewingLesson(null)}
                  variant="secondary"
                  className="border border-gray-300"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentPage;
