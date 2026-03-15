"use client";

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

interface CreditCardFormProps {
  onSubmit: (details: string) => void;
  onBack: () => void;
}

export function CreditCardForm({ onSubmit, onBack }: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maskedCard = `**** **** **** ${cardNumber.slice(-4)}`;
    onSubmit(maskedCard);
  };

  const isValid = cardNumber.replace(/\s/g, "").length === 16 && 
                  cardName.length > 0 && 
                  expiry.length === 5 && 
                  cvv.length === 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gray-900 rounded-xl">
          <CreditCard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">บัตรเครดิต/เดบิต</h3>
          <p className="text-sm text-gray-500">กรอกข้อมูลบัตร</p>
        </div>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หมายเลขบัตร
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          maxLength={19}
        />
      </div>

      {/* Card Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อบนบัตร
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          placeholder="JOHN DOE"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent uppercase"
        />
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            วันหมดอายุ
          </label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
            placeholder="123"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            maxLength={3}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
        <Lock className="h-4 w-4 text-green-600 flex-shrink-0" />
        <p className="text-xs text-green-700">
          ข้อมูลของคุณได้รับการเข้ารหัสอย่างปลอดภัย
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ย้อนกลับ
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ชำระเงิน
        </button>
      </div>
    </form>
  );
}

