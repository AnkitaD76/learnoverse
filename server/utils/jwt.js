const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken'); // your DB model

const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    // store hashed version for extra safety
    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        isRevoked: false,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return refreshToken;
};

const refreshAccessToken = async (refreshToken) => {
    try {
        // verify signature
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const storedToken = await RefreshToken.findOne({ token: refreshToken, user: decoded.userId });

        if (!storedToken) throw new Error('Refresh token not found');
        if (storedToken.expiresAt < Date.now()) throw new Error('Refresh token expired');

        // issue new access token
        return generateAccessToken({_id: decoded.userId});
    } catch (err) {
        throw new Error('Invalid refresh token');
    }
};


// After verifying refresh token
// await RefreshToken.deleteOne({ token: refreshToken });
// const newRefreshToken = await generateRefreshToken(user);
