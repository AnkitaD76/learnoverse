import { PasswordInput } from '../../../components/passwordInput';

export const NewPasswordInput = ({ value, onChange, error }) => {
    return (
        <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            value={value}
            onChange={onChange}
            error={error}
            required
        />
    );
};
