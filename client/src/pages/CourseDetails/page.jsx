import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  fetchCourseById,
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

  const { user, isAuthenticated } = useSession();
  const { wallet } = useWallet();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showPointsConfirm, setShowPointsConfirm] = useState(false);

  // Skill swap states
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [myCreatedCourses, setMyCreatedCourses] = useState([]);
  const [selectedMyCourseId, setSelectedMyCourseId] = useState(null);
  const [swapLoading, setSwapLoading] = useState(false);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchCourseById(courseId);
      setCourse(res.course || res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Load current user's review if enrolled
  useEffect(() => {
    const loadUserReview = async () => {
      if (!user || !courseId) return;

      // only if enrolled info exists in course object
      if (!course?.enrolled) return;

      try {
        const res = await getUserReview(courseId);
        setUserReview(res.review || null);
      } catch (err) {
        // no review yet is not an error
        if (err.response?.status !== 404) {
          console.error('Failed to load user review:', err);
        }
      }
    };

    loadUserReview();
  }, [courseId, user, course?.enrolled]);

  const handleEnrollWithPoints = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowPointsConfirm(true);
  };

  const confirmEnrollWithPoints = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setInfo(null);

      const res = await enrollInCourseWithPoints(courseId);
      setInfo(res.message || 'Enrolled with points successfully');

      await loadCourse();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to enroll with points');
    } finally {
      setActionLoading(false);
      setShowPointsConfirm(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setInfo(null);

      const res = await withdrawFromCourse(courseId);
      setInfo(res.message || 'Withdrawn successfully');

      await loadCourse();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Skill swap modal opener (with "must have at least 1 created course" rule)
  const openSwapModal = async () => {
    try {
      setError(null);
      setInfo(null);
      setShowSwapModal(true);

      const res = await fetchMyCreatedCourses();
      const list = res.courses || [];

      // Must have at least one created course to offer
      if (!list.length) {
        setShowSwapModal(false);
        setError(
          'You must create at least one course before requesting a skill swap.'
        );
        setMyCreatedCourses([]);
        return;
      }

      setMyCreatedCourses(list);
    } catch (err) {
      console.error('Failed to load my created courses', err);
      setShowSwapModal(false);
      setMyCreatedCourses([]);
      setError('Failed to load your created courses.');
    }
  };

  // ✅ Skill swap request sender (must select at least 1 course)
  const handleRequestSwap = async () => {
    if (!selectedMyCourseId) {
      setError('Please select at least one of your courses to offer.');
      return;
    }
    try {
      setSwapLoading(true);
      setError(null);
      setInfo(null);

      await requestSkillSwap({
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

  // Reviews
  const openReviewForm = () => {
    setShowReviewForm(true);
    setIsEditingReview(false);
  };

  const openEditReviewForm = () => {
    setShowReviewForm(true);
    setIsEditingReview(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setIsEditingReview(false);
  };

  const submitReview = async ({ rating, comment }) => {
    try {
      setReviewLoading(true);
      setError(null);
      setInfo(null);

      let res;
      if (isEditingReview && userReview) {
        res = await updateReview(courseId, { rating, comment });
        setInfo(res.message || 'Review updated');
      } else {
        res = await createReview(courseId, { rating, comment });
        setInfo(res.message || 'Review submitted');
      }

      // refresh user review
      const ur = await getUserReview(courseId);
      setUserReview(ur.review || null);

      closeReviewForm();
      await loadCourse();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-6">Loading...</Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="mb-4">Course not found.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const isOwner =
    user &&
    String(user._id) === String(course.instructor?._id || course.instructor);

  return (
    <div className="space-y-5 p-6">
      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </Card>
      )}
      {info && (
        <Card className="border-green-200 bg-green-50 p-4 text-green-700">
          {info}
        </Card>
      )}

      <Card className="space-y-3 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{course.title}</h1>
            <p className="text-sm opacity-80">
              Instructor: {course.instructor?.name || 'Unknown'}
            </p>
            <p className="text-sm opacity-80">
              Category: {course.category || 'N/A'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {!!course.averageRating && (
              <div className="flex items-center gap-2">
                <StarRating rating={course.averageRating} />
                <span className="text-sm opacity-80">
                  ({course.totalReviews || 0})
                </span>
              </div>
            )}

            {!!wallet?.available_balance && (
              <p className="text-xs opacity-80">
                Wallet: {wallet.available_balance.toLocaleString()} points
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!course.enrolled && !isOwner && (
            <Button
              onClick={handleEnrollWithPoints}
              isLoading={actionLoading}
              className="bg-[#00A86B] text-white hover:bg-[#008f5a]"
            >
              Enroll With Points
            </Button>
          )}

          {course.enrolled && !isOwner && (
            <Button
              onClick={handleWithdraw}
              isLoading={actionLoading}
              className="bg-[#E74C3C] text-white hover:bg-[#cf3f31]"
            >
              Withdraw
            </Button>
          )}

          {/* ✅ Skill Swap button only if published + enabled + not owner */}
          {course.isPublished &&
          course.skillSwapEnabled &&
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

              {/* Swap selection modal */}
              {showSwapModal && (
                <div
                  className="modal-overlay"
                  onClick={() => setShowSwapModal(false)}
                >
                  <div
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 className="mb-3 text-lg font-semibold">
                      Select a course to offer
                    </h3>

                    <div className="max-h-60 space-y-2 overflow-auto pr-1">
                      {myCreatedCourses.map(c => (
                        <label
                          key={c._id}
                          className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="myCourse"
                            checked={selectedMyCourseId === c._id}
                            onChange={() => setSelectedMyCourseId(c._id)}
                          />
                          <span className="text-sm">{c.title}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        onClick={() => setShowSwapModal(false)}
                        className="bg-gray-200 text-black hover:bg-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequestSwap}
                        isLoading={swapLoading}
                        className="bg-[#0066CC] text-white hover:bg-[#005bb5]"
                      >
                        Send Request
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Report */}
          {user && !isOwner && (
            <>
              <ReportButton onReport={() => setShowReportModal(true)} />
              {showReportModal && (
                <ReportModal
                  isOpen={showReportModal}
                  onClose={() => setShowReportModal(false)}
                  reportType="course"
                  reportedEntity={course._id}
                  reportedUser={course.instructor?._id}
                />
              )}
            </>
          )}
        </div>
      </Card>

      <Card className="space-y-2 p-6">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="opacity-90">{course.description || 'No description'}</p>
      </Card>

      {course.enrolled && !isOwner && (
        <Card className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Review</h2>

            {!showReviewForm && (
              <>
                {userReview ? (
                  <Button
                    onClick={openEditReviewForm}
                    className="bg-gray-200 text-black hover:bg-gray-300"
                  >
                    Edit Review
                  </Button>
                ) : (
                  <Button
                    onClick={openReviewForm}
                    className="bg-[#0066CC] text-white hover:bg-[#005bb5]"
                  >
                    Write Review
                  </Button>
                )}
              </>
            )}
          </div>

          {showReviewForm && (
            <ReviewForm
              onSubmit={submitReview}
              onCancel={closeReviewForm}
              isLoading={reviewLoading}
              initialRating={userReview?.rating || 0}
              initialComment={userReview?.comment || ''}
              isEditing={isEditingReview}
            />
          )}

          {!showReviewForm && userReview && (
            <div className="rounded border p-3">
              <div className="mb-1 flex items-center gap-2">
                <StarRating rating={userReview.rating} />
                <span className="text-xs opacity-70">
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{userReview.comment}</p>
            </div>
          )}
        </Card>
      )}

      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <ReviewList reviews={course.reviews || []} />
      </Card>

      <ConfirmationModal
        show={showPointsConfirm}
        onClose={() => setShowPointsConfirm(false)}
        onConfirm={confirmEnrollWithPoints}
        title="Confirm Enrollment"
        message="Do you want to enroll using wallet points?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default CourseDetailPage;
