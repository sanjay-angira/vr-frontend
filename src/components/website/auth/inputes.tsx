import OtpInput from "react-otp-input";
import { ChevronDown } from "lucide-react";

type PhoneInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
};

const PhoneInput = ({
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: PhoneInputProps) => {
  return (
    <div className="auth-phone-field">
      <div className={`auth-phone-control${error ? " has-error" : ""}`}>
        <div className="auth-phone-prefix" aria-hidden>
          <span className="auth-phone-flag" role="img" aria-label="India">
            🇮🇳
          </span>
          <span className="auth-phone-code">+91</span>
          <ChevronDown size={14} strokeWidth={2} className="auth-phone-chevron" />
        </div>
        <input
          name="phoneNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          placeholder="Enter your phone number"
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="auth-phone-input"
          maxLength={10}
        />
      </div>
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
};

type OtpInputProps = {
  value: string;
  onChange(otp: string): void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
};

const OTPInput = ({ value, onChange, error }: OtpInputProps) => {
  const handleChangeOtp = (otp: string) => {
    onChange(otp);
  };

  return (
    <div className="auth-otp-field">
      <OtpInput
        value={value}
        onChange={handleChangeOtp}
        numInputs={6}
        renderSeparator={<span className="auth-otp-sep">-</span>}
        inputStyle="auth-otp-box"
        containerStyle="auth-otp-row"
        renderInput={(props) => <input {...props} />}
      />
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
};

type InputProps = {
  label?: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  inputClasses?: string;
  prefix?: string;
  divClasses?: string;
};

const Input = ({
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  disabled,
  maxLength,
  inputClasses,
  prefix,
  divClasses,
}: InputProps) => {
  return (
    <div className={`relative ${divClasses ?? ""}`}>
      {prefix && (
        <span className="absolute left-2 top-1/4 text-gray-500 font-medium">
          {prefix}
        </span>
      )}
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={inputClasses}
        maxLength={maxLength}
      />
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
};

export { PhoneInput, OTPInput, Input };
