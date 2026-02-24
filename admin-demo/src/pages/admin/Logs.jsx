
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ActivityLogs from '../../components/admin/ActivityLogs';
import Loader from '../../components/Loader';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const fetchLogs = async (page = 1) => {
        try {
            const data = await AdminService.getLogs(page, 10);
            if (data.status === "success") {
                setLogs(data.logs);
                setPaginationData({
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                });
                setCurrentPage(page);
            }
        } catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= paginationData.totalPages) {
            fetchLogs(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return <Loader message="Loading audit logs..." />;

    return <ActivityLogs
        logs={logs}
        currentPage={currentPage}
        totalPages={paginationData.totalPages}
        onPageChange={handlePageChange}
        itemsTotal={paginationData.total}
        itemsPerPage={paginationData.limit}
    />;
};

export default Logs;
