import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import CourseMessaging from '../../components/CourseMessaging';
import { fetchCourseById, fetchCourseEnrollments } from '../../api/courses';
import { initializeSocket } from '../../services/socketService.js';
import { useSession } from '../../contexts/SessionContext';
import { getAccessToken } from '../../api/client';

const StudentEnrolledPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useSession();
  

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
                console.log('📋 Enrollments Response:', enrollmentsRes);
                console.log(
                    '📋 First enrollment structure:',
                    enrollmentsRes.enrollments?.[0]
                );
                setEnrolledUsers(enrollmentsRes.enrollments || []);
            } catch (err) {
                console.error('❌ Full error:', err);
                console.error('❌ Error response:', err.response?.data);
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

  // Initialize Socket.io separately
  useEffect(() => {
    if (!user?._id || !user?.name) {
      console.log('⏳ Waiting for user data...');
      return;
    }
    
    console.log('⚡ Socket init effect running with user:', { _id: user._id, name: user.name });
    
    // Try to get token from apiClient (may not be available - cookies will be sent instead)
    const token = getAccessToken();
    console.log('🔑 Token from apiClient:', token ? 'YES ✅' : 'NO ❌');
    
    // Initialize socket with or without token (cookies will be sent via withCredentials)
    initializeSocket(token, user._id, user.name);
  }, [user]);

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
                        className="mb-4 text-sm font-medium text-[#FF6A00] hover:underline"
                    >
                        ← Back
                    </button>
                    <Card className="border border-red-200 bg-red-50">
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
                        className="mb-4 text-sm font-medium text-[#FF6A00] hover:underline"
                    >
                        ← Back to Course
                    </button>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">
                        Students Enrolled in {course?.title}
                    </h1>
                    <p className="mt-2 text-sm text-[#4A4A4A]">
                        Total: {enrolledUsers.length} student
                        {enrolledUsers.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Students List */}
                <Card>
                    {enrolledUsers.length === 0 ? (
                        <p className="py-8 text-center text-[#4A4A4A]">
                            No students enrolled yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {enrolledUsers.map((enrollment, index) => {
                                console.log(`Student ${index}:`, enrollment);
                                return (
                                    <div
                                        key={enrollment._id}
                                        className="rounded-lg border border-[#E5E5E5] p-3 transition hover:bg-[#F9F9F9]"
                                    >
                                        <p className="font-medium text-[#1A1A1A]">
                                            {index + 1}.{' '}
                                            {enrollment.user?.name || 'No name'}
                                        </p>
                                        <p className="text-sm text-[#4A4A4A]">
                                            {enrollment.user?.email ||
                                                'No email'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

        {/* Messaging Feature */}
        {user && (
          <CourseMessaging courseId={courseId} currentUserId={user._id} currentUserName={user.name} />
        )}

                {/* Course Info */}
                <Card>
                    <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
                        Course Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-xs text-[#4A4A4A]">Category</p>
                            <p className="font-medium text-[#1A1A1A]">
                                {course?.category}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[#4A4A4A]">Level</p>
                            <p className="font-medium text-[#1A1A1A]">
                                {course?.level}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[#4A4A4A]">Points</p>
                            <p className="font-medium text-[#FF6A00]">
                                {course?.pricePoints}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[#4A4A4A]">
                                Total Enrolled
                            </p>
                            <p className="font-medium text-[#1A1A1A]">
                                {course?.enrollCount}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudentEnrolledPage;
