
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ProductsManagement from '../../components/admin/ProductsManagement';
import ProductModal from '../../components/admin/ProductModal';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: "", description: "", price: "", old_price: "",
        stock: "", category: "", thumbnail: ""
    });
    const [bulkJson, setBulkJson] = useState("");

    const fetchProducts = async (page = 1) => {
        try {
            const data = await AdminService.getProducts(page);
            if (data.status === "success") {
                setProducts(data.products.filter(p => !p.is_soft_deleted));
                setCurrentPage(data.page || page);
                setTotalPages(data.totalPages || 1);
                setTotalProducts(data.total || 0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await AdminService.getCategories();
            if (data.status === "success") setCategories(data.categories.map(c => c.name));
        } catch (err) { console.error(err); }
    };

    const init = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(1), fetchCategories()]);
        setLoading(false);
    }

    useEffect(() => {
        init();
    }, []);

    const handlePageChange = async (newPage) => {
        setLoading(true);
        await fetchProducts(newPage);
        setLoading(false);
    };

    const handleProductSubmit = async (e, updatedFormData = formData) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await AdminService.updateProduct(editingProduct.product_id, updatedFormData);
            } else {
                await AdminService.addProduct(updatedFormData);
            }
            setIsProductModalOpen(false);
            fetchProducts(currentPage);
        } catch (err) { console.error(err); }
    };

    const handleToggleProductStatus = async (id) => {
        try {
            await AdminService.toggleProductStatus(id);
            fetchProducts(currentPage);
        } catch (err) { console.error(err); }
    };

    const handleSoftDelete = async (id) => {
        if (!window.confirm("Archive this product? It will be removed from storefront but kept in records.")) return;
        try {
            await AdminService.softDeleteProduct(id);
            fetchProducts(currentPage);
        } catch (err) { console.error(err); }
    };

    const handleBulkUpload = async () => {
        try {
            const productsList = JSON.parse(bulkJson);
            await AdminService.bulkAddProducts(productsList);
            toast.success("Bulk products added successfully!");
            setIsBulkModalOpen(false);
            setBulkJson("");
            fetchProducts(1);
        } catch (err) {
            toast.error("Check your JSON format: " + err.message);
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            <ProductsManagement
                products={products}
                onEdit={(p) => { setEditingProduct(p); setFormData(p); setIsProductModalOpen(true); }}
                onToggleStatus={handleToggleProductStatus}
                onDelete={handleSoftDelete}
                onAddClick={() => { setEditingProduct(null); setFormData({ title: "", description: "", price: "", old_price: "", stock: "", category: "", thumbnail: "" }); setIsProductModalOpen(true); }}
                onBulkClick={() => setIsBulkModalOpen(true)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
                totalProducts={totalProducts}
            />
            <ProductModal
                open={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}
                editingProduct={editingProduct} formData={formData}
                handleFormChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                handleSubmit={handleProductSubmit} categories={categories}
            />
            <BulkImportModal
                open={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)}
                bulkJson={bulkJson} setBulkJson={setBulkJson}
                onImport={handleBulkUpload}
                onLoadSample={() => setBulkJson(JSON.stringify([{ title: "Example Product", description: "Premium Quality Product", price: 99.99, stock: 50, category: "Electronics", thumbnail: "https://via.placeholder.com/150" }], null, 2))}
            />
        </>
    );
};

export default Products;
