import { InputEmail } from './InputEmail';
import { InputName } from './InputName';
import { InputPassword } from './InputPassword';
import { SubmitButton } from './SubmitButton';
import { DemographicsFields } from './DemographicsFields';

export const RegisterForm = ({
  formData,
  errors,
  isLoading,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputEmail
        value={formData.email}
        onChange={e => onChange('email', e.target.value)}
        error={errors.email}
      />

      <InputName
        value={formData.name}
        onChange={e => onChange('name', e.target.value)}
        error={errors.name}
      />

      <InputPassword
        value={formData.password}
        onChange={e => onChange('password', e.target.value)}
        error={errors.password}
      />

      <DemographicsFields formData={formData} onChange={onChange} />

      <SubmitButton isLoading={isLoading} />
    </form>
  );
};
