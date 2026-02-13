import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { getAddresses } from "../services/UserService";
import { checkout, getShippingOptions, validateCoupon, getStoreSettings } from "../services/ShopService"; // Import getStoreSettings
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";


const AddCart = ({ onClose, onCartUpdate }) => {
  const { cart, removeItem, updateItem } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingId, setSelectedShippingId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [taxRate, setTaxRate] = useState(0.18); // Default state
  const revalidatingRef = useRef(false);

  useEffect(() => {
    // Lock scroll when cart opens
    document.body.style.overflow = "hidden";

    return () => {
      // Unlock scroll when cart closes
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    // Fetch tax rate from settings
    const fetchSettings = async () => {
      try {
        const res = await getStoreSettings();
        if (res.status === 'success' && res.settings) {
          setTaxRate(parseFloat(res.settings.tax_percent) / 100);
        }
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };
    fetchSettings();

    const fetchAddresses = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getAddresses();
          if (data.status === "success" && data.addresses.length > 0) {
            setAddresses(data.addresses);
            const defaultAddr = data.addresses.find(a => a.is_default) || data.addresses[0];
            setSelectedAddress(defaultAddr.address_id);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchAddresses();

    const fetchShipping = async () => {
      try {
        const data = await getShippingOptions();
        if (data.status === 'success') {
          setShippingOptions(data.options);
          if (data.options.length > 0) {
            setSelectedShippingId(data.options[0].shipping_id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchShipping();
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );

  const baseDiscount = useMemo(
    () =>
      cart.reduce((sum, i) => {
        const d = (i.price * (i.discountPercentage || 0)) / 100;
        return sum + d * i.qty;
      }, 0),
    [cart]
  );

  const cartTotal = subtotal - baseDiscount;

  // Calculate Shipping Cost
  const selectedShippingOption = shippingOptions.find(o => o.shipping_id == selectedShippingId);
  const shippingCost = selectedShippingOption ? parseFloat(selectedShippingOption.cost) : 0;

  // Calculate Coupon Discount
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return Number(appliedCoupon.discountAmount || 0);
  }, [appliedCoupon]);


  const cartSignature = useMemo(() => {
    return cart
      .map(i => `${i.id}:${i.qty}`)
      .sort()
      .join("|");
  }, [cart]);

  const lastValidatedCartRef = useRef("");
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const res = await validateCoupon({
        code: couponCode,
        cartItems: cart,
        cartTotal
      });

      if (res.status === "success" && res.valid) {
        setAppliedCoupon(res.coupon);
        setCouponMsg({
          type: "success",
          text: `Coupon applied: ${res.coupon.description}`
        });

        lastValidatedCartRef.current = cartSignature;
      } else {
        setAppliedCoupon(null);
        setCouponMsg({
          type: "error",
          text: res.message || "Invalid coupon"
        });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMsg({ type: "error", text: err?.message || "Error applying coupon" });
    }
  };


  useEffect(() => {
    if (!appliedCoupon) return;
    if (!cart.length) {
      setAppliedCoupon(null);
      setCouponMsg({ type: "", text: "" });
      return;
    }

    if (lastValidatedCartRef.current === cartSignature) return;
    lastValidatedCartRef.current = cartSignature;

    const revalidate = async () => {
      try {
        const res = await validateCoupon({
          code: appliedCoupon.code,
          cartItems: cart,
          cartTotal
        });

        if (!(res.status === "success" && res.valid)) {
          setAppliedCoupon(null);
          setCouponCode("");
          setCouponMsg({
            type: "error",
            text: res.message || "Coupon removed (cart updated)"
          });
        }
      } catch {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponMsg({
          type: "error",
          text: "Coupon removed due to cart update"
        });
      }
    };

    revalidate();
  }, [cartSignature, cartTotal]);

  useEffect(() => {
    if (!couponMsg.text) return;

    const timer = setTimeout(() => {
      setCouponMsg({ type: "", text: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [couponMsg.text]);

  // Automatically remove coupon when input is cleared
  useEffect(() => {
    if (!couponCode.trim() && appliedCoupon) {
      setAppliedCoupon(null);
      setCouponMsg({ type: '', text: '' });
    }
  }, [couponCode, appliedCoupon]);

  const handleQtyChange = (id, type) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQty = type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);
    updateItem(id, newQty);
  };

  const handleRemove = id => removeItem(id);

  //Checkout

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to checkout");

    const data = await checkout({
      items: cart,
      addressId: selectedAddress,
      couponCode: appliedCoupon?.code || null,
      shippingId: selectedShippingId
    });

    if (data?.url) window.location.href = data.url;
  };

  const taxableAmount = Math.max(0, subtotal - baseDiscount - couponDiscount);
  const taxAmount = taxableAmount * taxRate;
  const totalPayable = taxableAmount + taxAmount + shippingCost;


  return (
    <div className="fixed inset-0 z-1000 flex justify-end overflow-hidden">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tighter">My Basket</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {cart.length} {cart.length === 1 ? 'Item' : 'Items'} Ready
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-7xl opacity-10">🛒</div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Basket Empty</h3>
                <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Start adding fresh products</p>
              </div>
              <button
                onClick={onClose}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-gray-900 transition-all shadow-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => {
                const discountPerItem = (item.price * (item.discountPercentage || 0)) / 100;
                const discountedPrice = item.price - discountPerItem;

                return (
                  <div
                    key={item.id}
                    className="group relative flex gap-3 bg-gray-50/50 p-2.5 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300"
                  >
                    <div className="h-16 w-16 bg-white rounded-lg shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                      <img
                        src={item.thumbnail}
                        className="h-full w-full object-contain mix-blend-multiply"
                        alt={item.title}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-0.5">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 tracking-tight leading-tight line-clamp-1 text-sm">{item.title}</h3>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                        {item.brand || "Premium"}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-gray-900">${discountedPrice.toFixed(2)}</span>
                          {(discountPerItem > 0 || item.old_price) && (
                            <>
                              <span className="text-[9px] text-gray-400 line-through font-medium">
                                ${discountPerItem > 0 ? item.price : Number(item.old_price).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center bg-white border border-gray-100 rounded-lg p-0.5 shadow-sm">
                          <button
                            onClick={() => handleQtyChange(item.id, "dec")}
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-50 rounded transition-colors font-black text-gray-400 hover:text-indigo-600"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-[10px] font-black text-gray-900">{item.qty}</span>
                          <button
                            onClick={() => handleQtyChange(item.id, "inc")}
                            className="w-5 h-5 flex items-center justify-center hover:bg-gray-50 rounded transition-colors font-black text-gray-400 hover:text-indigo-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
            {/* Address Selection */}
            {localStorage.getItem("token") && (
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Shipping To</span>
                  <a href="/main/account" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline italic">Edit</a>
                </div>
                {addresses.length > 0 ? (
                  <select
                    className="w-full bg-gray-50 border border-transparent rounded-lg p-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedAddress || ""}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  >
                    {addresses.map(addr => (
                      <option key={addr.address_id} value={addr.address_id}>
                        {addr.type}: {addr.street_address.substring(0, 20)}...
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[10px] text-gray-400 font-medium italic">
                    No addresses found. <a href="/main/account" className="text-indigo-600 font-bold hover:underline">Add one</a>
                  </div>
                )}
              </div>
            )}

            {/* Shipping Selection */}
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Shipping Method</span>
              <div className="space-y-1">
                {shippingOptions.map(option => (
                  <label key={option.shipping_id} className="flex items-center justify-between p-2 rounded-lg border border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        className="text-indigo-600 focus:ring-indigo-500"
                        checked={selectedShippingId == option.shipping_id}
                        onChange={() => setSelectedShippingId(option.shipping_id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{option.name}</span>
                        <span className="text-[9px] text-gray-400">{option.estimated_days}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-gray-900">${parseFloat(option.cost).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Promo Code</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />

                <button
                  onClick={handleApplyCoupon}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {/* Message */}
              {couponMsg.text && (
                <p className={`text-[10px] font-bold ${couponMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {couponMsg.text}
                </p>
              )}
              {appliedCoupon && (
                <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100">
                  <span className="text-[10px] font-bold text-green-700">{appliedCoupon.code} Applied</span>
                </div>
              )}
            </div>


            <div className="space-y-1.5 px-1">
              <div className="flex justify-between items-center bg-gray-100/50 p-1.5 rounded-lg">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              {baseDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600 px-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest">Item Savings</span>
                  <span className="text-sm font-bold">- ${baseDiscount.toFixed(2)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600 px-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest">Coupon ({appliedCoupon?.code})</span>
                  <span className="text-sm font-bold">- ${couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-indigo-900 px-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest">Shipping</span>
                <span className="text-sm font-bold">${shippingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-gray-500 px-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="text-sm font-bold">${taxAmount.toFixed(2)}</span>
              </div>


              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-black text-gray-900 uppercase tracking-tighter">Payable</span>
                <span className="text-xl font-black text-indigo-600 tracking-tighter">
                  ${totalPayable.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-base hover:bg-indigo-700 transition-all shadow-sm active:scale-95 group flex items-center justify-center gap-2"
            >
              Checkout Now
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCart;
