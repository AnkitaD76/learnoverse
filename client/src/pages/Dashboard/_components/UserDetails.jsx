export const UserDetails = ({ user }) => {
  const formatDate = dateString => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Profile Information
      </h3>

      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        {/* Basic Information */}
        <div>
          <span className="text-gray-600">Email:</span>
          <span className="ml-2 font-medium">{user.email}</span>
        </div>

        <div>
          <span className="text-gray-600">Role:</span>
          <span className="ml-2 font-medium capitalize">{user.role}</span>
        </div>

        {user.phone && (
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 font-medium">{user.phone}</span>
          </div>
        )}

        {user.gender && (
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium capitalize">{user.gender}</span>
          </div>
        )}

        {user.dateOfBirth && (
          <>
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <span className="ml-2 font-medium">
                {formatDate(user.dateOfBirth)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-medium">
                {calculateAge(user.dateOfBirth)} years
              </span>
            </div>
          </>
        )}

        {/* Location */}
        {(user.city || user.country) && (
          <div>
            <span className="text-gray-600">Location:</span>
            <span className="ml-2 font-medium">
              {[user.city, user.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Education */}
        {user.educationLevel && (
          <div>
            <span className="text-gray-600">Education Level:</span>
            <span className="ml-2 font-medium capitalize">
              {user.educationLevel}
            </span>
          </div>
        )}

        {user.institution && (
          <div>
            <span className="text-gray-600">Institution:</span>
            <span className="ml-2 font-medium">{user.institution}</span>
          </div>
        )}

        {user.fieldOfStudy && (
          <div>
            <span className="text-gray-600">Field of Study:</span>
            <span className="ml-2 font-medium">{user.fieldOfStudy}</span>
          </div>
        )}

        {/* Account Status */}
        <div>
          <span className="text-gray-600">Status:</span>
          <span className="ml-2 font-medium">
            <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </span>
        </div>

        <div>
          <span className="text-gray-600">Verified:</span>
          <span className="ml-2 font-medium">
            <span
              className={user.isVerified ? 'text-green-600' : 'text-amber-600'}
            >
              {user.isVerified ? 'Yes' : 'No'}
            </span>
          </span>
        </div>

        {user.lastLogin && (
          <div>
            <span className="text-gray-600">Last Login:</span>
            <span className="ml-2 font-medium">
              {formatDate(user.lastLogin)}
            </span>
          </div>
        )}

        <div>
          <span className="text-gray-600">Member Since:</span>
          <span className="ml-2 font-medium">{formatDate(user.createdAt)}</span>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="pt-2">
          <span className="text-gray-600">Bio:</span>
          <p className="mt-1 text-sm text-gray-800">{user.bio}</p>
        </div>
      )}

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <div className="pt-2">
          <span className="text-gray-600">Interests:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Course Information */}
      {user.enrolledCourses && user.enrolledCourses.length > 0 && (
        <div className="pt-2">
          <span className="text-gray-600">Enrolled Courses:</span>
          <span className="ml-2 font-medium">
            {user.enrolledCourses.length}
          </span>
        </div>
      )}

      {user.completedCourses && user.completedCourses.length > 0 && (
        <div>
          <span className="text-gray-600">Completed Courses:</span>
          <span className="ml-2 font-medium">
            {user.completedCourses.length}
          </span>
        </div>
      )}
    </div>
  );
};
