"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { CheckCircle, Package, Mail, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/app/lib/currency";

interface OrderDetails {
  orderNumber: string;
  totalAmount: number;
  email: string;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const reference = searchParams.get("reference");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId && !reference) {
      setError("No order ID or reference provided");
      setLoading(false);
      return;
    }

    // If we have a Paystack reference, verify payment first
    if (reference) {
      fetch(`/api/checkout/verify?reference=${reference}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid) {
            fetchOrderDetails();
          } else {
            setError("Payment verification failed");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Verification error:", err);
          // Still try to fetch order details
          fetchOrderDetails();
        });
    } else {
      fetchOrderDetails();
    }
  }, [orderId, reference]);

  const fetchOrderDetails = async () => {
    if (!orderId && !reference) return;

    try {
      const url = orderId 
        ? `/api/orders/${orderId}`
        : `/api/checkout/verify?reference=${reference}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      const data = await response.json();
      // If we got data from verify endpoint, fetch full order details
      if (data.orderId && !orderId) {
        const orderResponse = await fetch(`/api/orders/${data.orderId}`);
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrder(orderData);
        } else {
          setOrder(data);
        }
      } else {
        setOrder(data);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen">
        <Navbar />
        <section className="w-full min-h-[60vh] flex items-center justify-center py-20 px-6">
          <div className="text-center">
            <p className="text-sm font-light text-gray-600">Loading order details...</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="w-full min-h-screen">
        <Navbar />
        <section className="w-full min-h-[60vh] flex items-center justify-center py-20 px-6">
          <div className="text-center max-w-md">
            <XCircle size={64} className="mx-auto mb-8 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-light tracking-widest uppercase mb-4">Order Error</h1>
            <p className="text-sm font-light text-gray-600 mb-8">
              {error || "Unable to load order details. Please contact support if you have completed payment."}
            </p>
            <Link href="/account" className="inline-block btn-outline">
              View Orders
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <section className="w-full py-12 md:py-20 px-4 md:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <CheckCircle size={64} className="mx-auto mb-6 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-light tracking-widest uppercase mb-4">Order Confirmed</h1>
            <p className="text-sm font-light text-gray-600 mb-2">
              Thank you for your purchase! Your order has been received and is being processed.
            </p>
            <p className="text-xs font-light text-gray-500">Order Number: {order.orderNumber}</p>
          </motion.div>

          <div className="border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Package size={20} className="text-gray-600" />
              <h2 className="text-lg font-light tracking-wide">Order Details</h2>
            </div>

            <div className="space-y-4 mb-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-3">
                  <div>
                    <p className="font-light">{item.productName}</p>
                    <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-light">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-light text-gray-600">Total</span>
                <span className="text-lg font-light">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={20} className="text-gray-600" />
              <h2 className="text-lg font-light tracking-wide">What's Next?</h2>
            </div>
            <div className="space-y-3 text-sm font-light text-gray-700">
              <p>• A confirmation email has been sent to <strong>{order.email}</strong></p>
              <p>• You will receive shipping updates via email</p>
              <p>• Order status: <strong className="uppercase">{order.status}</strong></p>
              <p>• For any questions, please contact our customer service</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-outline text-center">
              Continue Shopping
            </Link>
            <Link href="/account" className="btn-outline text-center">
              View My Orders
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

