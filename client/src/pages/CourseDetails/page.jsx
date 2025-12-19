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
        <div className="space-y-4">
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
                                Your balance:{' '}
                                {wallet.available_balance.toLocaleString()}{' '}
                                points
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleEnroll}
                            isLoading={actionLoading}
                            className="bg-gray-600 text-white hover:bg-gray-700"
                        >
                            Enroll (Free)
                        </Button>

                        <Button
                            onClick={() => setShowPointsConfirm(true)}
                            isLoading={actionLoading}
                            disabled={!canAffordCourse}
                            className="bg-[#FF6A00] text-white hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
                            title={
                                !canAffordCourse
                                    ? 'Insufficient points balance'
                                    : ''
                            }
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
    );
};

export default CourseDetailPage;
