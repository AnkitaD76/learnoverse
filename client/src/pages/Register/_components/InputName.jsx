import { Input } from '../../../components/Input';

export const InputName = ({ value, onChange, error }) => {
    return (
        <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            value={value}
            onChange={onChange}
            error={error}
            required
        />
    );
};
