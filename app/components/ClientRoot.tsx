"use client";
import { CartProvider } from "./CartContext";
import { Toaster } from "sonner";
import React from "react";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="top-center" richColors />
    </CartProvider>
  );
}
