
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import CouponsManagement from '../../components/admin/CouponsManagement';

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
            fetchCoupons();
        } catch (err) { console.error(err); }
    };

    const handleAddCoupon = async (data) => {
        try {
            await AdminService.addCoupon(data);
            fetchCoupons();
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <CouponsManagement
            coupons={coupons}
            onDelete={handleDeleteCoupon}
            onAdd={handleAddCoupon}
        />
    );
};

export default Coupons;
