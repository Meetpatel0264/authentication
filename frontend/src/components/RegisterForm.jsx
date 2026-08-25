import { useState } from "react";
import { Link } from "react-router-dom";
import OtpInput from "./OtpInput";
import api from "../services/api";

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [otpKey, setOtpKey] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [remainingResends, setRemainingResends] = useState(3);
  const [resendBlocked, setResendBlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getError = (err, fallback) => err.response?.data?.message || fallback;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setMessage("");

    if (!formData.name.trim()) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError("Please enter a valid email address.");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register/send-otp", {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      setRemainingResends(data.remainingResends ?? 3);
      setResendBlocked(Boolean(data.resendBlocked));
      setMessage(data.message);
      setOtpKey((k) => k + 1);
      setFormData((prev) => ({ ...prev, otp: "" }));
      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      if (data?.resendBlocked) {
        setResendBlocked(true);
        setRemainingResends(0);
      }
      setError(getError(err, "Could not send OTP."));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (formData.otp.length !== 6) return setError("Please enter complete 6 digit OTP.");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      setMessage(data.message);
      setStep(3);
    } catch (err) {
      setError(getError(err, "OTP verification failed."));
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain one number";
    if (!/[!@#$%^&*]/.test(password)) return "Password must contain one special character";
    return "";
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const passwordError = validatePassword(formData.password);
    if (passwordError) return setError(passwordError);
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register/set-password", {
        email: formData.email,
        password: formData.password,
      });
      setMessage(data.message);
      setStep(4);
    } catch (err) {
      setError(getError(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-card">
      <div className="text-center mb-4">
        <div className="register-logo mx-auto"><i className="bi bi-person-plus-fill"></i></div>
        <h2 className="fw-bold mt-3 mb-2">{step === 4 ? "Registration Complete" : "Create Account"}</h2>
        <p className="text-secondary mb-0">
          {step === 1 && "Enter your name and email to continue."}
          {step === 2 && "Verify the 6 digit OTP sent to your email."}
          {step === 3 && "Create a secure password for your account."}
          {step === 4 && "Your account has been created successfully."}
        </p>
      </div>

      {step !== 4 && (
        <div className="step-container mb-5">
          <div className={`register-step ${step >= 1 ? "active" : ""}`}><span>{step > 1 ? <i className="bi bi-check-lg" /> : "1"}</span><small>Details</small></div>
          <div className={`register-line ${step >= 2 ? "active" : ""}`} />
          <div className={`register-step ${step >= 2 ? "active" : ""}`}><span>{step > 2 ? <i className="bi bi-check-lg" /> : "2"}</span><small>Verify</small></div>
          <div className={`register-line ${step >= 3 ? "active" : ""}`} />
          <div className={`register-step ${step >= 3 ? "active" : ""}`}><span>3</span><small>Password</small></div>
        </div>
      )}

      {error && <div className="alert alert-danger custom-alert"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
      {message && step !== 4 && <div className="alert alert-success custom-alert">{message}</div>}

      {step === 1 && (
        <form onSubmit={sendOtp}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-person" /></span><input name="name" className="form-control" placeholder="Enter your full name" value={formData.name} onChange={handleChange} /></div>
          </div>
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-envelope" /></span><input type="email" name="email" className="form-control" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} /></div>
          </div>
          <button className="btn register-btn w-100" disabled={loading}>{loading ? "Sending OTP..." : "Send OTP"}</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp}>
          <div className="text-center mb-4">
            <div className="mail-icon mx-auto"><i className="bi bi-envelope-check-fill" /></div>
            <p className="mb-1 mt-3 text-secondary">Verification code sent to</p>
            <strong>{formData.email}</strong>
            <button type="button" className="btn change-email-btn d-block mx-auto" onClick={() => { setStep(1); setError(""); setMessage(""); }}>Change Email</button>
          </div>

          <label className="form-label text-center d-block mb-3">Enter 6 Digit OTP</label>
          <OtpInput key={otpKey} onOtpChange={(otp) => setFormData((prev) => ({ ...prev, otp }))} />

          <button type="submit" className="btn register-btn w-100 mt-4" disabled={loading || formData.otp.length !== 6}>{loading ? "Verifying..." : "Verify OTP"}</button>

          <div className="text-center mt-3">
            <span className="small text-secondary">Resends left: {remainingResends}</span>
            <button type="button" className="btn resend-btn" disabled={loading || resendBlocked || remainingResends <= 0} onClick={sendOtp}>
              {resendBlocked || remainingResends <= 0 ? "Resend Blocked" : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={createAccount}>
          <div className="verified-email mb-4"><div className="verified-icon"><i className="bi bi-patch-check-fill" /></div><div><strong>Email Verified</strong><small>{formData.email}</small></div></div>
          <div className="mb-3">
            <label className="form-label">Create Password</label>
            <div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-lock" /></span><input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Example: Dax@1234" value={formData.password} onChange={handleChange} /><button type="button" className="btn eye-btn" onClick={() => setShowPassword(!showPassword)}><i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} /></button></div>
            <small className="password-note">8+ chars, uppercase, lowercase, number and special character.</small>
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <div className="input-group custom-input"><span className="input-group-text"><i className="bi bi-shield-lock" /></span><input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-control" placeholder="Enter password again" value={formData.confirmPassword} onChange={handleChange} /><button type="button" className="btn eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"} /></button></div>
          </div>
          <button className="btn register-btn w-100" disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</button>
        </form>
      )}

      {step === 4 && (
        <div className="success-section text-center">
          <div className="account-success-icon mx-auto"><i className="bi bi-check-lg" /></div>
          <h4 className="fw-bold mt-4">Welcome, {formData.name}!</h4>
          <p className="text-secondary">Account created successfully with <strong className="d-block mt-1">{formData.email}</strong></p>
          <Link to="/login" className="btn register-btn w-100 mt-2">Continue to Login</Link>
        </div>
      )}

      {step !== 4 && <p className="login-text text-center mt-4 mb-0">Already have an account? <Link to="/login">Login</Link></p>}
    </div>
  );
};

export default RegisterForm;
