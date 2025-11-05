import { Input } from '../../../components/Input';

export const InputPassword = ({
  value,
  onChange,
  error,
  label = 'Password',
}) => {
  return (
    <Input
      type="password"
      label={label}
      placeholder="Enter your password"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
