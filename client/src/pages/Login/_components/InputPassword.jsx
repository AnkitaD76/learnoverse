import { PasswordInput } from '../../../components/passwordInput';

export const InputPassword = ({ value, onChange, error }) => {
    return (
        <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={value}
            onChange={onChange}
            error={error}
            required
        />
    );
};
