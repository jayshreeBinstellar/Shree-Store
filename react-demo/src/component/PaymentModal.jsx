import React, { useEffect, useState } from "react";
import { Modal, Box } from "@mui/material";
import { ShoppingBagIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useSettings } from "../context/SettingsContext";

const Row = ({ label, children, negative }) => (
    <div className={`flex justify-between text-sm ${negative ? 'text-rose-600' : 'text-gray-700'}`}>
        <span className="font-semibold">{label}</span>
        <span className="font-bold">{children}</span>
    </div>
)

const PaymentModal = ({ open, onClose, order }) => {
    const { settings } = useSettings();
    const [taxRate, setTaxRate] = useState(18); // Default fallback

    useEffect(() => {
        if (settings?.tax_percent) {
            setTaxRate(Number(settings.tax_percent));
        }
    }, [settings]);

    // Add safe checks since order object might be partial from UserDetails
    const items = order?.items || [];
    const subtotal = order?.subtotal || items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const taxAmount = order?.tax_amount || 0;
    const totalAmount = order?.total_amount || 0;
    const shippingFee = order?.shipping_fee || 0;
    const discountAmount = order?.discount_amount || 0;

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
                        p-8
                        space-y-6
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
                                {settings?.store_name || 'GROCERYPRO'}
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">

                            </p>
                        </div>

                        <div className="text-right">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                {order?.order_id || "#INV-000"}
                            </h3>
                            <p className="text-sm font-semibold text-gray-500 mt-1">
                                {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* BILLING INFO */}
                    <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-6">
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Billed To
                            </p>
                            <p className="font-bold text-gray-900 text-lg">{order?.full_name || 'Customer'}</p>
                            <p className="text-sm text-gray-500">{order?.email}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Payment Status
                            </p>
                            <span
                                className={`inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase
              ${order?.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`
                                }
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
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            {item.thumbnail && (
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 p-1 border border-gray-100 shrink-0 hidden sm:block">
                                                    <img src={item.thumbnail} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                                {Number(item.discount) > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ${Number(item.price).toFixed(2)}
                                                        </span>
                                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase">
                                                            −{Number(item.discount)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-center font-semibold text-gray-500 text-sm">
                                        {item.quantity}
                                    </td>

                                    <td className="text-right">
                                        <p className="font-bold text-gray-900 text-sm">
                                            ${((Number(item.effective_price) || Number(item.price)) * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            ${Number(Number(item.effective_price) || Number(item.price)).toFixed(2)} / ea
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* TOTALS */}
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
                        <Row label="Subtotal">
                            ${Number(subtotal).toFixed(2)}
                        </Row>

                        {items.some(i => Number(i.discount) > 0) && (
                            <Row label="Item Savings" negative>
                                -$
                                {items
                                    .reduce(
                                        (s, i) =>
                                            s +
                                            (Number(i.price) -
                                                (Number(i.effective_price) || Number(i.price))) *
                                            i.quantity,
                                        0
                                    )
                                    .toFixed(2)}
                            </Row>
                        )}

                        {Number(discountAmount) > 0 && (
                            <Row label={`Coupon (${order?.coupon_code || 'Applied'})`} negative>
                                -${Number(discountAmount).toFixed(2)}
                            </Row>
                        )}

                        <Row label="Shipping">
                            {Number(shippingFee) > 0
                                ? `$${Number(shippingFee).toFixed(2)}`
                                : 'Free'}
                        </Row>

                        <Row label={`Tax (${taxRate}%)`}>
                            ${Number(taxAmount).toFixed(2)}
                        </Row>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-900">
                            <span className="text-lg font-black">Grand Total</span>
                            <span className="text-2xl font-black text-indigo-600">
                                ${Number(totalAmount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-gray-50 px-8 py-5 flex justify-between items-center print:hidden border-t border-gray-100">
                    <p className="text-xs text-gray-400 italic">
                        This system-generated and digitally verified.
                    </p>
                                
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                        >
                            <PrinterIcon className="h-4 w-4" />
                            Print
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>

    );
};

export default PaymentModal;
