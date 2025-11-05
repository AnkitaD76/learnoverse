import { Input } from '../../../components/Input';

export const InputPassword = ({ value, onChange, error }) => {
  return (
    <Input
      type="password"
      label="Password"
      placeholder="Enter your password"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
