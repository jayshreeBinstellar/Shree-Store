import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { getAddresses } from "../services/UserService";
import { checkout, getShippingOptions, validateCoupon } from "../services/ShopService";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import CartItemsList from "../component/CartItemsList";
import CartAddressSelector from "../component/CartAddressSelector";
import CartShippingSelector from "../component/CartShippingSelector";
import CartPromoCode from "../component/CartPromoCode";
import CartSummary from "../component/CartSummary";

const AddCart = ({ onClose, onCartUpdate }) => {
  const { cart, removeItem, updateItem } = useCart();
  const { settings } = useSettings();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingId, setSelectedShippingId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const taxRate = settings && settings.tax_percent ? parseFloat(settings.tax_percent) / 100 : 0.18;

  useEffect(() => {
    // Lock scroll when cart opens
    document.body.style.overflow = "hidden";

    return () => {
      // Unlock scroll when cart closes
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {

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
    // Only clear if couponCode is completely empty and we have an applied coupon
    if (couponCode.trim() === "" && appliedCoupon !== null) {
      setAppliedCoupon(null);
      setCouponMsg({ type: '', text: '' });
    }
  }, [couponCode]);

  const handleQtyChange = (id, type) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const newQty = type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);
    updateItem(id, newQty);
  };

  const handleRemove = id => removeItem(id);

  //Checkout

  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to checkout");

    setCheckingOut(true);
    try {
      const data = await checkout({
        items: cart,
        addressId: selectedAddress,
        couponCode: appliedCoupon?.code || null,
        shippingId: selectedShippingId
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout failed. Please try again.");
        setCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
      setCheckingOut(false);
    }
  };

  const taxableAmount = Math.max(0, subtotal - baseDiscount - couponDiscount);
  const taxAmount = taxableAmount * taxRate;
  const totalPayable = taxableAmount + taxAmount + shippingCost;

  return (
    <div className="fixed inset-0 z-1000 flex justify-end overflow-hidden">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
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
            className="cursor-pointer w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
          <CartItemsList
            cart={cart}
            handleRemove={handleRemove}
            handleQtyChange={handleQtyChange}
            onClose={onClose}
          />
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
            {/* Address Selection */}
            <CartAddressSelector
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />

            {/* Shipping Selection */}
            <CartShippingSelector
              shippingOptions={shippingOptions}
              selectedShippingId={selectedShippingId}
              setSelectedShippingId={setSelectedShippingId}
            />

            {/* Coupon Section */}
            <CartPromoCode
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              couponMsg={couponMsg}
              appliedCoupon={appliedCoupon}
            />

            <CartSummary
              subtotal={subtotal}
              baseDiscount={baseDiscount}
              couponDiscount={couponDiscount}
              appliedCoupon={appliedCoupon}
              shippingCost={shippingCost}
              taxRate={taxRate}
              taxAmount={taxAmount}
              totalPayable={totalPayable}
              handleCheckout={handleCheckout}
              checkingOut={checkingOut}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCart;
