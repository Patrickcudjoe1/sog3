"use client"

import { CreditCard, Smartphone } from "lucide-react"

export type PaymentMethod = "card" | "mobile_money"

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] md:text-xs tracking-widest uppercase font-light mb-3 md:mb-4">Select Payment Method</h3>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => onMethodChange("card")}
          className={`p-3 md:p-4 border-2 transition-all touch-manipulation ${
            selectedMethod === "card"
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <CreditCard size={20} className="mx-auto mb-1.5 md:mb-2 md:w-6 md:h-6" />
          <p className="text-[10px] md:text-xs tracking-widest uppercase font-light">Card</p>
          <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 md:mt-1">Paystack</p>
        </button>

        <button
          type="button"
          onClick={() => onMethodChange("mobile_money")}
          className={`p-3 md:p-4 border-2 transition-all touch-manipulation ${
            selectedMethod === "mobile_money"
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Smartphone size={20} className="mx-auto mb-1.5 md:mb-2 md:w-6 md:h-6" />
          <p className="text-[10px] md:text-xs tracking-widest uppercase font-light">Mobile Money</p>
          <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 md:mt-1">Paystack</p>
        </button>
      </div>
    </div>
  )
}

