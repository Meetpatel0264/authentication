import { useState } from "react";
import { Link } from "react-router-dom";
import OtpInput from "./OtpInput";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("password");
  const [otpStep, setOtpStep] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [remainingResends, setRemainingResends] = useState(3);
  const [resendBlocked, setResendBlocked] = useState(false);

  const getError = (err, fallback) => err.response?.data?.message || fallback;
  const validEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const passwordLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!validEmail()) {
      return setError("Please enter a valid email.");
    }

    if (!password) {
      return setError("Please enter your password.");
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/auth/login/password",
        {
          email: email.trim(),
          password,
        }
      );

      if (data.success) {
        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        getError(err, "Login failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError(""); setMessage("");
    if (!validEmail()) return setError("Please enter a valid registered email.");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login/send-otp", { email });
      setRemainingResends(data.remainingResends ?? 3);
      setResendBlocked(Boolean(data.resendBlocked));
      setOtp("");
      setOtpKey((k) => k + 1);
      setOtpStep(true);
      setMessage(data.message);
    } catch (err) {
      const data = err.response?.data;
      if (data?.resendBlocked) { setResendBlocked(true); setRemainingResends(0); }
      setError(getError(err, "Could not send OTP."));
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      return setError(
        "Please enter complete 6 digit OTP."
      );
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/auth/login/verify-otp",
        {
          email: email.trim(),
          otp,
        }
      );

      if (data.success) {
        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        getError(err, "OTP login failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  const switchType = (type) => {
    setLoginType(type);
    setOtpStep(false);
    setOtp("");
    setOtpKey((k) => k + 1);
    setError(""); setMessage("");
    setRemainingResends(3);
    setResendBlocked(false);
  };

  return (
    <div className="login-card">
      <div className="text-center mb-4">
        <div className="login-logo mx-auto"><i className="bi bi-person-circle" /></div>
        <h2 className="fw-bold mt-3 mb-2">Welcome Back</h2>
        <p className="text-secondary mb-0">Login with password or email OTP.</p>
      </div>

      <div className="login-tabs mb-4">
        <button type="button" className={`login-tab ${loginType === "password" ? "active" : ""}`} onClick={() => switchType("password")}><i className="bi bi-lock me-2" />Password</button>
        <button type="button" className={`login-tab ${loginType === "otp" ? "active" : ""}`} onClick={() => switchType("otp")}><i className="bi bi-shield-check me-2" />Email OTP</button>
      </div>

      {error && <div className="alert alert-danger login-alert"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
      {message && <div className="alert alert-success login-alert">{message}</div>}

      {loginType === "password" && (
        <form onSubmit={passwordLogin}>
          <div className="mb-3"><label className="form-label">Email Address</label><div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-envelope" /></span><input type="email" className="form-control" placeholder="example@gmail.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} /></div></div>
          <div className="mb-4"><label className="form-label">Password</label><div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-lock" /></span><input type={showPassword ? "text" : "password"} className="form-control" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} /><button type="button" className="btn eye-btn" onClick={() => setShowPassword(!showPassword)}><i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} /></button></div></div>
          <button className="btn login-main-btn w-100" disabled={loading}>{loading ? "Logging in..." : "Login with Password"}</button>
        </form>
      )}

      {loginType === "otp" && !otpStep && (
        <form onSubmit={sendOtp}>
          <div className="otp-info-box mb-4"><i className="bi bi-envelope-check" /><div><strong>Login with OTP</strong><small>6 digit OTP is valid for 10 minutes.</small></div></div>
          <div className="mb-4"><label className="form-label">Email Address</label><div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-envelope" /></span><input type="email" className="form-control" placeholder="example@gmail.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} /></div></div>
          <button className="btn login-main-btn w-100" disabled={loading}>{loading ? "Sending OTP..." : "Send OTP"}</button>
        </form>
      )}

      {loginType === "otp" && otpStep && (
        <form onSubmit={verifyOtp}>
          <div className="text-center mb-4">
            <div className="otp-mail-icon mx-auto"><i className="bi bi-envelope-check-fill" /></div>
            <p className="text-secondary mb-1 mt-3">Verification code sent to</p><strong>{email}</strong>
            <button type="button" className="btn change-email-btn d-block mx-auto" onClick={() => { setOtpStep(false); setOtp(""); setError(""); setMessage(""); }}>Change Email</button>
          </div>
          <label className="form-label text-center d-block mb-3">Enter 6 Digit OTP</label>
          <OtpInput key={otpKey} classNamePrefix="login-otp" onOtpChange={setOtp} />
          <button type="submit" className="btn login-main-btn w-100 mt-4" disabled={loading || otp.length !== 6}>{loading ? "Verifying..." : "Verify & Login"}</button>
          <div className="text-center mt-3">
            <span className="small text-secondary">Resends left: {remainingResends}</span>
            <button type="button" className="btn resend-btn" disabled={loading || resendBlocked || remainingResends <= 0} onClick={sendOtp}>{resendBlocked || remainingResends <= 0 ? "Resend Blocked" : "Resend OTP"}</button>
          </div>
        </form>
      )}

      <div className="login-divider"><span>New here?</span></div>
      <p className="text-center register-text mb-0">Don't have an account? <Link to="/register">Create Account</Link></p>
    </div>
  );
};

export default LoginForm;
