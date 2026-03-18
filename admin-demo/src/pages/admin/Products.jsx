import React, { useState, useEffect } from "react";
import { useConfirm }  from '../../context/ConfirmationContext';
import * as AdminService from "../../services/AdminService";
import ProductsManagement from "../../components/admin/ProductsManagement";
import ProductModal from "../../components/admin/ProductModal";
import BulkImportModal from "../../components/admin/BulkImportModal";
import { toast } from "react-hot-toast";
import Loader from "../../components/common/Loader.jsx";
import useDataTable from "../../utils/useDataTable.jsx";



const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    title: { value: "", matchMode: "contains" },
    category: { value: "", matchMode: "contains" },
    price: { value: null, matchMode: "equals" },
    stock: { value: null, matchMode: "equals" },
    // is_active: { value: "", matchMode: "contains" }
};


const defaultForm = {
    title: "",
    description: "",
    price: "",
    old_price: "",
    stock: "",
    category: "",
    thumbnail: "",
    sizes: []
};

const Products = () => {
    const {
        data: products,
        loading,
        totalRecords,
        searchValue,
        selectedItems: selectedProducts,
        setSelectedItems: setSelectedProducts,
        lazyParams,
        setLazyParams,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        fetchData,
        resetFilters
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getProducts
    });

    const confirm = useConfirm();

    const [categories, setCategories] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [bulkJson, setBulkJson] = useState("");


    const fetchCategories = async () => {
        try {
            const data = await AdminService.getCategories();
            if (data?.statusCode === 200) {
                setCategories(data.data.map(c => c.name));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);


    const handleCategoryChange = (value) => {
        setLazyParams(prev => ({
            ...prev,
            first: 0,
            page: 1,
            filters: {
                ...prev.filters,
                category: { value, matchMode: "equals" }
            }
        }));
    };

    const handleStatusChange = (value) => {

        let filterValue = value;

        if (value === "Active") filterValue = true;
        if (value === "Draft") filterValue = false;

        setLazyParams(prev => ({
            ...prev,
            first: 0,
            page: 1,
            filters: {
                ...prev.filters,
                is_active: { value: filterValue, matchMode: "equals" }
            }
        }));
    };


    const handleProductSubmit = async (e, updatedFormData = formData) => {

        e.preventDefault();

        try {

            if (editingProduct) {
                await AdminService.updateProduct(editingProduct.product_id, updatedFormData);
                toast.success("Product updated");
            } else {
                await AdminService.addProduct(updatedFormData);
                toast.success("Product added");
            }

            setIsProductModalOpen(false);
            setFormData(defaultForm);
            fetchData();

        } catch (err) {

            console.error(err);
            toast.error("Failed to save product");

        }
    };

    const handleToggleProductStatus = async (id) => {

        try {
            await AdminService.toggleProductStatus(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSoftDelete = async (id) => {
        console.log("soft delted");
        
        // const confirmed = await confirm("Archive this product?");
        // if (!confirmed) return;

        try {

            await AdminService.softDeleteProduct(id);
            toast.success("Product archived");

            fetchData();

        } catch (err) {

            console.error(err);

        }
    };

    const handleRestore = async(id) => {
        try{
            await AdminService.restoreProduct(id);
            toast.success("restore product");
            fetchData();
        }catch (err){
            console.error(err);
        }
    }

    const handleBulkDelete = async (selectedRows) => {
         console.log("clcik bulk delted");
        try {

            const ids = selectedRows.map(p => p.product_id);

            await AdminService.bulkDeleteProducts(ids);

            toast.success("Products archived");

            setSelectedProducts([]);

            fetchData();

        } catch (err) {

            console.error(err);

        }
    };

    const handleBulkRestore = async(selectedRows) => {
        try{
            const ids = selectedRows.map(p => p.product_id);
            await AdminService.bulkRestoreProducts(ids);
            toast.success("products restore");
            setSelectedProducts([]);
            fetchData();
        }catch(err){
            console.error(err);
        }
    }

    const handleBulkStatusUpdate = async (selectedRows, status) => {

        try {

            const ids = selectedRows.map(p => p.product_id);

            const isActive =
                typeof status === "boolean"
                    ? status
                    : status === "Active";

            await AdminService.bulkUpdateProductStatus(ids, isActive);

            toast.success(`${selectedRows.length} products updated`);

            setSelectedProducts([]);

            fetchData();

        } catch (err) {

            console.error(err);

        }
    };

    

    // const handleBulkUpload = async () => {

    //     try {

    //         const data = JSON.parse(bulkJson);

    //         await AdminService.bulkAddProducts(data);

    //         toast.success("Products imported successfully");

    //         setIsBulkModalOpen(false);
    //         setBulkJson("");

    //         fetchData();

    //     } catch (err) {

    //         console.error(err);
    //         toast.error("Invalid JSON or import failed");

    //     }
    // };

    if (loading && !products.length) return <Loader />;

    return (
        <>
            <ProductsManagement
                products={products}
                isLoading={loading}

                search={searchValue}
                onSearch={handleSearch}
                onReload={resetFilters}
                categories={categories}
                selectedCategory={lazyParams?.filters?.category?.value || "All"}
                onCategoryChange={handleCategoryChange}

                selectedStatus={
                    lazyParams?.filters?.is_active?.value === true
                        ? "Active"
                        : lazyParams?.filters?.is_active?.value === false
                        ? "Deactive"
                        : "All"
                }

                onStatusChange={handleStatusChange}

                onLazy={handleLazyLoad}
                lazyParams={lazyParams}
                totalRecords={totalRecords}

                selection={selectedProducts}
                onSelectionChange={setSelectedProducts}
                onSelectAll={handleSelectAll}

                onEdit={(p) => {
                    setEditingProduct(p);
                    setFormData(p);
                    setIsProductModalOpen(true);
                }}

                onDelete={handleSoftDelete}
                onToggleStatus={handleToggleProductStatus}

                onAddClick={() => {
                    setEditingProduct(null);
                    setFormData(defaultForm);
                    setIsProductModalOpen(true);
                }}
                
                onRestore={handleRestore}
                onBulkDelete={handleBulkDelete}
                onBulkRestore={handleBulkRestore}
                onBulkStatusUpdate={handleBulkStatusUpdate}
            />

            <ProductModal
                open={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                editingProduct={editingProduct}
                formData={formData}
                handleFormChange={(e) =>
                    setFormData({
                        ...formData,
                        [e.target.name]: e.target.value
                    })
                }
                handleSubmit={handleProductSubmit}
                categories={categories}
            />

            <BulkImportModal
                open={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                bulkJson={bulkJson}
                setBulkJson={setBulkJson}
                // onImport={handleBulkUpload}
            />
        </>
    );
};

export default Products;