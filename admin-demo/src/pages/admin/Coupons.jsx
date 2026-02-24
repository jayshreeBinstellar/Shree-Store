
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import CouponsManagement from '../../components/admin/CouponsManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        try {
            const data = await AdminService.getCoupons();
            if (data.status === "success") setCoupons(data.coupons);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Delete coupon?")) return;
        try {
            await AdminService.deleteCoupon(id);
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete coupon");
        }
    };

    const handleAddCoupon = async (data) => {
        try {
            await AdminService.addCoupon(data);
            toast.success("Coupon added successfully");
            fetchCoupons();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add coupon");
        }
    };

    if (loading) return <Loader />;

    return (
        <CouponsManagement
            coupons={coupons}
            onDelete={handleDeleteCoupon}
            onAdd={handleAddCoupon}
        />
    );
};

export default Coupons;
