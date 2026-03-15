"use client";

import { CreditCard, Smartphone, QrCode } from "lucide-react";
import { PaymentMethod } from "@/hooks/useReservations";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: "credit_card" as PaymentMethod,
    name: "บัตรเครดิต/เดบิต",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
  },
  {
    id: "promptpay" as PaymentMethod,
    name: "พร้อมเพย์",
    description: "สแกน QR Code",
    icon: QrCode,
  },
  {
    id: "mobile_banking" as PaymentMethod,
    name: "Mobile Banking",
    description: "ธนาคารชั้นนำ",
    icon: Smartphone,
  },
];

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 mb-3">เลือกวิธีชำระเงิน</h3>
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`p-3 rounded-xl ${isSelected ? "bg-gray-900" : "bg-gray-100"}`}>
              <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-gray-600"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">{method.name}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? "border-gray-900" : "border-gray-300"
            }`}>
              {isSelected && <div className="w-3 h-3 rounded-full bg-gray-900" />}
            </div>
          </button>
        );
      })}
      
      {/* Demo Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">หมายเหตุ:</span> นี่เป็นการจำลองการชำระเงินเท่านั้น ไม่มีการหักเงินจริง
        </p>
      </div>
    </div>
  );
}

