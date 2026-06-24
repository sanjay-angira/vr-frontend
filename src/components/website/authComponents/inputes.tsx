import OtpInput from 'react-otp-input';
import { useState } from 'react';


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
        <div className="relative border border-gray-300">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 font-medium">
                +91
            </span>
            <input
                name="phoneNumber"
                type="tel"
                value={value}
                placeholder="Enter your phone number"
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className="w-full !px-3 !py-2 !pl-10 border border-gray-100 text-gray-700 font-medium"
                maxLength={10}
            />

            {error && (
                <p className="!text-red-600 absolute font-medium" >
                    {error}
                </p>
            )}
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
const OTPInput = ({ value, onChange, error, disabled, maxLength }: OtpInputProps) => {
    const handleChangeOtp = (otp: string) => {
        console.log("OTP Value ", otp);
        onChange(otp);
    };

    return (
        <div className="relative">
            <OtpInput
                value={value}
                onChange={handleChangeOtp}
                numInputs={6}
                renderSeparator={<span>-</span>}
                inputStyle="border !w-10 !h-10 rounded-lg border-gray-300 m-auto"
                containerStyle="flex items-center justify-between"
                renderInput={(props) => <input {...props} />}
            />
            {error && (
                <p className="!text-red-600 absolute font-medium" >
                    {error}
                </p>
            )}
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
    label,
    name,
    type = 'text',
    value,
    placeholder,
    onChange,
    onBlur,
    error,
    disabled,
    required,
    maxLength,
    inputClasses,
    prefix,
    divClasses
}: InputProps) => {
    return (
        <div className={`relative ${divClasses}`}>
            {prefix && (
                <span className="absolute left-2 top-1/4 !text-gray-500 font-medium">
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

            {error && (
                <p className="!text-red-600 !mt-1 absolute font-medium" >
                    {error}
                </p>
            )}
        </div>
    );
};


export { PhoneInput, OTPInput, Input }