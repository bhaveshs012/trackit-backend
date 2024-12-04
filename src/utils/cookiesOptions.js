const accessTokenCookieOptions = {
  httpOnly: true, // Accessible from JavaScript
  secure: true, // Use true in production (HTTPS)
  sameSite: "strict",
  maxAge: 1 * 60 * 60 * 1000, // 1 hour
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true, // Use true in production (HTTPS)
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export { accessTokenCookieOptions, refreshTokenCookieOptions };
