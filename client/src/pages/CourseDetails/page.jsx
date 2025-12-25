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

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { wallet, hasSufficientBalance, refreshWallet } = useWallet();

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

  const { user } = useSession();

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
      </div>
    </div>
  );
};

export default CourseDetailPage;
