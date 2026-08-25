import { useState } from "react";
import { Link } from "react-router-dom";
import OtpInput from "./OtpInput";

const RegisterForm = () => {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    // ===============================
    // STEP 1 - SEND OTP
    // ===============================

    const sendOtp = async (e) => {
        if (e) {
            e.preventDefault();
        }

        setError("");

        if (!formData.name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            // Later real backend API:
            //
            // await axios.post(
            //   "http://localhost:5000/api/auth/send-otp",
            //   {
            //     name: formData.name,
            //     email: formData.email,
            //   }
            // );

            await new Promise((resolve) =>
                setTimeout(resolve, 1000)
            );

            console.log("OTP sent to:", formData.email);

            setStep(2);
        } catch (error) {
            setError("Could not send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // STEP 2 - VERIFY OTP
    // ===============================

    const verifyOtp = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.otp) {
            setError("Please enter the OTP.");
            return;
        }

        if (formData.otp.length !== 6) {
            setError("Please enter complete 6 digit OTP.");
            return;
        }

        try {
            setLoading(true);

            // Later real backend API:
            //
            // await axios.post(
            //   "http://localhost:5000/api/auth/verify-otp",
            //   {
            //     email: formData.email,
            //     otp: formData.otp,
            //   }
            // );

            await new Promise((resolve) =>
                setTimeout(resolve, 1000)
            );

            console.log("OTP verified:", formData.otp);

            setStep(3);
        } catch (error) {
            setError("OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // STEP 3 - CREATE PASSWORD
    // ===============================

    const createAccount = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.password) {
            setError("Please enter a password.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (!formData.confirmPassword) {
            setError("Please confirm your password.");
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // Later real backend:
            //
            // await axios.post(
            //   "http://localhost:5000/api/auth/register",
            //   {
            //     name: formData.name,
            //     email: formData.email,
            //     password: formData.password,
            //   }
            // );

            await new Promise((resolve) =>
                setTimeout(resolve, 1000)
            );

            console.log("Registered Data:", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            setStep(4);
        } catch (error) {
            setError("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-card">

            {/* LOGO */}

            <div className="text-center mb-4">
                <div className="register-logo mx-auto">
                    <i className="bi bi-person-plus-fill"></i>
                </div>

                <h2 className="fw-bold mt-3 mb-2">
                    {step === 4
                        ? "Registration Complete"
                        : "Create Account"}
                </h2>

                <p className="text-secondary mb-0">
                    {step === 1 &&
                        "Enter your name and email to continue."}

                    {step === 2 &&
                        "Enter the verification code sent to your email."}

                    {step === 3 &&
                        "Create a secure password for your account."}

                    {step === 4 &&
                        "Your account has been created successfully."}
                </p>
            </div>

            {/* STEP PROGRESS */}

            {step !== 4 && (
                <div className="step-container mb-5">

                    <div
                        className={`register-step ${step >= 1 ? "active" : ""
                            }`}
                    >
                        <span>
                            {step > 1 ? (
                                <i className="bi bi-check-lg"></i>
                            ) : (
                                "1"
                            )}
                        </span>

                        <small>Details</small>
                    </div>

                    <div
                        className={`register-line ${step >= 2 ? "active" : ""
                            }`}
                    ></div>

                    <div
                        className={`register-step ${step >= 2 ? "active" : ""
                            }`}
                    >
                        <span>
                            {step > 2 ? (
                                <i className="bi bi-check-lg"></i>
                            ) : (
                                "2"
                            )}
                        </span>

                        <small>Verify</small>
                    </div>

                    <div
                        className={`register-line ${step >= 3 ? "active" : ""
                            }`}
                    ></div>

                    <div
                        className={`register-step ${step >= 3 ? "active" : ""
                            }`}
                    >
                        <span>3</span>

                        <small>Password</small>
                    </div>

                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="alert alert-danger custom-alert">
                    <i className="bi bi-exclamation-circle me-2"></i>

                    {error}
                </div>
            )}

            {/* =================================
          STEP 1
      ================================= */}

            {step === 1 && (
                <form onSubmit={sendOtp}>

                    <div className="mb-3">

                        <label className="form-label">
                            Full Name
                        </label>

                        <div className="input-group custom-input">

                            <span className="input-group-text">
                                <i className="bi bi-person"></i>
                            </span>

                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />

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
                                name="email"
                                className="form-control"
                                placeholder="example@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="btn register-btn w-100"
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
                                <i className="bi bi-arrow-right ms-2"></i>
                            </>
                        )}

                    </button>

                </form>
            )}

            {/* =================================
          STEP 2
      ================================= */}

            {step === 2 && (
                <form onSubmit={verifyOtp}>

                    <div className="otp-header text-center">

                        <div className="mail-icon mx-auto">
                            <i className="bi bi-envelope-check-fill"></i>
                        </div>

                        <p className="mb-1 mt-3 text-secondary">
                            Verification code sent to
                        </p>

                        <strong>
                            {formData.email}
                        </strong>

                        <button
                            type="button"
                            className="btn change-email-btn d-block mx-auto"
                            onClick={() => {
                                setStep(1);
                                setFormData((prev) => ({
                                    ...prev,
                                    otp: "",
                                }));
                                setError("");
                            }}
                        >
                            Change Email
                        </button>

                    </div>

                    <div className="my-4">

                        <label className="form-label text-center d-block mb-3">
                            Enter 6 Digit OTP
                        </label>

                        <OtpInput
                            onOtpChange={(otpValue) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    otp: otpValue,
                                }));

                                setError("");
                            }}
                        />

                    </div>

                    <button
                        type="submit"
                        className="btn register-btn w-100"
                        disabled={
                            loading ||
                            formData.otp.length !== 6
                        }
                    >

                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify OTP
                                <i className="bi bi-shield-check ms-2"></i>
                            </>
                        )}

                    </button>

                    <div className="text-center mt-3">

                        <span className="text-secondary small">
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

            {/* =================================
          STEP 3
      ================================= */}

            {step === 3 && (
                <form onSubmit={createAccount}>

                    <div className="verified-email mb-4">

                        <div className="verified-icon">
                            <i className="bi bi-patch-check-fill"></i>
                        </div>

                        <div>
                            <strong>
                                Email Verified
                            </strong>

                            <small>
                                {formData.email}
                            </small>
                        </div>

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Create Password
                        </label>

                        <div className="input-group custom-input">

                            <span className="input-group-text">
                                <i className="bi bi-lock"></i>
                            </span>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <button
                                type="button"
                                className="btn eye-btn"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
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

                        <small className="password-note">
                            Minimum 6 characters
                        </small>

                    </div>

                    <div className="mb-4">

                        <label className="form-label">
                            Confirm Password
                        </label>

                        <div className="input-group custom-input">

                            <span className="input-group-text">
                                <i className="bi bi-shield-lock"></i>
                            </span>

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Enter password again"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                            />

                            <button
                                type="button"
                                className="btn eye-btn"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >

                                <i
                                    className={
                                        showConfirmPassword
                                            ? "bi bi-eye-slash"
                                            : "bi bi-eye"
                                    }
                                ></i>

                            </button>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="btn register-btn w-100"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <i className="bi bi-arrow-right ms-2"></i>
                            </>
                        )}

                    </button>

                </form>
            )}

            {/* =================================
          STEP 4
      ================================= */}

            {step === 4 && (
                <div className="success-section text-center">

                    <div className="account-success-icon mx-auto">
                        <i className="bi bi-check-lg"></i>
                    </div>

                    <h4 className="fw-bold mt-4">
                        Welcome, {formData.name}!
                    </h4>

                    <p className="text-secondary">
                        Your account has been successfully created with
                        <strong className="d-block mt-1">
                            {formData.email}
                        </strong>
                    </p>

                    <button
                        className="btn register-btn w-100 mt-2"
                        onClick={() => {
                            alert("Redirect to login page");
                        }}
                    >
                        Continue to Login

                        <i className="bi bi-arrow-right ms-2"></i>
                    </button>

                </div>
            )}

            {step !== 4 && (
                <p className="login-text text-center mt-4 mb-0">
                    Already have an account?{" "}

                    <Link to="/login">
                        Login
                    </Link>
                </p>
            )}

        </div>
    );
};

export default RegisterForm;