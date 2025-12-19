import { Navigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
