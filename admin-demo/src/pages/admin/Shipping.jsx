import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ShippingOptionsManagement from '../../components/admin/ShippingOptionsManagement';

const Shipping = () => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOptions = async () => {
        try {
            const data = await AdminService.getShippingOptions();
            if (data.status === "success") setOptions(data.options);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    const handleAdd = async (option) => {
        try {
            await AdminService.addShippingOption(option);
            fetchOptions();
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (id, option) => {
        try {
            await AdminService.updateShippingOption(id, option);
            fetchOptions();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shipping option?")) return;
        try {
            await AdminService.deleteShippingOption(id);
            fetchOptions();
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
        <ShippingOptionsManagement
            options={options}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    );
};

export default Shipping;
