import React, { useEffect, useState } from "react";
import { Modal, Box } from "@mui/material";
import { ShoppingBagIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { getSettings } from "../../services/AdminService";

const Row = ({ label, children, negative }) => (
    <div className={`flex justify-between text-sm ${negative ? 'text-rose-600' : 'text-gray-700'}`}>
        <span className="font-semibold">{label}</span>
        <span className="font-bold">{children}</span>
    </div>
)

const InvoiceModal = ({ open, onClose, order }) => {
    const [taxRate, setTaxRate] = useState(18); // Default fallback
    const [storeName, setStoreName] = useState('GROCERYPRO');

    useEffect(() => {
        if (open) {
            const fetchSettings = async () => {
                try {
                    const res = await getSettings();
                    if (res.status === 'success' && res.settings) {
                        setTaxRate(Number(res.settings.tax_percent));
                        if (res.settings.store_name) {
                            setStoreName(res.settings.store_name);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load invoice settings", error);
                }
            };
            fetchSettings();
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                className="
                            fixed top-1/2 left-1/2
                            -translate-x-1/2 -translate-y-1/2
                            w-[95%] max-w-[820px]
                            max-h-[90vh]
                            bg-white rounded-[32px]
                            shadow-2xl
                            flex flex-col
                            overflow-hidden
                            outline-none
                            print:max-h-none print:rounded-none print:shadow-none
                            "
            >
                {/* INVOICE BODY */}
                <div
                    id="invoice-content"
                    className="
                        flex-1
                        overflow-y-auto
                        p-5
                        space-y-5
                        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                        print:overflow-visible print:p-0
                    "
                >

                    {/* HEADER */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="bg-indigo-600 h-12 w-12 rounded-2xl flex items-center justify-center mb-4">
                                <ShoppingBagIcon className="h-7 w-7 text-white" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">
                                {storeName}
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">

                            </p>
                        </div>

                        <div className="text-right">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                #INV-{order?.order_id}
                            </h3>
                            <p className="text-sm font-semibold text-gray-500 mt-1">
                                {new Date(order?.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* BILLING INFO */}
                    <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4">
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Billed To
                            </p>
                            <p className="font-bold text-gray-900 text-lg">{order?.full_name}</p>
                            <p className="text-sm text-gray-500">{order?.email}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Payment Status
                            </p>
                            <span
                                className={`inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase
              ${order?.status === 'paid'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {order?.status === 'paid'
                                    ? `paid • ${order?.payment_method || 'Stripe'}`
                                    : order?.status || 'Pending'}
                            </span>

                            {order?.payment_id && (
                                <p className="mt-2 text-[10px] text-gray-400 font-mono break-all max-w-[180px] ml-auto">
                                    Ref: {order.payment_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 text-[11px] font-black text-gray-400 uppercase">Item</th>
                                <th className="py-3 text-[11px] font-black text-gray-400 uppercase text-center">Qty</th>
                                <th className="py-3 text-[11px] font-black text-gray-400 uppercase text-right">Amount</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {order?.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4">
                                        <p className="font-semibold text-gray-900">{item.title}</p>

                                        {item.discount > 0 && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400 line-through">
                                                    ${Number(item.price).toFixed(2)}
                                                </span>
                                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase">
                                                    −{item.discount}%
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="text-center font-semibold text-gray-500">
                                        {item.quantity}
                                    </td>

                                    <td className="text-right">
                                        <p className="font-bold text-gray-900">
                                            ${((item.effective_price || item.price) * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            ${Number(item.effective_price || item.price).toFixed(2)} / ea
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* TOTALS */}
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
                        <Row label="Subtotal">
                            ${order?.items?.reduce(
                                (s, i) => s + Number(i.price) * i.quantity,
                                0
                            ).toFixed(2)}
                        </Row>

                        {order?.items?.some(i => i.discount > 0) && (
                            <Row label="Item Savings" negative>
                                -$
                                {order?.items
                                    ?.reduce(
                                        (s, i) =>
                                            s +
                                            (Number(i.price) -
                                                Number(i.effective_price || i.price)) *
                                            i.quantity,
                                        0
                                    )
                                    .toFixed(2)}
                            </Row>
                        )}

                        {Number(order?.discount_amount) > 0 && (
                            <Row label={`Coupon (${order?.coupon_code})`} negative>
                                -${Number(order?.discount_amount).toFixed(2)}
                            </Row>
                        )}

                        <Row label="Shipping">
                            {Number(order?.shipping_fee) > 0
                                ? `$${Number(order?.shipping_fee).toFixed(2)}`
                                : 'Free'}
                        </Row>

                        <Row label={`Tax (${taxRate}%)`}>
                            ${Number(order?.tax_amount).toFixed(2)}
                        </Row>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-900">
                            <span className="text-lg font-black">Grand Total</span>
                            <span className="text-2xl font-black text-indigo-600">
                                ${Number(order?.total_amount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-gray-50 px-4 py-4 flex justify-between items-center print:hidden">
                    <p className="text-xs text-gray-400 italic">
                        This system-generated and digitally verified.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700"
                        >
                            <PrinterIcon className="h-5 w-5" />
                            Print
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>

    );
};

export default InvoiceModal;
