import crypto from 'crypto';

export const createHash = string => {
    return crypto.createHash('sha256').update(string).digest('hex');
};

export const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationToken = () => {
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return {
        token: createHash(token),
        expires,
        rawToken: token, // Send this to user
    };
};

export const generatePasswordResetToken = () => {
    const token = generateToken();
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    return {
        token: createHash(token),
        expires,
        rawToken: token, // Send this to user
    };
};
