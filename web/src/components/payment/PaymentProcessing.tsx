"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

interface PaymentProcessingProps {
  onComplete: () => void;
}

export function PaymentProcessing({ onComplete }: PaymentProcessingProps) {
  const [status, setStatus] = useState<"processing" | "success">("processing");

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="py-8 text-center">
      {status === "processing" ? (
        <>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">กำลังดำเนินการ...</h3>
          <p className="text-gray-500">กรุณารอสักครู่</p>
        </>
      ) : (
        <>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ชำระเงินสำเร็จ!</h3>
          <p className="text-gray-500">กำลังสร้างรายการจอง...</p>
        </>
      )}
    </div>
  );
}

