import { Input } from '../../../components/Input';

export const EmailInput = ({ value, onChange, error }) => {
    return (
        <Input
            type="email"
            label="Email"
            placeholder="Enter your email address"
            value={value}
            onChange={onChange}
            error={error}
            required
        />
    );
};
