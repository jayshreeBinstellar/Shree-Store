
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import CustomersManagement from '../../components/admin/CustomersManagement';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);

    const fetchCustomers = async (page = 1) => {
        try {
            const data = await AdminService.getCustomers(page);
            if (data.status === "success") {
                setCustomers(data.customers);
                setCurrentPage(data.page || page);
                setTotalPages(data.totalPages || 1);
                setTotalCustomers(data.total || 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const init = async () => {
        setLoading(true);
        await fetchCustomers(1);
        setLoading(false);
    }

    useEffect(() => {
        init();
    }, []);

    const handleUpdateUserRole = async (id, role) => {
        try {
            await AdminService.updateCustomerRole(id, role);
            fetchCustomers(currentPage);
        } catch (err) { console.error(err); }
    };

    const handleToggleBlock = async (id) => {
        try {
            await AdminService.toggleCustomerBlock(id);
            fetchCustomers(currentPage);
        } catch (err) { console.error(err); }
    };

    const handlePageChange = (newPage) => {
        fetchCustomers(newPage);
    };

    if (loading) return (
        <div className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <CustomersManagement
            customers={customers}
            onToggleBlock={handleToggleBlock}
            onUpdateRole={handleUpdateUserRole}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
            totalCustomers={totalCustomers}
            />
        )
    
};

export default Customers;
