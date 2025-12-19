import { PasswordInput } from '../../../components/passwordInput';

export const InputPassword = ({
  value,
  onChange,
  error,
  label = 'Password',
}) => {
  return (
    <PasswordInput
      label={label}
      placeholder="Enter your password"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
