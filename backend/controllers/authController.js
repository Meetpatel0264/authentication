const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validatePassword = require("../utils/passwordValidator");
const generateOtp = require("../utils/generateOtp");
const { addEmailToQueue } = require("../queues/emailQueue");

const OTP_EXPIRE_MS = 10 * 60 * 1000;
const MAX_RESENDS = 3;

const normalizeEmail = (email = "") => email.toLowerCase().trim();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const prepareOtp = async (user, purpose) => {
  const now = Date.now();
  const activeSameOtp =
    user.otp &&
    user.otpPurpose === purpose &&
    user.otpExpire &&
    user.otpExpire.getTime() > now;

  if (activeSameOtp) {
    if (user.otpResendCount >= MAX_RESENDS) {
      const error = new Error(
        "OTP resend limit reached. Please wait until the current OTP expires."
      );
      error.statusCode = 429;
      error.resendBlocked = true;
      throw error;
    }
    user.otpResendCount += 1;
  } else {
    user.otpResendCount = 0;
  }

  user.otp = generateOtp();
  user.otpExpire = new Date(now + OTP_EXPIRE_MS);
  user.otpPurpose = purpose;
  await user.save();

  return {
    otp: user.otp,
    resendCount: user.otpResendCount,
    remainingResends: Math.max(0, MAX_RESENDS - user.otpResendCount),
  };
};

const queueOtpEmail = async (user, otp, purpose) => {
  const subject =
    purpose === "register"
      ? "Email Verification OTP"
      : "Login Verification OTP";

  return addEmailToQueue({
    email: user.email,
    subject,
    body: `Your OTP is ${otp}. This OTP is valid for 10 minutes.`,
    purpose,
  });
};

const registerSendOtp = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({ email: normalizedEmail });

    if (user?.isVerified && user.password) {
      return res.status(409).json({
        success: false,
        message: "User already registered",
      });
    }

    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
      });
    } else {
      user.name = name.trim();
      await user.save();
    }

    const otpData = await prepareOtp(user, "register");
    const job = await queueOtpEmail(user, otpData.otp, "register");

    return res.status(200).json({
      success: true,
      message: "OTP queued for delivery",
      emailJobId: job.id,
      otpExpiresIn: 600,
      resendCount: otpData.resendCount,
      remainingResends: otpData.remainingResends,
      resendBlocked: otpData.remainingResends === 0,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Could not queue OTP",
      resendBlocked: Boolean(error.resendBlocked),
      remainingResends: error.resendBlocked ? 0 : undefined,
    });
  }
};

const registerVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.otpPurpose !== "register") {
      return res.status(400).json({
        success: false,
        message: "No register OTP request found",
      });
    }
    if (!user.otpExpire || user.otpExpire.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    if (!otp || user.otp !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    user.otpPurpose = null;
    user.otpResendCount = 0;
    await user.save();

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const registerSetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }
    if (user.password) {
      return res.status(409).json({
        success: false,
        message: "Password already created. Please login.",
      });
    }

    const result = validatePassword(password);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email is not verified",
      });
    }

    const matched = await bcrypt.compare(password || "", user.password);
    if (!matched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const otpData = await prepareOtp(user, "login");
    const job = await queueOtpEmail(user, otpData.otp, "login");

    return res.status(200).json({
      success: true,
      message: "Login OTP queued for delivery",
      emailJobId: job.id,
      otpExpiresIn: 600,
      resendCount: otpData.resendCount,
      remainingResends: otpData.remainingResends,
      resendBlocked: otpData.remainingResends === 0,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Could not queue OTP",
      resendBlocked: Boolean(error.resendBlocked),
      remainingResends: error.resendBlocked ? 0 : undefined,
    });
  }
};

const loginVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.otp || user.otpPurpose !== "login") {
      return res.status(400).json({
        success: false,
        message: "No login OTP request found. Please send OTP first.",
      });
    }
    if (!user.otpExpire || new Date() > user.otpExpire) {
      user.otp = null;
      user.otpExpire = null;
      user.otpPurpose = null;
      user.otpResendCount = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.otp = null;
    user.otpExpire = null;
    user.otpPurpose = null;
    user.otpResendCount = 0;
    await user.save();

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const users = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email createdAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  registerSendOtp,
  registerVerifyOtp,
  registerSetPassword,
  loginWithPassword,
  loginSendOtp,
  loginVerifyOtp,
  users,
  logout,
};
