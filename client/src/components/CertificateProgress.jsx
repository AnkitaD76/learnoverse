import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCertificate } from '../../api/certificates';
import { markLessonComplete } from '../../api/courses';
import { Card } from '../Card';
import { Button } from '../Button';

export const CertificateProgress = ({ courseId, enrollment, totalLessons }) => {
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await getMyCertificate(courseId);
        setCertificate(res.certificate);
      } catch (err) {
        console.error('Failed to fetch certificate:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCertificate();
    }
  }, [courseId]);

  if (loading) {
    return null;
  }

  const completedLessons = enrollment?.completedLessonIds?.length || 0;
  const progress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isComplete = totalLessons > 0 && completedLessons >= totalLessons;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            Course Progress
          </h2>
          <span className="text-sm font-medium text-[#FF6A00]">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-[#FF6A00] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-[#4A4A4A]">
          {completedLessons} of {totalLessons} lessons completed
        </p>

        {/* Certificate Display */}
        {certificate && (
          <div className="mt-4 rounded-lg border-2 border-[#7fb7c9] bg-gradient-to-br from-[#fffdf9] to-[#f0f9ff] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 text-xl font-bold text-yellow-900">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#3c7f91]">
                  Certificate Earned!
                </h3>
                <p className="text-xs text-gray-600">
                  Certificate ID: {certificate.certificateNumber}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/certificates/${certificate.id}`)}
                className="bg-[#3c7f91] text-white hover:bg-[#2d5f6d]"
              >
                View Certificate
              </Button>
            </div>
          </div>
        )}

        {/* Course Complete Message without Certificate */}
        {isComplete && !certificate && (
          <div className="mt-4 rounded-lg bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              🎉 Congratulations! You've completed this course.
            </p>
            <p className="mt-1 text-xs text-green-600">
              Your certificate is being processed...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export const LessonCompletionButton = ({
  courseId,
  lessonId,
  isCompleted,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      const res = await markLessonComplete(courseId, lessonId);
      if (onComplete) {
        onComplete(res);
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      alert(err.response?.data?.message || 'Failed to mark lesson as complete');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
        <span className="text-lg">✓</span> Completed
      </div>
    );
  }

  return (
    <Button
      onClick={handleMarkComplete}
      isLoading={loading}
      className="bg-[#FF6A00] text-white hover:bg-[#E85D00]"
    >
      Mark as Complete
    </Button>
  );
};
