import React, { useState, useEffect, useMemo } from 'react';
import { useConfirm }  from '../../context/ConfirmationContext';
import * as AdminService from '../../services/AdminService';
import CategoriesManagement from '../../components/admin/CategoriesManagement';
import CategoriesModal from '../../components/admin/CategoriesModal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader.jsx';
import useDataTable from '../../utils/useDataTable.jsx';

const defaultFilters = {
    global: { value: "", matchMode: "contains" },
    name: { value: "", matchMode: "contains" },
    slug: { value: "", matchMode: "contains" }
};

const Categories = () => {

    const {
       data: categories,
        loading,
        totalRecords,
        searchValue,
        lazyParams,
        selectedItems: selectedCategories,
        setSelectedItems: setSelectedCategories,
        handleSearch,
        handleLazyLoad,
        handleSelectAll,
        resetFilters,
        fetchData
    } = useDataTable({
        defaultFilters,
        fetchFn: AdminService.getCategories
    });

    const confirm = useConfirm();

    // Modal state and handlers
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const handleOpenAdd = () => {
      setEditingCategory(null);
      setIsModalOpen(true);
    };

    const handleOpenEdit = (category) => {
      setEditingCategory(category);
      setIsModalOpen(true);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      setEditingCategory(null);
    };

    const handleModalSave = () => {
      fetchData();
      handleModalClose();
    };

    const handleDelete = async (id) => {
      const confirmed = await confirm('Delete this category?');
      if (!confirmed) return;
      try {
        await AdminService.deleteCategory(id);
        toast.success('Category deleted');
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error('Delete failed');
      }
    };


    // const fetchCategories = async () => {
    //     try {

    //         setLoading(true);

    //         const res = await AdminService.getCategories(lazyParams);

    //         if (res?.statusCode === 200) {

    //             setCategories(res.data || []);
    //             setTotalRecords(res.meta?.totalRecords || 0);

    //         }

    //     } catch (err) {

    //         console.error(err);
    //         toast.error("Failed to fetch categories");

    //     } finally {

    //         setLoading(false);

    //     }
    // };

    // useEffect(() => {
    //     fetchCategories();
    // }, [lazyParams]);


    // //select all

    // const handleSelectAll = async () => {

    //     try {

    //         setLoading(true);

    //         const params = {
    //             ...lazyParams,
    //             first: 0,
    //             rows: 999999
    //         };

    //         const res = await AdminService.getCategories(params);

    //         if (res?.statusCode === 200) {

    //             const all = res.data || [];
    //             setSelectedCategories(all);

    //         }

    //     } catch (err) {

    //         console.error(err);

    //     } finally {

    //         setLoading(false);

    //     }

    // };


    //bulk delete
    const handleBulkDelete = async (selectedRows) => {

        if (!selectedRows?.length) return;

        const confirmed = await confirm(`Delete ${selectedRows.length} categories?`);
        if (!confirmed) return;

        try {

            const ids = selectedRows.map(c => c.category_id);

            await AdminService.bulkDeleteCategories(ids);

            toast.success("Categories deleted");

            setSelectedCategories([]);

            fetchData();

        } catch (err) {

            console.error(err);
            toast.error("Delete failed");

        }

    };


    // //search with debounce
    // const debouncedSearch = useMemo(() =>
    //     debounce((value) => {

    //         setLazyParams(prev => ({
    //             ...prev,
    //             first: 0,
    //             page: 1,
    //             filters: {
    //                 ...prev.filters,
    //                 global: {
    //                     value: value || "",
    //                     matchMode: "contains"
    //                 }
    //             }
    //         }));

    //     }, 500)
    //     , []);

    // useEffect(() => {
    //     return () => debouncedSearch.cancel();
    // }, [debouncedSearch]);

    // const handleSearch = (value) => {
    //     setSearchValue(value);
    //     debouncedSearch(value);

    // };


    // // Sanitize filters to ensure they have value and matchMode   
    // const sanitizeFilters = (filters = {}) => {

    //     const safeFilters = {};

    //     Object.keys(filters).forEach(key => {

    //         const filter = filters[key];
    //         if (!filter) return;

    //         if (filter.constraints) {

    //             safeFilters[key] = {
    //                 constraints: filter.constraints.map(c => ({
    //                     value: c.value ?? "",
    //                     matchMode: c.matchMode ?? "contains"
    //                 }))
    //             };

    //         } else {

    //             safeFilters[key] = {
    //                 value: filter.value ?? "",
    //                 matchMode: filter.matchMode ?? "contains"
    //             };

    //         }

    //     });

    //     return safeFilters;

    // };


    // // Handle pagination, sorting, filtering changes from the table
    // const handleLazyLoad = (event) => {

    //     setLazyParams(prev => ({
    //         ...prev,
    //         first: event.first,
    //         rows: event.rows,
    //         sortField: event.sortField,
    //         sortOrder: event.sortOrder,
    //         filters: sanitizeFilters(event.filters),
    //         page: Math.floor(event.first / event.rows) + 1
    //     }));

    // };


    if (loading && !categories.length) return <Loader />;


    return (
        <>
          <CategoriesManagement
            categories={categories}
            isLoading={loading}
            totalRecords={totalRecords}
            lazyParams={lazyParams}
            searchValue={searchValue}
            onLazy={handleLazyLoad}
            onSearch={handleSearch}
            onReload={resetFilters}

            selection={selectedCategories}
            onSelectionChange={setSelectedCategories}
            onSelectAll={handleSelectAll}

            onBulkDelete={handleBulkDelete}
            onAddClick={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
          <CategoriesModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            category={editingCategory}
            onSave={handleModalSave}
          />
        </>
    );

};


export default Categories;