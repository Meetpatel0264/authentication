const validatePassword = (password) => {
  if (!password) {
    return {
      valid: false,
      message: "Password is required",
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain one number",
    };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain one special character",
    };
  }

  return {
    valid: true,
    message: "Password is valid",
  };
};

module.exports = validatePassword;