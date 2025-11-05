import { Button } from '../../../components/Button';

export const ResetButton = ({ isLoading }) => {
  return (
    <Button type="submit" isLoading={isLoading} className="w-full">
      Reset Password
    </Button>
  );
};
