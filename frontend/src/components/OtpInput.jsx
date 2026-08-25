import { useRef, useState } from "react";

const OtpInput = ({ onOtpChange, classNamePrefix = "otp" }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef([]);

  const update = (next) => {
    setOtp(next);
    onOtpChange(next.join(""));
  };

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    update(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const value = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!value) return;
    const next = ["", "", "", "", "", ""];
    value.split("").forEach((digit, i) => (next[i] = digit));
    update(next);
    refs.current[Math.min(value.length, 5)]?.focus();
  };

  return (
    <div className={`${classNamePrefix}-wrapper`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (refs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength="1"
          value={digit}
          className={`${classNamePrefix}-box ${digit ? "filled otp-filled" : ""}`}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
