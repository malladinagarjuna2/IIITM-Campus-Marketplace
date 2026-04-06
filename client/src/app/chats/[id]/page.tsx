"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Send, Zap, CheckCircle, XCircle, CreditCard
} from "lucide-react";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [chat, setChat] = useState<any>(null);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showNegotiatePrompt, setShowNegotiatePrompt] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async (silent = false) => {
    try {
      const data = await api<any>(`/chats/${id}`, { token });
      setChat(data.chat);
      setRole(data.role);
      setQuickReplies(data.quickReplies || []);
    } catch (err: unknown) {
      if (!silent) {
        toast.error(err instanceof Error ? err.message : "Failed to load chat");
        router.push("/chats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/login"); return; }
    fetchChat();

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => fetchChat(true), 3000);
    return () => clearInterval(interval);
  }, [id, isLoading, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const sendMessage = async (content: string, type: "text" | "quick-reply" = "text") => {
    if (!content.trim()) return;
    setSendingMsg(true);
    try {
      await api<any>(`/chats/${id}/message`, {
        method: "POST",
        body: { content, type },
        token,
      });
      setText("");
      await fetchChat();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSendingMsg(false);
    }
  };

  const startNegotiation = async () => {
    try {
      await api<any>(`/chats/${id}/negotiate`, { method: "POST", token });
      setShowNegotiatePrompt(false);
      toast.success("Negotiation started! You have 3 bargaining cards.");
      await fetchChat();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start negotiation");
    }
  };

  const submitOffer = async () => {
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid offer amount"); return; }
    try {
      await api<any>(`/chats/${id}/offer`, {
        method: "POST",
        body: { amount },
        token,
      });
      setOfferAmount("");
      await fetchChat();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit offer");
    }
  };

  const respondToOffer = async (accepted: boolean) => {
    try {
      await api<any>(`/chats/${id}/respond`, {
        method: "POST",
        body: { accepted },
        token,
      });
      if (accepted) toast.success("Deal accepted!");
      await fetchChat();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to respond");
    }
  };

  const createTransaction = async () => {
    try {
      const data = await api<any>("/transactions", {
        method: "POST",
        body: { chatId: id },
        token,
      });
      setTransactionId(data.transaction._id);
      toast.success("Transaction created!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create transaction");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!chat) return null;

  const other = role === "buyer" ? chat.seller : chat.buyer;
  const neg = chat.negotiation;
  const isNegActive = chat.isNegotiationActive;
  const lastOffer = neg?.offers?.[neg.offers.length - 1];
  const hasPendingOffer = lastOffer?.status === "pending";
  const cardsRemaining = neg ? neg.maxRounds - neg.offers.length : 3;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/chats">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="w-9 h-9 rounded-full bg-[var(--navy)] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {other.displayName[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{other.displayName}</div>
            <div className="text-xs text-muted-foreground">{chat.listing?.title}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[var(--navy)]">₹{chat.listing?.price?.toLocaleString()}</div>
            {chat.mode === "negotiation" && (
              <Badge className="bg-[var(--gold)] text-[var(--navy-dark)] text-[10px]">Negotiating</Badge>
            )}
          </div>
        </div>

        {/* Negotiation status bar */}
        {chat.mode === "negotiation" && neg && (
          <Card className={`border-2 ${neg.outcome === "accepted" ? "border-green-400 bg-green-50" : neg.outcome === "rejected" ? "border-red-300 bg-red-50" : "border-[var(--gold)] bg-amber-50"}`}>
            <CardContent className="p-3">
              {neg.outcome === "accepted" ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-sm text-green-800">Deal accepted at ₹{neg.agreedPrice?.toLocaleString()}!</div>
                    {!transactionId && role === "buyer" && (
                      <Button size="sm" onClick={createTransaction} className="mt-2 bg-green-600 hover:bg-green-700 text-white gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> Proceed to confirm deal
                      </Button>
                    )}
                    {transactionId && (
                      <Link href={`/transactions/${transactionId}`}>
                        <Button size="sm" variant="outline" className="mt-2 gap-1.5 text-green-700 border-green-400">
                          View Transaction →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : neg.outcome === "rejected" ? (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="text-sm text-red-700 font-medium">Negotiation ended — all cards used.</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-800">BARGAINING IN PROGRESS</span>
                    <span className="text-xs text-amber-700">{cardsRemaining} card{cardsRemaining !== 1 ? "s" : ""} left</span>
                  </div>
                  {/* Cards visual */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full transition-colors ${i < cardsRemaining ? "bg-[var(--gold)]" : "bg-amber-200"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-[50vh] pr-1">
          {chat.messages.map((msg: any) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={msg._id} className="flex justify-center">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">{msg.content}</span>
                </div>
              );
            }

            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm
                  ${msg.type === "offer"
                    ? "bg-[var(--navy)] text-white font-medium"
                    : isMe
                      ? "bg-[var(--navy)] text-white"
                      : "bg-white border border-border text-foreground"
                  }`}
                >
                  {msg.type === "offer" && <div className="text-[10px] text-white/70 mb-0.5 uppercase tracking-wide">Offer</div>}
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Pending offer — seller response */}
        {role === "seller" && isNegActive && hasPendingOffer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="text-sm font-semibold text-amber-800">
              Buyer offered ₹{lastOffer.amount.toLocaleString()} (Round {lastOffer.round}/3)
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => respondToOffer(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5">
                <CheckCircle className="w-4 h-4" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => respondToOffer(false)} className="flex-1 text-red-600 border-red-300 hover:bg-red-50 gap-1.5">
                <XCircle className="w-4 h-4" /> Reject
              </Button>
            </div>
          </div>
        )}

        {/* Buyer negotiation actions */}
        {role === "buyer" && chat.status === "active" && (
          <>
            {chat.mode === "normal" && !showNegotiatePrompt && (
              <button
                onClick={() => setShowNegotiatePrompt(true)}
                className="text-xs text-[var(--navy)] hover:underline flex items-center gap-1 w-fit"
              >
                <Zap className="w-3 h-3" /> Start negotiation (3 bargaining cards)
              </button>
            )}
            {showNegotiatePrompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                <div className="text-sm font-semibold text-blue-800">Start Negotiation?</div>
                <p className="text-xs text-blue-600">You get 3 rounds to make offers. Seller must respond to each.</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={startNegotiation} className="bg-[var(--navy)] text-white">Yes, start!</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowNegotiatePrompt(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {isNegActive && !hasPendingOffer && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Your offer (₹)"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="flex-1"
                  min={1}
                />
                <Button
                  onClick={submitOffer}
                  disabled={cardsRemaining === 0}
                  className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy-dark)] font-semibold shrink-0"
                >
                  Send Offer ({cardsRemaining} left)
                </Button>
              </div>
            )}
          </>
        )}

        {/* Quick replies */}
        {chat.status === "active" && quickReplies.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickReplies.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr, "quick-reply")}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white transition-colors whitespace-nowrap"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Text input */}
        {chat.status === "active" && (
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(text); }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1"
              disabled={sendingMsg}
            />
            <Button
              type="submit"
              disabled={!text.trim() || sendingMsg}
              className="bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {chat.status === "failed" && (
          <div className="text-center text-sm text-muted-foreground py-2">
            Negotiation ended. This chat is closed.
          </div>
        )}
      </div>
    </div>
  );
}
