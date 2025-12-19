import { Button } from '../../../components/Button';

export const SendButton = ({ isLoading }) => {
    return (
        <Button type="submit" isLoading={isLoading} className="w-full">
            Send Reset Link
        </Button>
    );
};
