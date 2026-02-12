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
    const [confirmedOrderId, setConfirmedOrderId] = useState(null);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const orderIdParam = searchParams.get('orderId'); // Legacy or if passed

        if (!sessionId && !orderIdParam) {
            setStatus('error');
            setMessage('Invalid verification details.');
            return;
        }

        const verify = async () => {
            try {
                // Call verification API
                // If we have sessionId, backend will use it to CREATE the order if needed
                const response = await verifyPayment({
                    orderId: orderIdParam, // Might be null now
                    sessionId: sessionId,
                    status: 'success'
                });

                if (response.status === 'success') {
                    setStatus('success');
                    setMessage('Payment confirmed! Order placed successfully.');

                    if (response.orderId) {
                        setConfirmedOrderId(response.orderId);
                        setMessage(`Payment confirmed! Order #${response.orderId} placed successfully.`);
                    }

                    await refreshCart();

                    setTimeout(() => {
                        navigate('/main/dashboard');
                    }, 4000);
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

        // Prevent double-call in React Strict Mode if possible, or reliance on idempotency
        verify();
    }, [searchParams]); // removed refreshCart/navigate from dependency to avoid loop

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {status === 'processing' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-opacity-50 mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing...</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Success!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        {confirmedOrderId && (
                            <p className="text-lg font-bold text-indigo-600 mb-4">Order ID: #{confirmedOrderId}</p>
                        )}
                        <p className="text-sm text-gray-400">Redirecting to Dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/main/dashboard')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
