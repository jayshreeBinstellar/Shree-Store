
import React, { useState, useEffect } from 'react';
import {getTransactions} from '../../services/AdminService';
import TransactionsLog from '../../components/admin/TransactionsLog';

const Payments = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const data = await getTransactions();
            console.log(data, "transactions data");
            
            if (data.status === "success") setTransactions(data.transactions);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    if (loading) return (
        <div className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return <TransactionsLog transactions={transactions} />;
};

export default Payments;
