export const parseAuthError = (error: any): string => {
  const msg = error?.message?.toString().toLowerCase();
  const code = error?.code;

  // NETWORK ERRORS
  if (
    msg?.includes("network") ||
    msg?.includes("failed to fetch") ||
    msg?.includes("timed out") ||
    code === "ECONNABORTED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT"
  ) {
    return "No internet connection. Please check your network and try again.";
  }

  // WRONG PASSWORD / CREDENTIALS
  if (
    msg?.includes("invalid credentials") ||
    msg?.includes("wrong password") ||
    msg?.includes("user_invalid_credentials")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  // USER NOT FOUND
  if (msg?.includes("user not found")) {
    return "We couldn’t find an account with this email.";
  }

  // EMAIL NOT VERIFIED
  if (msg?.includes("email not verified")) {
    return "Please verify your email to continue.";
  }

  // SESSION ISSUES
  if (
    msg?.includes("invalid session") ||
    msg?.includes("session not found")
  ) {
    return "Session expired. Please log in again.";
  }

  // TOO MANY ATTEMPTS
  if (
    msg?.includes("too many") ||
    msg?.includes("rate") ||
    msg?.includes("limit")
  ) {
    return "Too many attempts. Please wait a moment.";
  }

  // FALLBACK
  return "Something went wrong. Please try again.";
};
