"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import dynamic from "next/dynamic";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useCart } from "../components/CartContext";
import type { PaymentMethod } from "../components/PaymentMethodSelector";

// Dynamically import PaymentMethodSelector (not critical for initial render)
const PaymentMethodSelector = dynamic(() => import("../components/PaymentMethodSelector"), {
  loading: () => <div className="animate-pulse bg-gray-100 h-32 rounded" />,
});
import { formatCurrency } from "@/app/lib/currency";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, MapPin } from "lucide-react";
import Image from "next/image";

interface Address {
  id: string;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

interface FormErrors {
  [key: string]: string;
}

const DELIVERY_OPTIONS = [
  { id: "standard", name: "Standard Delivery", cost: 15, days: "5-7 business days" },
  { id: "express", name: "Express Delivery", cost: 30, days: "2-3 business days" },
  { id: "pickup", name: "Store Pickup", cost: 0, days: "Ready for pickup" },
];

export default function Checkout() {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
  const { cart, getCartTotal, clearCart, validateCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState("");
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState("mtn");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    email: session?.user?.email || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "Ghana",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const subtotal = getCartTotal();
  const selectedDelivery = DELIVERY_OPTIONS.find((opt) => opt.id === deliveryMethod) || DELIVERY_OPTIONS[0];
  const shippingCost = selectedDelivery.cost;
  const discount = promoDiscount;
  const total = Math.max(0, subtotal + shippingCost - discount);

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  // Fetch saved addresses if user is logged in
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/account/addresses", {
        cache: 'no-store', // User-specific data, don't cache
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            // Auto-select default address if available
            const defaultAddress = data.addresses.find((addr: Address) => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setUseNewAddress(false);
              fillFormFromAddress(defaultAddress);
            }
          }
        })
        .catch((err) => console.error("Failed to fetch addresses:", err));
    }
  }, [session]);

  const fillFormFromAddress = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      email: session?.user?.email || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      region: address.region || "",
      postalCode: address.postalCode,
      country: address.country,
    });
  };

  const handleAddressSelect = (addressId: string) => {
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      fillFormFromAddress(address);
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData({
      fullName: "",
      email: session?.user?.email || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Ghana",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^0\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid Ghana phone number (e.g., 0244123456)";
    }
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.region.trim()) newErrors.region = "Region is required";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";

    if (paymentMethod === "mobile_money") {
      if (!mobileMoneyPhone.trim()) newErrors.mobileMoneyPhone = "Mobile money phone is required";
      else if (!/^0\d{9}$/.test(mobileMoneyPhone.replace(/\s/g, ""))) {
        newErrors.mobileMoneyPhone = "Please enter a valid Ghana phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoError("");
    setLoading(true);

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, amount: subtotal }),
      });

      const data = await response.json();

      if (data.valid) {
        setPromoDiscount(data.discount);
        setPromoApplied(true);
        setPromoError("");
      } else {
        setPromoError(data.error || "Invalid promo code");
        setPromoDiscount(0);
        setPromoApplied(false);
      }
    } catch (error) {
      setPromoError("Failed to validate promo code. Please try again.");
      setPromoDiscount(0);
      setPromoApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Validate cart server-side before checkout
      const validation = await validateCart();
      
      if (!validation.valid) {
        alert(`Cart validation failed: ${validation.errors.map((e: any) => e.message).join(", ")}`);
        setLoading(false);
        return;
      }

      // Use validated items if available
      const itemsToCheckout = validation.correctedItems || cart;

      const orderData = {
        items: itemsToCheckout.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shipping: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          region: formData.region,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        deliveryMethod,
        paymentMethod,
        subtotal,
        shippingCost,
        discount,
        total,
        promoCode: promoApplied ? promoCode : null,
        mobileMoneyPhone: paymentMethod === "mobile_money" ? mobileMoneyPhone : null,
        mobileMoneyProvider: paymentMethod === "mobile_money" ? mobileMoneyProvider : null,
      };

      // Use Paystack for all payment methods (card and mobile money)
      const response = await fetch("/api/checkout/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success && data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl;
      } else if (data.success && data.orderId) {
        // Fallback: if Paystack is not configured, use old endpoint
        clearCart();
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        alert(data.error || "Payment initialization failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <section className="w-full py-8 md:py-12 lg:py-20 px-4 md:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-light tracking-wide mb-6 md:mb-8 lg:mb-12">CHECKOUT</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Shipping Information */}
                <div>
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-base md:text-lg lg:text-xl font-light tracking-wide">SHIPPING INFORMATION</h2>
                    {session?.user?.id && savedAddresses.length > 0 && (
                      <Link
                        href="/account"
                        className="text-[10px] md:text-xs tracking-widest uppercase font-light text-gray-600 hover:text-black transition-colors"
                      >
                        Manage Addresses
                      </Link>
                    )}
                  </div>

                  {/* Saved Addresses Selector (only for logged-in users) */}
                  {session?.user?.id && savedAddresses.length > 0 && (
                    <div className="mb-4 md:mb-6 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={handleUseNewAddress}
                          className={`px-4 py-2 text-[10px] md:text-xs tracking-widest uppercase font-light border transition-colors ${
                            useNewAddress
                              ? "border-black bg-black text-white"
                              : "border-gray-300 hover:border-black"
                          }`}
                        >
                          Use New Address
                        </button>
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleAddressSelect(address.id)}
                            className={`px-4 py-2 text-[10px] md:text-xs tracking-widest uppercase font-light border transition-colors flex items-center gap-2 ${
                              selectedAddressId === address.id && !useNewAddress
                                ? "border-black bg-black text-white"
                                : "border-gray-300 hover:border-black"
                            }`}
                          >
                            <MapPin size={12} />
                            {address.isDefault ? "Default" : address.city}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address Form */}
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.fullName && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.email && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0244123456"
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.phone && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                          errors.addressLine1 ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.addressLine1 && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.addressLine1}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 text-xs md:text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                            errors.city ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.city && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          Region <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                            errors.region ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.region && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.region}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                            errors.postalCode ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.postalCode && <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <h2 className="text-base md:text-lg lg:text-xl font-light tracking-wide mb-4 md:mb-6">DELIVERY METHOD</h2>
                  <div className="space-y-2 md:space-y-3">
                    {DELIVERY_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-3 md:p-4 border-2 cursor-pointer transition-all touch-manipulation ${
                          deliveryMethod === option.id
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <input
                            type="radio"
                            name="delivery"
                            value={option.id}
                            checked={deliveryMethod === option.id}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-light text-xs md:text-sm">{option.name}</p>
                            <p className={`text-[10px] md:text-xs ${deliveryMethod === option.id ? "text-gray-300" : "text-gray-500"}`}>
                              {option.days}
                            </p>
                          </div>
                        </div>
                        <span className="font-light text-xs md:text-sm whitespace-nowrap ml-2">{formatCurrency(option.cost)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-base md:text-lg lg:text-xl font-light tracking-wide mb-4 md:mb-6">PAYMENT METHOD</h2>
                  <PaymentMethodSelector selectedMethod={paymentMethod} onMethodChange={setPaymentMethod} />

                  {paymentMethod === "mobile_money" && (
                    <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          Mobile Money Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={mobileMoneyPhone}
                          onChange={(e) => setMobileMoneyPhone(e.target.value)}
                          placeholder="0244123456"
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border text-xs md:text-sm focus:outline-none focus:border-black transition-colors ${
                            errors.mobileMoneyPhone ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                        {errors.mobileMoneyPhone && (
                          <p className="text-[10px] md:text-xs text-red-500 mt-1">{errors.mobileMoneyPhone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                          Provider <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={mobileMoneyProvider}
                          onChange={(e) => setMobileMoneyProvider(e.target.value)}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 text-xs md:text-sm focus:outline-none focus:border-black transition-colors"
                        >
                          <option value="mtn">MTN Mobile Money</option>
                          <option value="vodafone">Vodafone Cash</option>
                          <option value="airteltigo">AirtelTigo Money</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 md:top-8 border border-gray-200 p-4 md:p-6 lg:p-8 bg-white">
                  <h2 className="text-base md:text-lg lg:text-xl font-light tracking-wide mb-4 md:mb-6">ORDER SUMMARY</h2>

                  {/* Cart Items */}
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-48 md:max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-2 md:gap-3 text-xs md:text-sm">
                        <div className="relative w-12 h-12 md:w-16 md:h-16 bg-white border border-gray-200 flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-light truncate text-xs md:text-sm">{item.name}</p>
                          <p className="text-[10px] md:text-xs text-gray-600">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
                    <label className="block text-[10px] md:text-xs tracking-widest uppercase font-light mb-1.5 md:mb-2">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoApplied(false);
                          setPromoDiscount(0);
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-3 md:px-4 py-2 border border-gray-300 text-xs md:text-sm focus:outline-none focus:border-black transition-colors"
                        disabled={promoApplied}
                      />
                      {!promoApplied ? (
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={loading || !promoCode.trim()}
                          className="px-3 md:px-4 py-2 border border-gray-300 text-[10px] md:text-xs tracking-widest uppercase font-light hover:border-black transition-colors disabled:opacity-50 touch-manipulation"
                        >
                          Apply
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPromoCode("");
                            setPromoApplied(false);
                            setPromoDiscount(0);
                            setPromoError("");
                          }}
                          className="px-3 md:px-4 py-2 border border-gray-300 text-[10px] md:text-xs tracking-widest uppercase font-light hover:border-black transition-colors touch-manipulation"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {promoError && <p className="text-[10px] md:text-xs text-red-500 mt-1">{promoError}</p>}
                    {promoApplied && (
                      <p className="text-[10px] md:text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={10} className="md:w-3 md:h-3" /> Promo code applied
                      </p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="font-light text-gray-600">Subtotal</span>
                      <span className="font-light">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="font-light text-gray-600">Shipping</span>
                      <span className="font-light">{formatCurrency(shippingCost)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-green-600">
                        <span className="font-light">Discount</span>
                        <span className="font-light">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-3 md:pt-4 mb-4 md:mb-6">
                    <div className="flex justify-between">
                      <span className="font-light text-sm md:text-base">Total</span>
                      <span className="font-light text-sm md:text-base">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-outline mb-4 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm py-2.5 md:py-3 touch-manipulation"
                  >
                    {loading
                      ? "Processing..."
                      : paymentMethod === "card"
                      ? "Pay with Card"
                      : "Pay with Mobile Money"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

