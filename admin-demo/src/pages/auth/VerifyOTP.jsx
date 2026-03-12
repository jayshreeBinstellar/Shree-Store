import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import * as AdminService from '../../services/AdminService';
import Loader from '../../components/common/Loader';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Move to next input
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pastedData[i] || '';
        }
        setOtp(newOtp);

        // Focus last filled input or first empty
        const lastFilledIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastFilledIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const otpValue = otp.join('');
        
        if (otpValue.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const response = await AdminService.verifyOTP(email, otpValue);
            if (response.status === "success") {
                // Navigate to reset password with the reset token
                navigate('/reset-password', { 
                    state: { 
                        email,
                        resetToken: response.resetToken 
                    } 
                });
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP. Please try again.');
            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || resendLoading) return;
        
        setResendLoading(true);
        setError('');

        try {
            const response = await AdminService.resendOTP(email);
            if (response.status === "success") {
                setResendSuccess(true);
                setCountdown(60); // 60 second cooldown
                setTimeout(() => setResendSuccess(false), 3000);
            }
        } catch (err) {
            setError(err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    if (loading) return <Loader fullScreen message="Verifying OTP..." />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Verify OTP
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter the 6-digit code sent to<br />
                    <span className="font-medium text-indigo-600">{email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md text-center">
                                OTP resent successfully!
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                Verify OTP
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || resendLoading}
                                    className={`font-medium ${
                                        countdown > 0 
                                            ? 'text-gray-400 cursor-not-allowed' 
                                            : 'text-indigo-600 hover:text-indigo-500'
                                    }`}
                                >
                                    {resendLoading 
                                        ? 'Sending...' 
                                        : countdown > 0 
                                            ? `Resend in ${countdown}s` 
                                            : 'Resend OTP'
                                    }
                                </button>
                            </p>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                Change email address
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;

