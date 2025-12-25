import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getMyCertificates } from '../../api/certificates';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const data = await getMyCertificates();
        setCertificates(data.certificates || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load certificates'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              🏆 My Achievements
            </h1>
            <p className="mt-2 text-sm text-[#4A4A4A]">
              View all your earned certificates
            </p>
          </div>
          <Link to="/my-courses">
            <Button className="bg-[#FF6A00] text-white hover:bg-[#E85D00]">
              My Courses
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <Card>
            <div className="text-center text-red-600">
              <p className="font-semibold">Error</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Certificates Grid */}
        {!error && certificates.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">🎓</div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">
                No Certificates Yet
              </h2>
              <p className="mt-2 text-sm text-[#4A4A4A]">
                Complete courses to earn your first certificate!
              </p>
              <div className="mt-6">
                <Link to="/courses">
                  <Button className="bg-[#FF6A00] text-white hover:bg-[#E85D00]">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {!error && certificates.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#FF6A00]">
                    {certificates.length}
                  </p>
                  <p className="mt-1 text-sm text-[#4A4A4A]">
                    Certificates Earned
                  </p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#3c7f91]">
                    {certificates.length}
                  </p>
                  <p className="mt-1 text-sm text-[#4A4A4A]">
                    Courses Completed
                  </p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="mt-1 text-sm text-[#4A4A4A]">Completion Rate</p>
                </div>
              </Card>
            </div>

            {/* Certificates List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map(cert => (
                <Card key={cert._id} className="overflow-hidden">
                  {/* Certificate Preview */}
                  <div className="relative h-48 border-4 border-[#7fb7c9] bg-gradient-to-br from-[#fffdf9] to-[#f0f9ff] p-4">
                    <div className="absolute top-2 left-2 text-xs font-bold text-[#3c7f91]">
                      Learnoverse
                    </div>
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 text-xl font-bold text-yellow-900">
                        ✓
                      </div>
                      <h3 className="text-sm font-bold text-[#3c7f91]">
                        CERTIFICATE
                      </h3>
                      <p className="text-xs text-[#3c7f91] italic">
                        of Completion
                      </p>
                    </div>
                    <div className="absolute right-2 bottom-2 text-[10px] text-gray-600">
                      {cert.certificateNumber}
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-[#1A1A1A]">
                      {cert.course?.title || 'Course Title'}
                    </h3>
                    <p className="mt-2 text-xs text-[#4A4A4A]">
                      Completed on {formatDate(cert.issuedAt)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#FF6A00]">
                      {cert.certificateNumber}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => navigate(`/certificates/${cert._id}`)}
                        className="flex-1 bg-[#3c7f91] text-white hover:bg-[#2d5f6d]"
                        size="sm"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() =>
                          window.open(
                            `${API_BASE_URL}/api/certificates/${cert._id}/pdf`,
                            '_blank'
                          )
                        }
                        variant="outline"
                        className="flex-1 border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF2E8]"
                        size="sm"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
