import * as Yup from 'yup';

export const phoneSchema = Yup.object({
    phoneNumber: Yup.string()
        .matches(/^[0-9]{10}$/, 'Enter valid 10 digit number')
        .required('Phone number is required'),
});

export const otpSchema = Yup.object({
    otp: Yup.string()
        .matches(/^[0-9]{6}$/, 'Enter valid 6 digit OTP')
        .required('OTP is required'),
});