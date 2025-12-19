import { PasswordInput } from '../../../components/passwordInput';

export const ConfirmPasswordInput = ({ value, onChange, error }) => {
    return (
        <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your new password"
            value={value}
            onChange={onChange}
            error={error}
            required
        />
    );
};
