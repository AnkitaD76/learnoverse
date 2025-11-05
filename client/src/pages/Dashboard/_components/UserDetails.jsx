export const UserDetails = ({ user }) => {
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Profile Information
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Role:</span>
          <span className="ml-2 font-medium capitalize">{user.role}</span>
        </div>

        {user.age && (
          <div>
            <span className="text-gray-600">Age:</span>
            <span className="ml-2 font-medium">{user.age}</span>
          </div>
        )}

        {user.gender && (
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium capitalize">{user.gender}</span>
          </div>
        )}

        {user.occupation && (
          <div>
            <span className="text-gray-600">Occupation:</span>
            <span className="ml-2 font-medium">{user.occupation}</span>
          </div>
        )}

        {user.location?.city && (
          <div>
            <span className="text-gray-600">Location:</span>
            <span className="ml-2 font-medium">
              {[user.location.city, user.location.state, user.location.country]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}

        <div>
          <span className="text-gray-600">Status:</span>
          <span className="ml-2 font-medium capitalize">{user.status}</span>
        </div>

        <div>
          <span className="text-gray-600">Verified:</span>
          <span className="ml-2 font-medium">
            {user.isVerified ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="col-span-2">
          <span className="text-gray-600">Member since:</span>
          <span className="ml-2 font-medium">{formatDate(user.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
