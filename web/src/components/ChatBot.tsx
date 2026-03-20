"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Package,
  Store,
  ChevronRight,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ChatProduct {
  id: string;
  name: string;
  name_th: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  total_stock: number;
  branch_count: number;
  promotions: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
}

function ChatProductCard({ product }: { product: ChatProduct }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/search?q=${encodeURIComponent(product.name_th)}&product=${product.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left rounded-xl bg-gray-50 border border-gray-100 p-3 transition-all hover:bg-gray-100 active:bg-gray-200 group"
    >
      <div className="flex gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-white overflow-hidden border border-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_th}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`flex h-full w-full items-center justify-center absolute inset-0 ${product.image_url ? "hidden" : ""}`}
          >
            <Package className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {product.name_th}
            </h4>
            <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
              {formatPrice(product.price)}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">{product.name}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Store className="h-3 w-3" />
              <span>{product.branch_count} สาขา</span>
            </div>
            <span className="text-gray-300">|</span>
            <span>{product.total_stock} ชิ้น</span>
          </div>
          {product.promotions.length > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 rounded-full px-2 py-0.5">
                <Sparkles className="h-2.5 w-2.5" />
                {product.promotions[0]}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 self-center text-gray-300 group-hover:text-gray-400 transition-colors" />
      </div>
    </button>
  );
}

const QUICK_PROMPTS = [
  "แนะนำเครื่องดื่มเย็นๆ",
  "มีอะไรกินบ้าง?",
  "สินค้าลดราคา",
  "ของว่างทานเล่น",
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        products: data.products,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
          aria-label="เปิดแชทบอท"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:bottom-6 sm:right-6 sm:w-[400px] flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden h-[100dvh] sm:h-[600px] sm:max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  TwoDirect Assistant
                </h3>
                <p className="text-[11px] text-gray-400">
                  ผู้ช่วยแนะนำสินค้า
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  สวัสดี! ต้องการหาอะไร?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  บอกมาได้เลย จะแนะนำสินค้าให้
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {msg.products.map((product) => (
                        <ChatProductCard
                          key={product.id}
                          product={product}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 mt-0.5">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-100 px-4 py-3 bg-white"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                disabled={loading}
                className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-all hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
