"use client";

import { useState, useRef, useCallback } from "react";
import { Search, Camera, X, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onImageSearch?: (imageFile: File) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  onImageSearch,
  placeholder = "ค้นหาสินค้า...",
  className
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  const handleCameraClick = () => {
    setShowImageOptions(true);
  };

  const closeOptions = () => {
    setShowImageOptions(false);
  };

  const handleGallerySelect = () => {
    setShowImageOptions(false);
    fileInputRef.current?.click();
  };

  const handleTakePhoto = async () => {
    setShowImageOptions(false);

    // Check if we're on mobile - use native camera input
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Use native camera input on mobile
      cameraInputRef.current?.click();
    } else {
      // Use getUserMedia for desktop
      setShowCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง");
        setShowCamera(false);
      }
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview first, don't auto-process
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      // Store the file for later processing
      setCapturedFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);

    if (onImageSearch) {
      onImageSearch(file);
      // Keep showing loading state until parent handles it
      setTimeout(() => {
        setIsProcessing(false);
        setCapturedImage(null);
        setCapturedFile(null);
      }, 2000);
    } else {
      // Fallback: simulate image recognition with placeholder
      setTimeout(() => {
        setIsProcessing(false);
        onSearch("โค้ก");
        setCapturedImage(null);
        setCapturedFile(null);
      }, 1500);
    }
  };

  const handleConfirmCapture = async () => {
    if (!capturedImage) return;

    // If we have a captured file from mobile/gallery, use it directly
    if (capturedFile) {
      await processImage(capturedFile);
      return;
    }

    // Otherwise, convert data URL to File (for desktop camera capture)
    setIsProcessing(true);
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      await processImage(file);
    } catch {
      setIsProcessing(false);
      setCapturedImage(null);
    }
  };

  const handleCancelCapture = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setIsProcessing(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn("relative flex items-center", className)}>
          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-14 text-base transition-all placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0 shadow-sm"
          />

          {/* Search Icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-14 flex items-center"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-gray-300 hover:text-gray-500 transition-colors" strokeWidth={1.5} />
            </button>
          )}

          {/* Camera Button */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleCameraClick}
              className="rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="ค้นหาด้วยรูปภาพ"
              aria-label="Search with image"
            >
              <Camera className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </form>

      {/* Image Options Modal */}
      {showImageOptions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={closeOptions}>
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white p-5 pb-8 sm:rounded-3xl sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <h3 className="mb-5 text-center text-base font-medium text-gray-900">
              ค้นหาด้วยรูปภาพ
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleTakePhoto}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="rounded-xl bg-gray-900 p-3 text-white">
                  <Camera className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">ถ่ายรูป</p>
                  <p className="text-sm text-gray-400 mt-0.5">ใช้กล้องถ่ายภาพสินค้า</p>
                </div>
              </button>
              <button
                onClick={handleGallerySelect}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                  <Image className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">เลือกจากคลังภาพ</p>
                  <p className="text-sm text-gray-400 mt-0.5">เลือกรูปที่มีอยู่แล้ว</p>
                </div>
              </button>
            </div>
            <button
              onClick={closeOptions}
              className="mt-5 w-full rounded-2xl py-3.5 font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Camera View Modal (Desktop) */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative h-full w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-5">
              <button
                onClick={stopCamera}
                className="rounded-full bg-white/10 p-4 text-white backdrop-blur-md transition-colors hover:bg-white/20 min-h-[56px] min-w-[56px] flex items-center justify-center"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
              <button
                onClick={capturePhoto}
                className="rounded-full bg-white p-5 text-gray-900 transition-transform hover:scale-105 min-h-[72px] min-w-[72px] flex items-center justify-center"
              >
                <Camera className="h-7 w-7" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Captured Image Preview Modal */}
      {capturedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-h-[80vh] max-w-md w-full overflow-hidden rounded-3xl bg-white">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-h-[55vh] w-full object-contain bg-gray-50"
            />
            <div className="p-5">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" strokeWidth={1.5} />
                  <span className="text-gray-500">กำลังวิเคราะห์...</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelCapture}
                    className="flex-1 rounded-2xl py-3.5 font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleConfirmCapture}
                    className="flex-1 rounded-2xl bg-gray-900 py-3.5 font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    ค้นหา
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

