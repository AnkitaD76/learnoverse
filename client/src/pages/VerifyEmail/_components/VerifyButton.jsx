import { Button } from '../../../components/Button';

export const VerifyButton = ({ isLoading }) => {
    return (
        <Button type="submit" isLoading={isLoading} className="w-full">
            Verify Email
        </Button>
    );
};
