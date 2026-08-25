import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = () => {
    const [loginType, setLoginType] = useState("password");
    const [otpStep, setOtpStep] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef([]);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            return setError("Please enter your email.");
        }

        if (!password) {
            return setError("Please enter your password.");
        }

        try {
            setLoading(true);

            // Real backend API later
            // await axios.post("/api/auth/login", {
            //   email,
            //   password,
            // });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            alert("Password login successful!");
        } catch (error) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (e) => {
        if (e) e.preventDefault();

        setError("");

        if (!email.trim()) {
            return setError("Please enter your email.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return setError("Please enter a valid email.");
        }

        try {
            setLoading(true);

            // Real backend API later
            // await axios.post("/api/auth/login/send-otp", {
            //   email,
            // });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            setOtpStep(true);
        } catch (error) {
            setError("Could not send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        newOtp[index] = value.slice(-1);

        setOtp(newOtp);
        setError("");

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            otpRefs.current[index - 1]?.focus();
        }

        if (e.key === "ArrowLeft" && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }

        if (e.key === "ArrowRight" && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedOtp = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedOtp) return;

        const newOtp = ["", "", "", "", "", ""];

        pastedOtp.split("").forEach((digit, index) => {
            newOtp[index] = digit;
        });

        setOtp(newOtp);

        const focusIndex = Math.min(pastedOtp.length, 5);

        otpRefs.current[focusIndex]?.focus();
    };

    const verifyOtp = async (e) => {
        e.preventDefault();

        setError("");

        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
            return setError("Please enter complete 6 digit OTP.");
        }

        try {
            setLoading(true);

            // Real backend API later
            // await axios.post("/api/auth/login/verify-otp", {
            //   email,
            //   otp: finalOtp,
            // });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            alert("OTP login successful!");
        } catch (error) {
            setError("Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    const switchLoginType = (type) => {
        setLoginType(type);
        setOtpStep(false);
        setOtp(["", "", "", "", "", ""]);
        setError("");
    };

    return (
        <div className="login-card">
            <div className="text-center mb-4">
                <div className="login-logo mx-auto">
                    <i className="bi bi-person-circle"></i>
                </div>

                <h2 className="fw-bold mt-3 mb-2">
                    Welcome Back
                </h2>

                <p className="text-secondary mb-0">
                    Login to continue to your account.
                </p>
            </div>

            {/* Login Method Tabs */}

            <div className="login-tabs mb-4">
                <button
                    type="button"
                    className={`login-tab ${loginType === "password" ? "active" : ""
                        }`}
                    onClick={() => switchLoginType("password")}
                >
                    <i className="bi bi-lock me-2"></i>
                    Password
                </button>

                <button
                    type="button"
                    className={`login-tab ${loginType === "otp" ? "active" : ""
                        }`}
                    onClick={() => switchLoginType("otp")}
                >
                    <i className="bi bi-shield-check me-2"></i>
                    Email OTP
                </button>
            </div>

            {/* Error */}

            {error && (
                <div className="alert alert-danger login-alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}

            {/* PASSWORD LOGIN */}

            {loginType === "password" && (
                <form onSubmit={handlePasswordLogin}>
                    <div className="mb-3">
                        <label className="form-label">
                            Email Address
                        </label>

                        <div className="input-group custom-input">
                            <span className="input-group-text">
                                <i className="bi bi-envelope"></i>
                            </span>

                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">
                            Password
                        </label>

                        <div className="input-group custom-input">
                            <span className="input-group-text">
                                <i className="bi bi-lock"></i>
                            </span>

                            <input
                                type={
                                    showPassword ? "text" : "password"
                                }
                                className="form-control"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                            />

                            <button
                                type="button"
                                className="btn eye-btn"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                <i
                                    className={
                                        showPassword
                                            ? "bi bi-eye-slash"
                                            : "bi bi-eye"
                                    }
                                ></i>
                            </button>
                        </div>
                    </div>

                    <div className="text-end mb-4">
                        <a
                            href="/forgot-password"
                            className="forgot-link"
                        >
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="btn login-main-btn w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login
                                <i className="bi bi-arrow-right ms-2"></i>
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* OTP EMAIL STEP */}

            {loginType === "otp" && !otpStep && (
                <form onSubmit={sendOtp}>
                    <div className="otp-info-box mb-4">
                        <i className="bi bi-envelope-check"></i>

                        <div>
                            <strong>Login with OTP</strong>

                            <small>
                                We'll send a 6-digit code to your registered email.
                            </small>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            Email Address
                        </label>

                        <div className="input-group custom-input">
                            <span className="input-group-text">
                                <i className="bi bi-envelope"></i>
                            </span>

                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn login-main-btn w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Sending OTP...
                            </>
                        ) : (
                            <>
                                Send OTP
                                <i className="bi bi-send ms-2"></i>
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* OTP VERIFY STEP */}

            {loginType === "otp" && otpStep && (
                <form onSubmit={verifyOtp}>
                    <div className="text-center mb-4">
                        <div className="otp-mail-icon mx-auto">
                            <i className="bi bi-envelope-check-fill"></i>
                        </div>

                        <p className="text-secondary mb-1 mt-3">
                            Verification code sent to
                        </p>

                        <strong>{email}</strong>

                        <button
                            type="button"
                            className="btn change-email-btn d-block mx-auto"
                            onClick={() => {
                                setOtpStep(false);
                                setOtp(["", "", "", "", "", ""]);
                                setError("");
                            }}
                        >
                            Change Email
                        </button>
                    </div>

                    <label className="form-label text-center d-block mb-3">
                        Enter 6 Digit OTP
                    </label>

                    <div className="login-otp-wrapper mb-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    otpRefs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                className={`login-otp-box ${digit ? "filled" : ""
                                    }`}
                                value={digit}
                                onChange={(e) =>
                                    handleOtpChange(
                                        e.target.value,
                                        index
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleOtpKeyDown(e, index)
                                }
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn login-main-btn w-100"
                        disabled={
                            loading || otp.join("").length !== 6
                        }
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & Login
                                <i className="bi bi-shield-check ms-2"></i>
                            </>
                        )}
                    </button>

                    <div className="text-center mt-3">
                        <span className="small text-secondary">
                            Didn't receive OTP?
                        </span>

                        <button
                            type="button"
                            className="btn resend-btn"
                            onClick={sendOtp}
                            disabled={loading}
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>
            )}

            <div className="login-divider">
                <span>New here?</span>
            </div>

            <p className="text-center register-text mb-0">
                Don't have an account?{" "}
                <Link to="/register">
                    Create Account
                </Link>
            </p>
        </div>
    );
};

export default LoginForm;