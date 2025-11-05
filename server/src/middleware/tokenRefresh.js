import {
  verifyAccessToken,
  verifyRefreshToken,
  createAccessToken,
  rotateRefreshToken,
} from '../utils/jwt.js';
import { UnauthenticatedError } from '../errors/index.js';

const tokenRefreshMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthenticatedError('Authentication invalid');
    }

    const accessToken = authHeader.split(' ')[1];

    try {
      const payload = verifyAccessToken(accessToken);
      req.user = payload;
      return next();
    } catch {
      const refreshToken = req.headers['x-refresh-token'];
      if (!refreshToken) {
        throw new UnauthenticatedError('Refresh token missing');
      }

      const decoded = await verifyRefreshToken(refreshToken);

      const user = {
        userId: decoded.userId,
        username: decoded.username,
        roles: decoded.roles,
      };

      const newAccessToken = createAccessToken(user);
      const newRefreshToken = await rotateRefreshToken(refreshToken, user);

      res.set(
        'Access-Control-Expose-Headers',
        'x-new-access-token, x-new-refresh-token'
      );
      res.set('x-new-access-token', newAccessToken);
      res.set('x-new-refresh-token', newRefreshToken);

      req.user = user;
      return next();
    }
  } catch (error) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

export default tokenRefreshMiddleware;
