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

export const completeProfileSchema = Yup.object({
    firstName: Yup.string()
        .trim()
        .min(2, 'First name must be at least 2 characters')
        .max(25, 'First name must be at most 25 characters')
        .required('First name is required'),
    lastName: Yup.string()
        .trim()
        .min(2, 'Last name must be at least 2 characters')
        .max(25, 'Last name must be at most 25 characters')
        .required('Last name is required'),
    email: Yup.string()
        .trim()
        .email('Enter a valid email address')
        .max(50, 'Email must be at most 50 characters')
        .required('Email is required'),
});