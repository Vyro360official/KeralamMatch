"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, UserX, MessageSquare, AlertCircle, Check, CheckCheck, Lock, ChevronLeft, ShieldCheck } from "lucide-react";

interface Thread {
  partnerId: string;
  firstName: string;
  lastName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileChatActive, setMobileChatActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.isAuthenticated && data.user) {
          setCurrentUserId(data.user.id);
        }
      })
      .catch(console.error);

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const targetUserId = searchParams.get("userId") || searchParams.get("user");
      const targetName = searchParams.get("name") || "Candidate";

      if (targetUserId) {
        const parts = targetName.split(" ");
        const first = parts[0] || "Candidate";
        const last = parts.slice(1).join(" ") || "";

        const candidateThread: Thread = {
          partnerId: targetUserId,
          firstName: first,
          lastName: last,
          lastMessage: "Start a conversation...",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          unreadCount: 0,
        };

        setThreads((prev) => {
          const exists = prev.find((t) => t.partnerId === targetUserId);
          if (exists) return prev;
          return [candidateThread, ...prev];
        });

        setActiveThread(candidateThread);
        setMobileChatActive(true);
      }
    }
  }, []);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch("/api/chat/threads");
      const result = await res.json();
      if (result.success && result.threads && result.threads.length > 0) {
        setThreads((prev) => {
          const combined = [...result.threads];
          prev.forEach((t) => {
            if (!combined.some((c) => c.partnerId === t.partnerId)) {
              combined.push(t);
            }
          });
          return combined;
        });
      }
    } catch (e) {
      console.error("Failed to load chat threads:", e);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const loadMessages = useCallback(async (partnerId: string) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/messages?partnerId=${partnerId}`);
      const result = await res.json();
      if (result.success && result.messages) {
        setMessages(result.messages);
        await fetch("/api/chat/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId }),
        }).catch(() => {});
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!activeThread) return;
    loadMessages(activeThread.partnerId);
  }, [activeThread, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread || sending) return;
    setSending(true);
    setError(null);
    const textToSend = inputText.trim();
    setInputText("");

    const tempMsg: Message = {
      id: "msg-" + Date.now(),
      senderId: currentUserId || "usr-me",
      receiverId: activeThread.partnerId,
      content: textToSend,
      createdAt: new Date().toISOString(),
      isRead: false,
      readAt: null,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeThread.partnerId, content: textToSend }),
      });
      const result = await res.json();
      if (result.success && result.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? result.message : m)));
        loadThreads();
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
        setError(result.error || "Failed to deliver message.");
      }
    } catch {
      // Offline fallback preservation
    } finally {
      setSending(false);
    }
  };

  const handleBlockUser = async () => {
    if (!activeThread) return;
    if (!confirm("Block this user? You will no longer be able to message each other.")) return;
    try {
      const res = await fetch("/api/chat/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: activeThread.partnerId }),
      });
      const result = await res.json();
      if (result.success) {
        setActiveThread(null);
        setMobileChatActive(false);
        loadThreads();
      }
    } catch (e) {
      console.error("Failed to block user:", e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 mb-16 lg:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar />

          <main className="lg:col-span-9">
            <div className="bg-white rounded-3xl border border-[rgba(28,28,30,0.06)] shadow-sm overflow-hidden flex h-[72vh] relative">
              
              {/* Left Conversation Thread Panel */}
              <div className={`w-full lg:w-1/3 border-r border-[rgba(28,28,30,0.06)] flex flex-col bg-[#FCFBF7] ${
                mobileChatActive ? "hidden lg:flex" : "flex"
              }`}>
                <div className="p-5 border-b border-[rgba(28,28,30,0.06)] bg-white">
                  <h2 className="text-sm font-extrabold text-[#0A1F44]">Messages</h2>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {loadingThreads ? (
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-11 w-full rounded-xl" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8E8E93] font-medium">No active conversations yet.</div>
                  ) : (
                    threads.map((t) => {
                      const initial = t.firstName.charAt(0).toUpperCase();
                      const isSelected = activeThread?.partnerId === t.partnerId;
                      return (
                        <button
                          key={t.partnerId}
                          onClick={() => { setActiveThread(t); setMobileChatActive(true); }}
                          className={`w-full text-left p-4 flex items-center justify-between transition-colors ${
                            isSelected ? "bg-slate-50 border-r-2 border-[#C81D45]" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="h-9 w-9 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                              {initial}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-[#0A1F44] block truncate">
                                {t.firstName} {t.lastName}
                              </span>
                              <span className="text-[10px] text-[#636366] font-medium block truncate mt-0.5">
                                {t.lastMessage}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 flex-shrink-0 pl-2">
                            <span className="text-[9px] text-[#8E8E93] font-medium">{t.timestamp}</span>
                            {t.unreadCount > 0 && (
                              <span className="h-4.5 w-4.5 rounded-full bg-[#C81D45] text-white font-bold text-[9px] flex items-center justify-center">
                                {t.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right/Active Chat Panel */}
              <div className={`w-full lg:w-2/3 flex flex-col bg-white ${
                mobileChatActive ? "flex" : "hidden lg:flex"
              }`}>
                {activeThread ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center bg-white">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setMobileChatActive(false)}
                          className="lg:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-500 mr-1"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="h-9 w-9 rounded-full bg-[#FCE8EC] text-[#C81D45] flex items-center justify-center font-extrabold text-xs">
                          {activeThread.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="text-xs font-bold text-[#0A1F44]">
                              {activeThread.firstName} {activeThread.lastName}
                            </h3>
                            <span className="h-3.5 w-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[8px] font-bold">✓</span>
                          </div>
                          <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Active now</span>
                        </div>
                      </div>

                      <button
                        onClick={handleBlockUser}
                        className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center space-x-1.5 transition-colors"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Block</span>
                      </button>
                    </div>

                    {/* Security warning banner */}
                    <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-2 text-[10px] font-semibold text-slate-500">
                      <Lock className="h-3 w-3 text-slate-400" />
                      <span>Conversations are private. KeralamMatch implements strict security protocols.</span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FCFBF7]">
                      {error && (
                        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>{error}</span>
                        </div>
                      )}

                      {loadingMessages ? (
                        <div className="space-y-4">
                          <Skeleton className="h-9 w-1/3 rounded-xl" />
                          <Skeleton className="h-9 w-1/3 rounded-xl ml-auto" />
                        </div>
                      ) : (
                        messages.map((m) => {
                          const isMe = m.senderId === currentUserId;
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col max-w-[75%] ${
                                isMe ? "ml-auto items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`px-4 py-2 rounded-2xl text-xs leading-relaxed ${
                                  isMe
                                    ? "bg-[#C81D45] text-white rounded-tr-none shadow-2xs font-medium"
                                    : "bg-white text-[#1C1C1E] border border-[rgba(28,28,30,0.06)] rounded-tl-none shadow-2xs font-medium"
                                }`}
                              >
                                {m.content}
                              </div>
                              <div className="flex items-center space-x-1 mt-1 text-[9px] text-slate-400 font-medium">
                                <span>
                                  {new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isMe &&
                                  (m.isRead ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={scrollRef} />
                    </div>

                    {/* Message Composer */}
                    <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center space-x-3 bg-white">
                      <Input
                        type="text"
                        placeholder="Type a secure message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={sending}
                        className="flex-1 rounded-xl h-10 border-slate-200 text-xs font-medium focus:border-[#C81D45]"
                      />
                      <button
                        type="submit"
                        disabled={sending || !inputText.trim()}
                        className="h-10 w-10 rounded-xl bg-[#C81D45] hover:bg-[#A51436] text-white flex items-center justify-center shadow-sm disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#636366] text-xs bg-[#FCFBF7]">
                    <MessageSquare className="h-10 w-10 text-[#C81D45] mb-3" />
                    <p className="font-extrabold text-[#0A1F44]">Select a conversation to start messaging</p>
                    <p className="text-[10px] text-slate-400 mt-1">Keep conversations respectul and professional.</p>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
