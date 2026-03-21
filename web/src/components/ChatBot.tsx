"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Package,
  Trash2,
  Store,
  ChevronRight,
  ChevronLeft,
  Bot,
  User,
  Sparkles,
  Plus,
  History,
  MessageSquare,
  LogIn,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";

// ---- Types ----

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

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// ---- Storage helpers ----

const STORAGE_PREFIX = "twodirect_sessions_";
const BOT_NAME = "NongDaiDai";

function getStorageKey(userId: string | null): string {
  return `${STORAGE_PREFIX}${userId || "guest"}`;
}

function loadSessions(userId: string | null): ChatSession[] {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSessions(userId: string | null, sessions: ChatSession[]) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(sessions));
  } catch {}
}

function createSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "แชทใหม่",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---- Product Card ----

function ChatProductCard({ product }: { product: ChatProduct }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `/search?q=${encodeURIComponent(product.name_th)}&product=${product.id}`
    );
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

// ---- Constants ----

const QUICK_PROMPTS = [
  "แนะนำเครื่องดื่มเย็นๆ",
  "มีอะไรกินบ้าง?",
  "สาขาใกล้ฉัน",
  "สินค้าลดราคา",
];

// ---- Main Component ----

type ChatView = "chat" | "sessions";

export function ChatBot() {
  const { user, signInWithGoogle } = useAuth();
  const userId = user?.id ?? null;
  const { activeLocation } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>("chat");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // ---- Persistence ----

  // Load sessions when user changes
  useEffect(() => {
    const loaded = loadSessions(userId);
    setSessions(loaded);
    // Set active to most recent, or create new
    if (loaded.length > 0) {
      setActiveSessionId(loaded[0].id);
    } else {
      const newSession = createSession();
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
    setInitialized(true);
    setView("chat");
  }, [userId]);

  // Save sessions whenever they change
  useEffect(() => {
    if (initialized) {
      saveSessions(userId, sessions);
    }
  }, [sessions, initialized, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen && view === "chat" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, view]);

  // ---- Session actions ----

  const updateActiveSession = useCallback(
    (updater: (session: ChatSession) => ChatSession) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? updater(s) : s))
      );
    },
    [activeSessionId]
  );

  const handleNewChat = () => {
    // If current session is empty, just switch to it
    if (activeSession && activeSession.messages.length === 0) {
      setView("chat");
      return;
    }
    const newSession = createSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setView("chat");
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setView("chat");
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      // If deleting active session, switch to another or create new
      if (sessionId === activeSessionId) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          const newSession = createSession();
          filtered.push(newSession);
          setActiveSessionId(newSession.id);
        }
      }
      return filtered;
    });
  };

  // ---- Send message ----

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];

    // Update session with new message + title
    updateActiveSession((s) => ({
      ...s,
      messages: newMessages,
      title: s.messages.length === 0 ? text.trim().slice(0, 30) + (text.trim().length > 30 ? "..." : "") : s.title,
      updatedAt: Date.now(),
    }));

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
          lat: activeLocation.lat,
          lng: activeLocation.lng,
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        products: data.products,
      };

      updateActiveSession((s) => ({
        ...s,
        messages: [...newMessages, assistantMessage],
        updatedAt: Date.now(),
      }));
    } catch {
      updateActiveSession((s) => ({
        ...s,
        messages: [
          ...newMessages,
          {
            role: "assistant" as const,
            content: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
          },
        ],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ---- Time formatting ----

  const formatTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "เมื่อสักครู่";
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} วันที่แล้ว`;
    return new Date(ts).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  };

  // ---- Render ----

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
              {view === "sessions" ? (
                <button
                  onClick={() => setView("chat")}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {view === "sessions" ? "ประวัติแชท" : BOT_NAME}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {view === "sessions"
                    ? `${sessions.length} การสนทนา`
                    : "ผู้ช่วยแนะนำสินค้า TwoDirect"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {view === "chat" && (
                <>
                  <button
                    onClick={handleNewChat}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    title="แชทใหม่"
                  >
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setView("sessions")}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    title="ประวัติแชท"
                  >
                    <History className="h-4 w-4 text-gray-400" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* ---- Login Required View ---- */}
          {!user && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <LogIn className="h-7 w-7 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                กรุณาเข้าสู่ระบบ
              </h4>
              <p className="text-sm text-gray-500 text-center mb-6">
                เข้าสู่ระบบเพื่อเริ่มแชทกับ {BOT_NAME}
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                เข้าสู่ระบบด้วย Google
              </button>
            </div>
          )}

          {/* ---- Sessions List View ---- */}
          {user && view === "sessions" && (
            <div className="flex-1 overflow-y-auto">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 flex-shrink-0">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    เริ่มแชทใหม่
                  </p>
                  <p className="text-xs text-gray-500">
                    สร้างการสนทนาใหม่กับ{BOT_NAME}
                  </p>
                </div>
              </button>

              {/* Session List */}
              {sessions
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors group cursor-pointer ${
                      session.id === activeSessionId
                        ? "bg-gray-50"
                        : ""
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                        session.id === activeSessionId
                          ? "bg-gray-900"
                          : "bg-gray-100"
                      }`}
                    >
                      <MessageSquare
                        className={`h-4 w-4 ${
                          session.id === activeSessionId
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.messages.length} ข้อความ &middot;{" "}
                        {formatTime(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
                      title="ลบแชท"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  </div>
                ))}

              {sessions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ยังไม่มีประวัติแชท</p>
                </div>
              )}
            </div>
          )}

          {/* ---- Chat View ---- */}
          {user && view === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      สวัสดี! {BOT_NAME}เองค่ะ
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      บอกมาได้เลย จะแนะนำสินค้าให้ค่ะ
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
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
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
            </>
          )}
        </div>
      )}
    </>
  );
}
