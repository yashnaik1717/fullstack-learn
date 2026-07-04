import dotenv from 'dotenv';
dotenv.config();

export const authConfig = {
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'super-secret-access-token-key-change-in-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-change-in-prod',
    accessExpiry: '15m' as const,     // Access token expiry
    refreshExpiry: '7d' as const,     // Refresh token expiry
  },
  cookie: {
    refreshCookieName: 'refreshToken',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    },
  },
  bcryptSaltRounds: 10,
};
