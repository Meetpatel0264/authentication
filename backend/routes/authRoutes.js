const express = require("express");

const {
  registerSendOtp,
  registerVerifyOtp,
  registerSetPassword,

  loginWithPassword,
  loginSendOtp,
  loginVerifyOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register/send-otp",
  registerSendOtp
);

router.post(
  "/register/verify-otp",
  registerVerifyOtp
);

router.post(
  "/register/set-password",
  registerSetPassword
);

router.post(
  "/login/password",
  loginWithPassword
);

router.post(
  "/login/send-otp",
  loginSendOtp
);

router.post(
  "/login/verify-otp",
  loginVerifyOtp
);

module.exports = router;