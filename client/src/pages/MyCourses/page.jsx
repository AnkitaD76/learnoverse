import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchMyEnrollments, fetchMyCreatedCourses } from '../../api/courses';
import ReportButton from '../../components/ReportButton';
import ReportModal from '../../components/ReportModal';
import ReviewForm from '../../components/ReviewForm';
import ReviewOptionsModal from '../../components/ReviewOptionsModal';
import { Star } from 'lucide-react';
import { createReview, getUserReview, deleteReview } from '../../api/reviews';

const ProgressBar = ({ progress = {} }) => {
  const overallPercent = progress?.overall || 0;
  const lessonsPercent = progress?.lessons || 0;
  const evaluationsPercent = progress?.evaluations || 0;

  return (
    <div className="mt-2 space-y-2">
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between text-xs text-[#4A4A4A]">
          <span>Overall Progress</span>
          <span>{overallPercent}%</span>
        </div>
        <div className="h-2 w-full rounded bg-gray-200">
          <div
            className="h-2 rounded bg-[#FF6A00]"
            style={{ width: `${Math.min(100, Math.max(0, overallPercent))}%` }}
          />
        </div>
      </div>

      {/* Lessons Progress */}
      <div className="flex items-center gap-2 text-xs text-[#4A4A4A]">
        <span>📚 Lessons:</span>
        <span>
          {progress?.completedLessons || 0}/{progress?.totalLessons || 0}
        </span>
        <div className="h-1.5 flex-1 rounded bg-gray-200">
          <div
            className="h-1.5 rounded bg-blue-500"
            style={{ width: `${Math.min(100, Math.max(0, lessonsPercent))}%` }}
          />
        </div>
      </div>

      {/* Evaluations Progress */}
      {(progress?.totalEvaluations || 0) > 0 && (
        <div className="flex items-center gap-2 text-xs text-[#4A4A4A]">
          <span>📝 Evaluations:</span>
          <span>
            {progress?.passedEvaluations || 0}/{progress?.totalEvaluations || 0}{' '}
            passed
          </span>
          <div className="h-1.5 flex-1 rounded bg-gray-200">
            <div
              className="h-1.5 rounded bg-green-500"
              style={{
                width: `${Math.min(100, Math.max(0, evaluationsPercent))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MyCoursesPage = () => {
  const [tab, setTab] = useState('enrolled'); // enrolled | created
  const [enrolled, setEnrolled] = useState([]);
  const [created, setCreated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCourse, setReportingCourse] = useState(null);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingCourse, setReviewingCourse] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingReviewCourse, setPendingReviewCourse] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.msg ||
          'Failed to load My Courses'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReportCourse = course => {
    setReportingCourse(course);
    setShowReportModal(true);
  };

  const handleOpenReview = async (course, enrollment) => {
    // Check if user already has a review for this course
    try {
      const res = await getUserReview(course._id);
      if (res.review) {
        setExistingReview(res.review);
        setPendingReviewCourse({ ...course, enrollment });
        setShowDeleteConfirm(true);
        return;
      }
    } catch (err) {
      // No existing review, that's fine
    }

    setReviewingCourse({ ...course, enrollment });
    setExistingReview(null);
    setShowReviewModal(true);
  };

  const handleConfirmDeleteAndReview = async () => {
    if (!existingReview || !pendingReviewCourse) return;

    try {
      setDeleteLoading(true);
      await deleteReview(existingReview._id);
      setShowDeleteConfirm(false);
      setExistingReview(null);
      setReviewingCourse(pendingReviewCourse);
      setPendingReviewCourse(null);
      setShowReviewModal(true);
    } catch (deleteErr) {
      setError(deleteErr.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitReview = async ({
    courseRating,
    instructorRating,
    reviewText,
  }) => {
    if (!reviewingCourse) return;

    await createReview(
      reviewingCourse._id,
      courseRating,
      instructorRating,
      reviewText
    );

    setShowReviewModal(false);
    setReviewingCourse(null);
    setExistingReview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">
              My Courses
            </h1>
            <p className="text-sm text-[#4A4A4A]">
              Enrolled courses + courses you created
            </p>
          </div>
          <Link to="/courses">
            <Button className="bg-[#FF6A00] text-white hover:bg-[#e85f00]">
              Browse Courses
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Button
            variant={tab === 'enrolled' ? 'primary' : 'secondary'}
            className={
              tab === 'enrolled'
                ? 'bg-[#FF6A00] text-white'
                : 'border border-[#FF6A00] text-[#FF6A00]'
            }
            onClick={() => setTab('enrolled')}
          >
            Enrolled
          </Button>
          <Button
            variant={tab === 'created' ? 'primary' : 'secondary'}
            className={
              tab === 'created'
                ? 'bg-[#FF6A00] text-white'
                : 'border border-[#FF6A00] text-[#FF6A00]'
            }
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
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-semibold text-[#1A1A1A]">
                          {item.course?.title}
                        </h2>
                        <p className="mt-1 text-xs text-[#4A4A4A]">
                          {item.course?.category} · {item.course?.level}
                        </p>

                        <ProgressBar progress={item.progress} />

                        {item.isComplete && (
                          <p className="mt-2 text-xs font-medium text-green-600">
                            ✅ Course Complete!
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenReview(item.course, item)}
                          className="rounded-lg p-2 text-yellow-500 transition-colors hover:bg-yellow-50 hover:text-yellow-600"
                          title="Write a review"
                        >
                          <Star size={18} />
                        </button>
                        <ReportButton
                          onReport={() => handleReportCourse(item.course)}
                        />
                        <Link to={`/courses/${item.course?._id}/content`}>
                          <Button
                            size="sm"
                            className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                          >
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/courses/${item.course?._id}/student/evaluations`}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                        >
                          📝 Quizzes & Assignments
                        </Button>
                      </Link>
                    </div>
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
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-[#1A1A1A]">
                          {course.title}
                        </h2>
                        <p className="mt-1 text-xs text-[#4A4A4A]">
                          {course.category} · {course.level}
                        </p>
                        <p className="mt-1 text-xs text-[#4A4A4A]">
                          Lessons: {course.totalLessons || 0} · Enrolled:{' '}
                          {course.enrollCount || 0}
                        </p>
                        <p className="mt-1 text-xs">
                          Status:{' '}
                          <span
                            className={
                              course.isPublished
                                ? 'text-green-700'
                                : 'text-orange-600'
                            }
                          >
                            {course.isPublished ? 'Published' : 'Not Published'}
                          </span>
                        </p>
                      </div>

                      <Link to={`/courses/${course._id}/content`}>
                        <Button
                          size="sm"
                          className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                        >
                          View
                        </Button>
                      </Link>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/courses/${course._id}/manage-lessons`}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                        >
                          Manage Lessons
                        </Button>
                      </Link>
                      <Link to={`/courses/${course._id}/evaluations`}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                        >
                          Quizzes & Assignments
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && reportingCourse && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportingCourse(null);
          }}
          reportType="course"
          reportedEntity={reportingCourse._id}
          reportedUser={reportingCourse.instructor?._id}
        />
      )}

      {/* Delete Review Confirmation Modal */}
      {/* Review Options Modal - Shows existing review with delete option */}
      <ReviewOptionsModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPendingReviewCourse(null);
          setExistingReview(null);
        }}
        onDeleteAndReview={handleConfirmDeleteAndReview}
        existingReview={existingReview}
        courseName={pendingReviewCourse?.title}
        instructorName={pendingReviewCourse?.instructor?.name}
        isLoading={deleteLoading}
      />

      {/* Review Modal */}
      <ReviewForm
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewingCourse(null);
          setExistingReview(null);
        }}
        onSubmit={handleSubmitReview}
        courseName={reviewingCourse?.title}
        instructorName={reviewingCourse?.instructor?.name}
      />
    </div>
  );
};

export default MyCoursesPage;
