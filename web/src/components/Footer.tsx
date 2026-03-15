"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              src="/logo_twodirect.png"
              alt="TwoDirect"
              className="h-8 w-auto brightness-0 invert"
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              ค้นหาสินค้า ตรงไปหยิบ - แพลตฟอร์มค้นหาสินค้าในร้านสะดวกซื้อใกล้คุณ ประหยัดเวลา ไม่พลาดสินค้าที่ต้องการ
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">เมนูหลัก</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm hover:text-white transition-colors">
                  ค้นหาสินค้า
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-sm hover:text-white transition-colors">
                  รายการจอง
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm hover:text-white transition-colors">
                  บัญชีของฉัน
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-sm hover:text-white transition-colors">
                  ศูนย์ช่วยเหลือ
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm hover:text-white transition-colors">
                  วิธีใช้งาน
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:text-white transition-colors">
                  คำถามที่พบบ่อย
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  ข้อกำหนดการใช้งาน
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@twodirect.com" className="text-sm hover:text-white transition-colors">
                  support@twodirect.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+6621234567" className="text-sm hover:text-white transition-colors">
                  02-123-4567
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  123 ถนนสุขุมวิท<br />
                  กรุงเทพมหานคร 10110
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} TwoDirect. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                ข้อกำหนด
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                ความเป็นส่วนตัว
              </Link>
              <Link href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                คุกกี้
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

