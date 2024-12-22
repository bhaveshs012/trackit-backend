const accessTokenCookieOptions = {
  httpOnly: true, // Accessible from JavaScript
  secure: true, // Use true in production (HTTPS)
  sameSite: "None", // Allow cross origin requests
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true, // Use true in production (HTTPS)
  sameSite: "None", // Allow cross origin requests
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export { accessTokenCookieOptions, refreshTokenCookieOptions };
