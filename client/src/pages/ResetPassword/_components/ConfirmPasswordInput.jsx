import { Input } from '../../../components/Input';

export const ConfirmPasswordInput = ({ value, onChange, error }) => {
  return (
    <Input
      type="password"
      label="Confirm Password"
      placeholder="Confirm your new password"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
