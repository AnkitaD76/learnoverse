import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  fetchCourseById,
  enrollInCourse,
  enrollInCourseWithPoints,
  withdrawFromCourse,
} from '../../api/courses';
import { useWallet } from '../../contexts/WalletContext';
import { useSession } from '../../contexts/SessionContext';
import { fetchMyCreatedCourses } from '../../api/courses';
import { requestSkillSwap } from '../../api/skillSwap';
import ConfirmationModal from '../../components/wallet/ConfirmationModal';
import ReportButton from '../../components/ReportButton';
import ReportModal from '../../components/ReportModal';
import StarRating from '../../components/StarRating';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import { getUserReview, createReview, updateReview } from '../../api/reviews';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { wallet, hasSufficientBalance, refreshWallet } = useWallet();
  const { user } = useSession();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showPointsConfirm, setShowPointsConfirm] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [myCreatedCourses, setMyCreatedCourses] = useState([]);
  const [selectedMyCourseId, setSelectedMyCourseId] = useState(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchCourseById(courseId);
      setCourse(res.course);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to load course'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Load user's review if enrolled
  useEffect(() => {
    const loadUserReview = async () => {
      if (course && user && course.enrolled) {
        try {
          const response = await getUserReview(courseId);
          setUserReview(response.review);
        } catch (err) {
          console.error('Failed to load user review:', err);
        }
      }
    };

    loadUserReview();
  }, [courseId, user, course?.enrolled]);

  const openSwapModal = async () => {
    try {
      setShowSwapModal(true);
      const res = await fetchMyCreatedCourses();
      setMyCreatedCourses(res.courses || []);
    } catch (err) {
      console.error('Failed to load my created courses', err);
      setMyCreatedCourses([]);
    }
  };

  const handleRequestSwap = async () => {
    if (!selectedMyCourseId) return;
    try {
      setSwapLoading(true);
      await requestSkillSwap({
        toUserId: course.instructor._id || course.instructor,
        offeredCourseId: selectedMyCourseId,
        requestedCourseId: course._id,
      });
      setShowSwapModal(false);
      setSelectedMyCourseId(null);
      setInfo('Skill swap request sent');
    } catch (err) {
      console.error('Failed to request skill swap', err);
      setError(err.response?.data?.message || 'Failed to request skill swap');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setInfo(null);

      const res = await enrollInCourse(courseId);
      setInfo(res.message || 'Enrolled successfully');

      // ✅ go to My Courses so user sees it added
      setTimeout(() => {
        navigate('/my-courses');
      }, 400);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to enroll'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setInfo(null);

      const res = await withdrawFromCourse(courseId);
      setInfo(res.message || 'Withdrawn successfully');

      // reload course page data if needed
      await loadCourse();
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

  const handleEnrollWithPoints = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setInfo(null);

      const res = await enrollInCourseWithPoints(courseId);
      setInfo(res.message || 'Enrolled successfully with points!');
      setShowPointsConfirm(false);

      // Refresh wallet to show updated balance
      await refreshWallet();

      // Navigate to My Courses
      setTimeout(() => {
        navigate('/my-courses');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to enroll with points'
      );
      setShowPointsConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const canAffordCourse =
    wallet && course ? hasSufficientBalance(course.pricePoints) : false;

  // Review handlers
  const handleSubmitReview = async reviewData => {
    try {
      if (isEditingReview && userReview) {
        // Update existing review
        await updateReview(userReview._id, reviewData);
        setInfo('Review updated successfully!');
      } else {
        // Create new review
        await createReview(
          courseId,
          reviewData.courseRating,
          reviewData.instructorRating,
          reviewData.reviewText
        );
        setInfo('Review submitted successfully!');
      }

      // Reload user review and course data
      const response = await getUserReview(courseId);
      setUserReview(response.review);
      await loadCourse();
      setReviewRefreshKey(prev => prev + 1);

      setShowReviewForm(false);
      setIsEditingReview(false);
    } catch (err) {
      throw err; // Let ReviewForm handle the error display
    }
  };

  const handleEditReview = review => {
    setIsEditingReview(true);
    setShowReviewForm(true);
  };

  const handleReviewDeleted = async () => {
    setUserReview(null);
    await loadCourse();
    setReviewRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return <p className="text-sm text-[#4A4A4A]">Loading course...</p>;
  }

  if (!course) {
    return <p className="text-sm text-red-600">Course not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            {course.title}
          </h1>

          <p className="mt-1 text-sm text-[#4A4A4A]">
            {course.category} · {course.level}
          </p>

          <p className="mt-1 text-xs text-[#4A4A4A]">
            Instructor: {course.instructor?.name || '—'}
          </p>

          <p className="mt-4 text-sm text-[#4A4A4A]">
            {course.description || 'No description provided.'}
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-lg font-semibold text-[#FF6A00]">
                {course.pricePoints} points
              </span>
              {wallet && (
                <p className="mt-1 text-xs text-[#4A4A4A]">
                  Your balance: {wallet.available_balance.toLocaleString()}{' '}
                  points
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {course.skillSwapEnabled &&
              user &&
              String(user._id) !==
                String(course.instructor?._id || course.instructor) ? (
                <>
                  <Button
                    onClick={openSwapModal}
                    isLoading={actionLoading}
                    className="bg-[#0066CC] text-white hover:bg-[#005bb5]"
                  >
                    Request Skill Swap
                  </Button>

                  {/* Swap selection modal (simple) */}
                  {showSwapModal && (
                    <div
                      className="modal-overlay"
                      onClick={() => setShowSwapModal(false)}
                    >
                      <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">
                            Select one of your courses to offer
                          </h3>
                          <div className="mt-3 space-y-2">
                            {myCreatedCourses.length === 0 && (
                              <p className="text-sm text-gray-600">
                                You have no created courses.
                              </p>
                            )}
                            {myCreatedCourses.map(c => (
                              <label
                                key={c._id}
                                className="flex cursor-pointer items-center gap-2 rounded border p-2"
                              >
                                <input
                                  type="radio"
                                  name="myCourse"
                                  value={c._id}
                                  checked={selectedMyCourseId === String(c._id)}
                                  onChange={() =>
                                    setSelectedMyCourseId(String(c._id))
                                  }
                                />
                                <span>{c.title}</span>
                              </label>
                            ))}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={handleRequestSwap}
                              isLoading={swapLoading}
                              className="bg-[#FF6A00] text-white"
                            >
                              Send Request
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setShowSwapModal(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Button
                  onClick={handleEnroll}
                  isLoading={actionLoading}
                  className="bg-gray-600 text-white hover:bg-gray-700"
                >
                  Enroll (Free)
                </Button>
              )}

              <Button
                onClick={() => setShowPointsConfirm(true)}
                isLoading={actionLoading}
                disabled={!canAffordCourse}
                className="bg-[#FF6A00] text-white hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
                title={!canAffordCourse ? 'Insufficient points balance' : ''}
              >
                💰 Enroll with Points
              </Button>

              <Button
                onClick={handleWithdraw}
                variant="secondary"
                className="border border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF2E8]"
                isLoading={actionLoading}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-[#4A4A4A]">{info}</p>}

        {/* Report Button */}
        {course &&
          user &&
          course.instructor?._id !== user._id &&
          course.instructor?._id !== user.userId && (
            <div className="mt-4">
              <ReportButton
                variant="text"
                onReport={() => setShowReportModal(true)}
              />
            </div>
          )}

        {/* Course Rating Overview */}
        {course && course.reviewCount > 0 && (
          <Card>
            <div className="flex items-center gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <StarRating rating={course.averageRating} size="lg" />
                </div>
                <p className="text-sm text-gray-600">
                  {course.reviewCount}{' '}
                  {course.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Write Review Button (Only for enrolled students who haven't reviewed) */}
        {course && user && course.enrolled && !userReview && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Share Your Experience
                </h3>
                <p className="text-sm text-gray-600">
                  Help others by reviewing this course
                </p>
              </div>
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            </div>
          </Card>
        )}

        {/* User's Review (if exists) */}
        {userReview && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Review
              </h3>
              <Button
                variant="secondary"
                onClick={() => handleEditReview(userReview)}
              >
                Edit Review
              </Button>
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">
                  Course:
                </span>
                <StarRating
                  rating={userReview.courseRating}
                  size="sm"
                  showValue={true}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">
                  Instructor:
                </span>
                <StarRating
                  rating={userReview.instructorRating}
                  size="sm"
                  showValue={true}
                />
              </div>
            </div>
            {userReview.reviewText && (
              <p className="whitespace-pre-wrap text-gray-700">
                {userReview.reviewText}
              </p>
            )}
          </Card>
        )}

        {/* All Reviews List */}
        <Card>
          <ReviewList
            key={reviewRefreshKey}
            courseId={courseId}
            onEditReview={handleEditReview}
            onReviewDeleted={handleReviewDeleted}
          />
        </Card>

        {/* Enrollment Confirmation Modal */}
        <ConfirmationModal
          isOpen={showPointsConfirm}
          onClose={() => setShowPointsConfirm(false)}
          onConfirm={handleEnrollWithPoints}
          title="Enroll with Points"
          message={`You're about to enroll in "${course?.title}" using your points.`}
          details={[
            { label: 'Course', value: course?.title || '' },
            {
              label: 'Cost',
              value: `${course?.pricePoints?.toLocaleString()} points`,
            },
            {
              label: 'Your Balance',
              value: `${wallet?.available_balance?.toLocaleString()} points`,
            },
            {
              label: 'Balance After',
              value: `${(wallet?.available_balance - (course?.pricePoints || 0))?.toLocaleString()} points`,
            },
          ]}
          confirmText="Confirm Enrollment"
          isLoading={actionLoading}
        />

        {/* Report Modal */}
        {showReportModal && course && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            reportType="course"
            reportedEntity={course._id}
            reportedUser={course.instructor?._id}
          />
        )}

        {/* Review Form Modal */}
        {showReviewForm && course && (
          <ReviewForm
            isOpen={showReviewForm}
            onClose={() => {
              setShowReviewForm(false);
              setIsEditingReview(false);
            }}
            onSubmit={handleSubmitReview}
            initialData={isEditingReview ? userReview : null}
            isEditing={isEditingReview}
            courseName={course.title}
            instructorName={course.instructor?.name}
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
