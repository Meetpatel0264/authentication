import { useRef, useState } from "react";

const OtpInput = ({ onOtpChange }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const updateParent = (values) => {
    onOtpChange(values.join(""));
  };

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    updateParent(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    updateParent(newOtp);

    const nextIndex = Math.min(pastedValue.length, 5);

    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="otp-wrapper">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={digit}
          className={`otp-box ${digit ? "otp-filled" : ""}`}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;