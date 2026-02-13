import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
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
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
    const { token, isAdmin, loading } = useAuth();

    if (loading) return null;
    if (!token || !isAdmin) return <Navigate to="/login" />;

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

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
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
