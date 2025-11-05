import { useSession } from '../../../contexts/SessionContext';
import { Button } from '../../../components/Button';

export const LogoutButton = () => {
  const { logout } = useSession();

  return (
    <Button variant="danger" onClick={logout}>
      Logout
    </Button>
  );
};
