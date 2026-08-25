const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const validatePassword = require("../utils/passwordValidator");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");

const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const validatePassword = require("../utils/passwordValidator");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const registerSendOtp = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    const otp = generateOtp();

    const otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    let user;

    if (existingUser) {
      existingUser.name = name;
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpire;

      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        otp,
        otpExpire,
        isVerified: false,
      });
    }

    await sendEmail(
      normalizedEmail,
      "Register OTP",
      `Your OTP is ${otp}. It is valid for 10 minutes.`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log("Register Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const registerVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.otpExpire ||
      user.otpExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("Register Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const registerSetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    const passwordCheck =
      validatePassword(password);

    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Set Password Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is not verified",
      });
    }

    const isPasswordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Password Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is not verified",
      });
    }

    const otp = generateOtp();

    user.otp = otp;

    user.otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await sendEmail(
      user.email,
      "Login OTP",
      `Your login OTP is ${otp}. It is valid for 10 minutes.`
    );

    return res.status(200).json({
      success: true,
      message: "Login OTP sent successfully",
    });
  } catch (error) {
    console.log("Login Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
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

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.otpExpire ||
      user.otpExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.otp = null;
    user.otpExpire = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Login Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerSendOtp,
  registerVerifyOtp,
  registerSetPassword,
  loginWithPassword,
  loginSendOtp,
  loginVerifyOtp,
};