import { Input } from '../../../components/Input';

export const TokenInput = ({ value, onChange, error }) => {
  return (
    <Input
      type="text"
      label="Verification Token"
      placeholder="Enter the token from your email"
      value={value}
      onChange={onChange}
      error={error}
      required
    />
  );
};
