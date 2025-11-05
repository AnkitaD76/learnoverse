import { Link } from 'react-router-dom';

export const ForgotPasswordLink = () => {
  return (
    <div className="text-right">
      <Link
        to="/forgot-password"
        className="text-sm text-blue-600 hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  );
};
