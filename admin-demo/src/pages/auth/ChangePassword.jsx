import React, { useState } from 'react';
import * as AdminService from '../../services/AdminService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ChangePassword = () => {

    const { logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError('');

        try {

            await AdminService.changeMyPassword(currentPassword, newPassword);

            toast.success("Password changed successfully");

            logout();

        } catch (err) {
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

                <h1 className="text-3xl font-black text-slate-900 mb-8">
                    Change Password
                </h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="relative">
                        <input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pr-10 px-4 py-3 border rounded-xl"
                        />
                        <span
                            className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={() => setShowCurrent(!showCurrent)}
                        >
                            {showCurrent ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>

                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pr-10 px-4 py-3 border rounded-xl"
                        />
                        <span
                            className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={() => setShowNew(!showNew)}
                        >
                            {showNew ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pr-10 px-4 py-3 border rounded-xl"
                        />
                        <span
                            className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirm(!showConfirm)}
                        >
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl"
                    >
                        {loading ? "Changing..." : "Change Password"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default ChangePassword;