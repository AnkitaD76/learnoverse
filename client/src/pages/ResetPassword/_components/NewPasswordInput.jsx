import { Input } from '../../../components/Input';

export const NewPasswordInput = ({ value, onChange, error }) => {
  return (
    <Input
      type="password"
      label="New Password"
      placeholder="Enter your new password"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
