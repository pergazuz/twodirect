"use client";

import { QrCode, CheckCircle } from "lucide-react";

interface PromptPayFormProps {
  amount: number;
  onSubmit: (details: string) => void;
  onBack: () => void;
}

export function PromptPayForm({ amount, onSubmit, onBack }: PromptPayFormProps) {
  const handleConfirm = () => {
    onSubmit("PromptPay QR Code");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gray-900 rounded-xl">
          <QrCode className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">พร้อมเพย์</h3>
          <p className="text-sm text-gray-500">สแกน QR Code เพื่อชำระเงิน</p>
        </div>
      </div>

      {/* Mock QR Code */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
          <div className="text-center">
            <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Mock QR Code</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">ยอดชำระ</p>
          <p className="text-2xl font-bold text-gray-900">฿{amount.toFixed(2)}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">วิธีชำระเงิน</p>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. เปิดแอปธนาคารของคุณ</li>
          <li>2. เลือกเมนู "สแกน QR"</li>
          <li>3. สแกน QR Code ด้านบน</li>
          <li>4. ยืนยันการชำระเงิน</li>
        </ol>
      </div>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">หมายเหตุ:</span> นี่เป็น QR Code จำลอง ไม่สามารถชำระเงินจริงได้
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
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          ชำระเงินแล้ว
        </button>
      </div>
    </div>
  );
}

