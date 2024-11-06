const cookieOptions = {
  httpOnly: true,
  secure: true, // Only send cookies over HTTPS
  sameSite: "None", // Allow cross-origin requests to send cookies
};

export default cookieOptions;
