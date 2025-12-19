import { Button } from '../../../components/Button';

export const SubmitButton = ({ isLoading }) => {
  return (
    <Button
      type="submit"
      isLoading={isLoading}
      variant="primary"
      className="w-full"
    >
      Login
    </Button>
  );
};
