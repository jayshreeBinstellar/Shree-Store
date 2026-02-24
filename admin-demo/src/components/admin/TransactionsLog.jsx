import React from "react";
import MuiPagination from "../Pagination";

const TransactionsLog = ({ transactions, totalPages, currentPage, handlePageChange, totalTransactions }) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Payment Transactions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Gateway</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.length > 0 ? transactions.map((tx) => (
                            <tr key={tx.transaction_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 font-black text-gray-900 text-xs">{tx.payment_id.length > 30
                                    ? `${tx.payment_id.slice(0, 30)}...`
                                    : tx.payment_id}</td>
                                <td className="px-8 py-4 font-bold text-indigo-600">#{tx.order_id}</td>
                                <td className="px-8 py-4 text-center font-black text-emerald-600">${Number(tx.total_amount).toFixed(2)}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-gray-500 font-bold uppercase text-[10px] tracking-widest">{tx.payment_method || 'Stripe'}</td>
                                <td className="px-8 py-4 text-gray-400 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium italic">No incoming transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <MuiPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsTotal={totalTransactions}
                />
            )}

        </div>
    );
};

export default TransactionsLog;
