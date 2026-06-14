"use client";

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { phoneSchema, otpSchema } from '../../utils/validations';
import { getError } from '../../utils/formikHelpers';
import { postData } from '../../services/api/apiService';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '@/services/api/API_ENDPOINT';
import { useDispatch } from 'react-redux';
import { setUser } from '../../services/redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import { Button } from '../commonComponents/buttons';
import { PhoneInput, OTPInput } from '../commonComponents/inputs';

export default function SignUpForm() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'phone' | 'otp'>('phone');

    const dispatch = useDispatch();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ PHONE FORM
    const phoneFormik = useFormik({
        initialValues: { phoneNumber: '' },
        validationSchema: phoneSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await postData(
                    API_ENDPOINTS.SEND_WHATSAPP_OTP,
                    { phoneNumber: values.phoneNumber }
                );

                if (response.success) {
                    toast.success('OTP sent successfully via WhatsApp!');
                    setStep('otp');
                } else {
                    toast.error(response.message || 'Failed to send OTP');
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Failed to send OTP');
            } finally {
                setLoading(false);
            }
        }
    });

    // ✅ OTP FORM
    const otpFormik = useFormik({
        initialValues: { otp: '' },
        validationSchema: otpSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await postData(
                    API_ENDPOINTS.VERIFY_WHATSAPP_OTP,
                    {
                        phoneNumber: phoneFormik.values.phoneNumber,
                        otp: values.otp
                    }
                );

                if (response.success) {
                    const { accessToken, refreshToken, user } = response.data;

                    if (accessToken) {
                        Cookies.set('accessToken', accessToken, { expires: 7 });
                    }

                    if (refreshToken) {
                        Cookies.set('refreshToken', refreshToken, { expires: 7 });
                    }

                    if (user) {
                        dispatch(setUser({
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            phone: user.phoneNumber || user.phone,
                            address: user.address,
                            city: user.city,
                            state: user.state,
                            pinCode: user.pinCode,
                            profileImage: user.profileImage,
                        }));
                    }

                    toast.success('Login successful!');
                    router.push('/');
                } else {
                    toast.error(response.message || 'Invalid OTP');
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Invalid OTP');
            } finally {
                setLoading(false);
            }
        }
    });

    if (!mounted) return null; // 🔥 prevents mismatch
    return (
        <div className="auth-modal-form w-full">
            {step === 'phone' ? (
                <form onSubmit={phoneFormik.handleSubmit} className="space-y-5">

                    <PhoneInput
                        value={phoneFormik.values.phoneNumber}
                        onChange={phoneFormik.handleChange}
                        onBlur={phoneFormik.handleBlur}
                        error={getError(phoneFormik, 'phoneNumber')}
                    />

                    <Button
                        type="submit"
                        text="CONTINUE"
                        loading={loading}
                        disabled={loading}
                        loadingText="Sending OTP..."
                    />

                </form>
            ) : (
                <form onSubmit={otpFormik.handleSubmit} className="space-y-5">

                    <OTPInput
                        value={otpFormik.values.otp}
                        onChange={(otp: string) => otpFormik.setFieldValue('otp', otp)}
                        onBlur={otpFormik.handleBlur}
                        error={getError(otpFormik, 'otp')}
                        maxLength={6}
                    />

                    <Button
                        type="submit"
                        text="Verify & Login"
                        loading={loading}
                        disabled={loading}
                        loadingText="Verifying..."
                    />

                </form>
            )}
        </div>
    );
}