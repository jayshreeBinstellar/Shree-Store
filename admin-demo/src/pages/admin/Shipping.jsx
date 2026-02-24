import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ShippingOptionsManagement from '../../components/admin/ShippingOptionsManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

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
            toast.success("Shipping option added");
            fetchOptions();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add option");
        }
    };

    const handleUpdate = async (id, option) => {
        try {
            await AdminService.updateShippingOption(id, option);
            toast.success("Shipping option updated");
            fetchOptions();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update option");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shipping option?")) return;
        try {
            await AdminService.deleteShippingOption(id);
            toast.success("Shipping option deleted");
            fetchOptions();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete option");
        }
    };

    if (loading) return <Loader />;

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
