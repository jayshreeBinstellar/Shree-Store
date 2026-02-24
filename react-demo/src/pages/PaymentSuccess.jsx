import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../services/ShopService';
import { useCart } from '../context/CartContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const orderIdParam = searchParams.get('orderId');

        if (!sessionId && !orderIdParam) {
            setStatus('error');
            setMessage('Invalid verification details.');
            return;
        }

        const verify = async () => {
            try {
                const response = await verifyPayment({
                    orderId: orderIdParam,
                    sessionId: sessionId,
                    status: 'success'
                });

                if (response.status === 'success') {
                    setStatus('success');
                    setMessage('Payment confirmed! Order placed successfully.');

                    await refreshCart();

                    setTimeout(() => {
                        navigate('/main/dashboard');
                    }, 20000);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Payment verification failed.');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('An error occurred while verifying the payment.');
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

                {/* PROCESSING */}
                {status === "processing" && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Processing Payment
                        </h2>

                        <p className="text-gray-500 text-sm mb-4">
                            {message}
                        </p>

                        <p className="text-xs text-gray-400">
                            Please do not refresh or close this page
                        </p>
                    </>
                )}

                {/* SUCCESS */}
                {status === "success" && (
                    <>
                        <CheckCircleIcon className="h-14 w-14 text-green-500 mx-auto mb-4" />

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Payment Successful
                        </h2>

                        <p className="text-gray-600 text-sm mb-4">
                            {message}
                        </p>

                        {/* {confirmedOrderId && (
                            <p className="text-sm font-medium text-indigo-600 mb-4">
                                Order #{confirmedOrderId}
                            </p>
                        )} */}

                        <button
                            onClick={() => navigate("/main/dashboard")}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                        >
                            Go to Main Page
                        </button>
                    </>
                )}

                {/* ERROR */}
                {status === "error" && (
                    <>
                        <XCircleIcon className="h-14 w-14 text-red-500 mx-auto mb-4" />

                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Verification Failed
                        </h2>

                        <p className="text-gray-600 text-sm mb-6">
                            {message}
                        </p>

                        <button
                            onClick={() => navigate("/main/dashboard")}
                            className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition"
                        >
                            Return to Dashboard
                        </button>
                    </>
                )}

            </div>
        </div>
    );

};

export default PaymentSuccess;
