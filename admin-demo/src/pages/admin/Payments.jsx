
import React, { useState, useEffect } from 'react';
import { getTransactions } from '../../services/AdminService';
import TransactionsLog from '../../components/admin/TransactionsLog';
import Loader from '../../components/Loader';

const Payments = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const fetchTransactions = async (Pages) => {
        setLoading(true);

        try {
            const data = await getTransactions(Pages);

            if (data.status === "success") {
                setTransactions(data.transactions);
                setTotalPages(data.totalPages);
                setTotalTransactions(data.totalTransactions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage]);

    if (loading) return <Loader />;

    return (
        <>
            <TransactionsLog
                transactions={transactions}
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
                totalTransactions={totalTransactions}


            />
        </>
    );
};

export default Payments;
