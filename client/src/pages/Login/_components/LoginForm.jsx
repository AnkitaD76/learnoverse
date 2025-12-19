import { InputEmail } from './InputEmail';
import { InputPassword } from './InputPassword';
import { ForgotPasswordLink } from './ForgotPasswordLink';
import { SubmitButton } from './SubmitButton';

export const LoginForm = ({
    email,
    password,
    errors,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <InputEmail
                value={email}
                onChange={onEmailChange}
                error={errors.email}
            />

            <InputPassword
                value={password}
                onChange={onPasswordChange}
                error={errors.password}
            />

            <ForgotPasswordLink />

            <SubmitButton isLoading={isLoading} />
        </form>
    );
};
