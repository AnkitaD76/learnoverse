import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
//lllll

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const endpoint = userId
          ? `/api/v1/profiles/${userId}`
          : `/api/v1/profiles/me`;

        const response = await fetch(endpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const isOwnProfile = !userId || (currentUser && currentUser.id === userId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-6">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.userId?.firstName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {profile.userId?.firstName?.[0]}
                    {profile.userId?.lastName?.[0]}
                  </span>
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.userId?.firstName} {profile.userId?.lastName}
                </h1>
                <p className="text-gray-600">
                  {profile.userId?.role}
                </p>
              </div>

              {isOwnProfile && (
                <Button
                  onClick={() => navigate('/profile/edit')}
                  className="mt-4 sm:mt-0"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              {/* Bio */}
              {profile.bio && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio</h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}

              {/* Location */}
              {profile.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📍 Location</h3>
                  <p className="text-gray-600">{profile.location}</p>
                </div>
              )}

              {/* Phone */}
              {profile.phone && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📞 Phone</h3>
                  <p className="text-gray-600">{profile.phone}</p>
                </div>
              )}

              {/* Occupation */}
              {profile.occupation && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">💼 Occupation</h3>
                  <p className="text-gray-600">{profile.occupation}</p>
                </div>
              )}

              {/* Website */}
              {profile.website && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">🌐 Website</h3>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}

              {/* Social Links */}
              {profile.socialLinks && Object.keys(profile.socialLinks).some(key => profile.socialLinks[key]) && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Social Links</h3>
                  <div className="flex gap-4">
                    {profile.socialLinks.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600"
                      >
                        Twitter
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900"
                      >
                        LinkedIn
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-gray-900"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t text-xs text-gray-500 text-center">
              <p>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button onClick={() => navigate(-1)} variant="secondary">
            ← Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
