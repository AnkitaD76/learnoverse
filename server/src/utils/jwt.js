import jwt from "jsonwebtoken";

export const createJWT = ({ payload, expiresIn = "15m" }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};

export const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};


export const createAccessToken = (user) => {
  return createJWT({
    payload: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    expiresIn: process.env.JWT_ACCESS_LIFETIME || "15m",
  });
};


export const createRefreshToken = (user) => {
  return createJWT({
    payload: {
      userId: user._id,
    },
    expiresIn: process.env.JWT_REFRESH_LIFETIME || "7d",
  });
};


export const attachCookiesToResponse = ({ res, accessToken, refreshToken }) => {
  const accessTokenMaxAge = 1000 * 60 * 15; // 15 minutes
  const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: accessTokenMaxAge,
    sameSite: "strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: refreshTokenMaxAge,
    sameSite: "strict",
  });
};


export const clearAuthCookies = (res) => {
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
};
