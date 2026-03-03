"use client";

import { useState } from "react";
import { X, Clock, MapPin, AlertTriangle, ShoppingBag, Check } from "lucide-react";
import { Product, Branch } from "@/types";
import { useReservations, Reservation } from "@/hooks/useReservations";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  branch: Branch;
  quantity: number;
  pickupHours?: number;
}

export function ReservationModal({
  isOpen,
  onClose,
  product,
  branch,
  quantity,
  pickupHours = 2,
}: ReservationModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const { addReservation } = useReservations();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      // Save reservation (works for both logged-in and guest users)
      const reservation = await addReservation({
        productId: product.id,
        productName: product.name,
        productNameTh: product.name_th,
        productPrice: product.price,
        productImage: product.image_url,
        branchId: branch.id,
        branchName: branch.name,
        branchNameTh: branch.name_th,
        branchAddress: branch.address_th,
        branchLat: branch.latitude,
        branchLng: branch.longitude,
        quantity: 1,
        pickupHours,
      });

      setConfirmedReservation(reservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setConfirmedReservation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {confirmedReservation ? "จองสำเร็จ" : "จองสินค้า"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {confirmedReservation ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">จองสินค้าสำเร็จ!</h3>
            <p className="text-gray-500 mb-6">
              กรุณาไปรับสินค้าที่สาขาภายใน {pickupHours} ชั่วโมง
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">สินค้า:</span> {product.name_th}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">สาขา:</span> {branch.name_th}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">รหัสจอง:</span> {confirmedReservation.code}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ปิด
              </button>
              <a
                href="/reservations"
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors text-center"
              >
                ดูรายการจอง
              </a>
            </div>
          </div>
        ) : (
          /* Reservation Form */
          <div className="p-4 sm:p-6">
            {/* Product Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name_th}</p>
                <p className="text-sm text-gray-500">{product.name}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">฿{product.price}</p>
              </div>
            </div>

            {/* Branch Info */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-4">
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{branch.name_th}</p>
                <p className="text-sm text-gray-500 mt-0.5">{branch.address_th}</p>
              </div>
            </div>

            {/* Pickup Time */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
              <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">รับสินค้าภายใน {pickupHours} ชั่วโมง</p>
                <p className="text-sm text-gray-500 mt-0.5">มีสินค้า {quantity} ชิ้น</p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">เงื่อนไขการจอง</p>
                <ul className="text-amber-700 mt-2 space-y-1">
                  <li>• ต้องมารับสินค้าที่หน้าสาขาด้วยตนเอง</li>
                  <li>• รับสินค้าภายใน {pickupHours} ชั่วโมง</li>
                  <li>• หากเกินเวลาที่กำหนด ไม่คืนเงินทุกกรณี</li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirming ? "กำลังจอง..." : "ยืนยันจอง"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

