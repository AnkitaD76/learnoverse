import { Input } from '../../../components/Input';

export const InputEmail = ({ value, onChange, error }) => {
  return (
    <Input
      type="email"
      label="Email"
      placeholder="Enter your email"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
