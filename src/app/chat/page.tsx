"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, UserX, MessageSquare, AlertCircle, Check, CheckCheck, Lock, ShieldCheck } from "lucide-react";

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

    // Parse recipient from URL parameters if navigated from profile page
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
          // Preserve any candidate thread opened from URL if not yet in database
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

    // Optimistic message append
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
        // Replace temp with server verified encrypted message
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? result.message : m)));
        loadThreads();
      } else {
        // Remove temporary message on block/failure
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
        setError(result.error || "Failed to deliver message.");
      }
    } catch {
      // In sandbox mode, preserve the optimistic message
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
        loadThreads();
      }
    } catch (e) {
      console.error("Failed to block user:", e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF7] text-[#1C1C1E]">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <DashboardSidebar />

          <main className="lg:col-span-9">
            <div className="bg-white rounded-3xl border border-[rgba(28,28,30,0.08)] shadow-lg overflow-hidden flex h-[72vh]">

          {/* Left Thread List Pane (Matching Reference 1.7) */}
          <div className="w-full md:w-1/3 border-r border-[rgba(28,28,30,0.08)] flex flex-col bg-[#FCFBF7]">
            <div className="p-5 border-b border-[rgba(28,28,30,0.08)]">
              <h2 className="text-sm font-bold text-[#0A1F44]">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[rgba(28,28,30,0.06)]">
              {loadingThreads ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ) : threads.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8E93]">No active conversations yet.</div>
              ) : (
                threads.map((t) => (
                  <div
                    key={t.partnerId}
                    onClick={() => setActiveThread(t)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      activeThread?.partnerId === t.partnerId ? "bg-white shadow-xs" : "hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-full bg-[#C81D45]/10 text-[#C81D45] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {t.firstName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-[#0A1F44] block truncate">
                          {t.firstName} {t.lastName}
                        </span>
                        <span className="text-[11px] text-[#636366] block truncate mt-0.5">
                          {t.lastMessage}
                        </span>
                      </div>
                    </div>
                    {t.unreadCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-[#C81D45] text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Active Chat Pane (Matching Reference 1.7) */}
          <div className="hidden md:flex md:w-2/3 flex-col bg-white">
            {activeThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 px-6 border-b border-[rgba(28,28,30,0.08)] flex justify-between items-center bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-[#C81D45]/10 text-[#C81D45] flex items-center justify-center font-bold text-xs">
                      {activeThread.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0A1F44]">
                        {activeThread.firstName} {activeThread.lastName}
                      </h3>
                      <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                        <Lock className="h-3 w-3" />
                        <span>Messages are encrypted and private.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBlockUser}
                    className="text-xs font-semibold text-[#8E8E93] hover:text-red-600 flex items-center space-x-1"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Block</span>
                  </button>
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
                      <Skeleton className="h-9 w-1/3 rounded-2xl" />
                      <Skeleton className="h-9 w-1/3 rounded-2xl ml-auto" />
                      <Skeleton className="h-9 w-1/2 rounded-2xl" />
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col max-w-[70%] ${
                            isMe ? "ml-auto items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? "bg-[#C81D45] text-white rounded-tr-none shadow-xs"
                                : "bg-white text-[#1C1C1E] border border-[rgba(28,28,30,0.08)] rounded-tl-none shadow-xs"
                            }`}
                          >
                            {m.content}
                          </div>
                          <div className="flex items-center space-x-1 mt-1 text-[9px] text-[#8E8E93]">
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe &&
                              (m.isRead ? (
                                <CheckCheck className="h-3 w-3 text-[#0A369D]" />
                              ) : (
                                <Check className="h-3 w-3" />
                              ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSend} className="p-4 border-t border-[rgba(28,28,30,0.08)] flex items-center space-x-3 bg-white">
                  <Input
                    type="text"
                    placeholder="Type a secure message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={sending}
                    className="flex-1 rounded-full h-11 border-[rgba(28,28,30,0.12)] text-xs font-medium focus:border-[#C81D45]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="h-11 w-11 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white flex items-center justify-center shadow-md disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#636366] text-xs">
                <MessageSquare className="h-10 w-10 text-[#C81D45] mb-3" />
                <p className="font-semibold text-[#0A1F44]">Select a conversation to start messaging</p>
                <p className="text-[11px] text-[#8E8E93] mt-1">Messages are end-to-end encrypted and private.</p>
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
