import React, { useState } from "react";
import * as AdminService from "../../services/AdminService";
import OrdersManagement from "../../components/admin/OrdersManagement";
import InvoiceModal from "../../components/admin/InvoiceModal";
import { toast } from "react-hot-toast";
import Loader from "../../components/common/Loader.jsx";
import useDataTable from "../../utils/useDataTable.jsx";
import { FilterMatchMode } from "primereact/api";

const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    order_id: { value: "", matchMode: "contains" },
    full_name: { value: "", matchMode: "contains" },
    created_at: { value: null, matchMode: FilterMatchMode.DATE_IS },
    total_amount: { value: null, matchMode: "equals" },
    // status: { value: "", matchMode: "equals" }
};

const Orders = () => {

    const {
        data: orders,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedOrders,
        setSelectedItems: setSelectedOrders,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getOrders
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await AdminService.updateOrderStatus(id, status);
            toast.success("Order status updated");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    const handleBulkStatusUpdate = async (selectedRows, status) => {
        if (!selectedRows.length) return;

        try {
            const ids = selectedRows.map(o => o.order_id);

            await AdminService.bulkUpdateOrderStatus(ids, status);

            toast.success(`${selectedRows.length} orders updated`);

            setSelectedOrders([]);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Bulk update failed");
        }
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setIsInvoiceModalOpen(true);
    };

    if (loading && !orders.length) {
        return <Loader message="Loading orders..." />;
    }

    return (
        <>
            <OrdersManagement
                orders={orders}
                isLoading={loading}
                totalRecords={totalRecords}
                lazyParams={lazyParams}
                searchValue={searchValue}
                onLazy={handleLazyLoad}
                onSearch={handleSearch}
                onReload={resetFilters}
       
                selection={selectedOrders}
                onSelectionChange={setSelectedOrders}
                onSelectAll={handleSelectAll}

                onUpdateStatus={handleUpdateOrderStatus}
                onBulkStatusUpdate={handleBulkStatusUpdate}
                onViewInvoice={handleViewInvoice}
            />

            <InvoiceModal
                open={isInvoiceModalOpen}
                order={selectedOrder}
                onClose={() => setIsInvoiceModalOpen(false)}
            />
        </>
    );
};

export default Orders;

