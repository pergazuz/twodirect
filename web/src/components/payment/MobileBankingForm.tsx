"use client";

import { useState } from "react";
import { Smartphone, Building2 } from "lucide-react";

interface MobileBankingFormProps {
  amount: number;
  onSubmit: (details: string) => void;
  onBack: () => void;
}

const banks = [
  { id: "kbank", name: "ธนาคารกสิกรไทย", color: "bg-green-600" },
  { id: "scb", name: "ธนาคารไทยพาณิชย์", color: "bg-purple-600" },
  { id: "bbl", name: "ธนาคารกรุงเทพ", color: "bg-blue-600" },
  { id: "ktb", name: "ธนาคารกรุงไทย", color: "bg-sky-500" },
  { id: "bay", name: "ธนาคารกรุงศรีอยุธยา", color: "bg-yellow-500" },
  { id: "tmb", name: "ธนาคารทหารไทยธนชาต", color: "bg-orange-500" },
];

export function MobileBankingForm({ amount, onSubmit, onBack }: MobileBankingFormProps) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedBank) return;
    const bank = banks.find(b => b.id === selectedBank);
    onSubmit(bank?.name || "Mobile Banking");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gray-900 rounded-xl">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Mobile Banking</h3>
          <p className="text-sm text-gray-500">เลือกธนาคารของคุณ</p>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600 mb-1">ยอดชำระ</p>
        <p className="text-2xl font-bold text-gray-900">฿{amount.toFixed(2)}</p>
      </div>

      {/* Bank Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          เลือกธนาคาร
        </label>
        <div className="grid grid-cols-2 gap-3">
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedBank === bank.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-12 h-12 ${bank.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-gray-700 text-center font-medium">
                {bank.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">หมายเหตุ:</span> นี่เป็นการจำลองการชำระเงิน ไม่มีการหักเงินจริง
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
          type="button"
          onClick={handleSubmit}
          disabled={!selectedBank}
          className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ดำเนินการต่อ
        </button>
      </div>
    </div>
  );
}

