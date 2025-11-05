import { Button } from '../../../components/Button';

export const SubmitButton = ({ isLoading }) => {
  return (
    <Button type="submit" isLoading={isLoading} className="w-full">
      Register
    </Button>
  );
};
