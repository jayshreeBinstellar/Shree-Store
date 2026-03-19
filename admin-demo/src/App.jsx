import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import  { ConfirmationProvider }  from "./context/ConfirmationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import Layout from "./components/admin/Layout";

// Pages
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Customers from "./pages/admin/Customers";
import Categories from "./pages/admin/Categories";
import Banners from "./pages/admin/Banners";
import Coupons from "./pages/admin/Coupons";
import Reviews from "./pages/admin/Reviews";
import Shipping from "./pages/admin/Shipping";
import Payments from "./pages/admin/Payments";
import Support from "./pages/admin/Support";
import Logs from "./pages/admin/Logs";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/auth/Profile";
import { Toaster } from "react-hot-toast";
import Loader from "./components/common/Loader";
import ChangePassword from "./pages/auth/ChangePassword";

const ProtectedRoute = ({ children }) => {
    const { token, isAdmin, loading } = useAuth();

    if (loading) return <Loader fullScreen />;
    if (!token || !isAdmin) return <Navigate to="/login" />;

    return children;
};

function App() {
    const [appLoading, setAppLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setAppLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    if (appLoading) return <Loader fullScreen message="Initializing Admin Panel..." />;

    return (
        <AuthProvider>
            <ConfirmationProvider>
            <Toaster position="top-right" />
            <Router>
                <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Admin Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="products" element={<Products />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="banners" element={<Banners />} />
                        <Route path="coupons" element={<Coupons />} />
                        <Route path="reviews" element={<Reviews />} />
                        <Route path="shipping" element={<Shipping />} />
                        <Route path="payments" element={<Payments />} />
                        <Route path="support" element={<Support />} />
                        <Route path="logs" element={<Logs />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="change-password" element={<ChangePassword/>}/>
                    </Route>
                </Routes>
            </Router>
            </ConfirmationProvider>
        </AuthProvider>
    );
}

export default App;
