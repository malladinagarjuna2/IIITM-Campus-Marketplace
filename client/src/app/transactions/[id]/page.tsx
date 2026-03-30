"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star, AlertTriangle, ArrowLeft } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "pending-confirmation": "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  disputed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function TransactionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  const [transaction, setTransaction] = useState<any>(null);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [comment, setComment] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [showReturn, setShowReturn] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransaction = async () => {
    try {
      const data = await api<any>(`/transactions/${id}`, { token });
      setTransaction(data.transaction);
      setHasRated(data.hasRated);
    } catch {
      toast.error("Transaction not found");
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    fetchTransaction();
  }, [id, user]);

  const confirm = async () => {
    setActionLoading(true);
    try {
      await api<any>(`/transactions/${id}/confirm`, { method: "PUT", token });
      toast.success("Confirmation recorded!");
      await fetchTransaction();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setActionLoading(false);
    }
  };

  const complete = async () => {
    setActionLoading(true);
    try {
      await api<any>(`/transactions/${id}/complete`, { method: "PUT", token });
      toast.success("Trade completed! Rate your experience.");
      await fetchTransaction();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to complete");
    } finally {
      setActionLoading(false);
    }
  };

  const submitRating = async () => {
    if (!rating) { toast.error("Please select a star rating"); return; }
    setActionLoading(true);
    try {
      await api<any>(`/transactions/${id}/rate`, {
        method: "POST",
        body: { score: rating, comment },
        token,
      });
      toast.success("Rating submitted anonymously!");
      setHasRated(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setActionLoading(false);
    }
  };

  const requestReturn = async () => {
    if (!returnReason.trim()) { toast.error("Please provide a reason"); return; }
    setActionLoading(true);
    try {
      await api<any>(`/transactions/${id}/return`, {
        method: "PUT",
        body: { reason: returnReason },
        token,
      });
      toast.success("Return request submitted.");
      setShowReturn(false);
      await fetchTransaction();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to request return");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  const isBuyer = user?._id === transaction.buyer._id;
  const isSeller = user?._id === transaction.seller._id;
  const myConfirmed = isBuyer ? transaction.buyerConfirmed : transaction.sellerConfirmed;
  const otherConfirmed = isBuyer ? transaction.sellerConfirmed : transaction.buyerConfirmed;
  const other = isBuyer ? transaction.seller : transaction.buyer;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>

        {/* Transaction summary */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[var(--navy)] text-lg">Trade Summary</CardTitle>
              <Badge className={`text-xs capitalize ${STATUS_COLORS[transaction.status] || ""}`}>
                {transaction.status.replace("-", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transaction.listing && (
              <div className="flex items-center gap-3">
                {transaction.listing.images?.[0] && (
                  <img src={transaction.listing.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
                )}
                <div>
                  <div className="font-semibold text-sm">{transaction.listing.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{transaction.listing.category}</div>
                </div>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Agreed Price</div>
              <div className="font-bold text-[var(--navy)] text-right">₹{transaction.agreedPrice?.toLocaleString()}</div>
              <div className="text-muted-foreground">Payment</div>
              <div className="text-right capitalize">{transaction.paymentMethod}</div>
              <div className="text-muted-foreground">Trading with</div>
              <div className="text-right font-medium">{other.displayName}</div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation flow */}
        {(transaction.status === "pending-confirmation" || transaction.status === "confirmed") && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Confirmation</h3>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${myConfirmed ? "text-green-600" : "text-muted-foreground"}`}>
                  <CheckCircle2 className={`w-4 h-4 ${myConfirmed ? "fill-green-500 stroke-green-500" : ""}`} />
                  You {myConfirmed ? "confirmed" : "haven't confirmed yet"}
                </div>
                <div className={`flex items-center gap-2 text-sm ${otherConfirmed ? "text-green-600" : "text-muted-foreground"}`}>
                  <CheckCircle2 className={`w-4 h-4 ${otherConfirmed ? "fill-green-500 stroke-green-500" : ""}`} />
                  {other.displayName} {otherConfirmed ? "confirmed" : "hasn't confirmed yet"}
                </div>
              </div>
              {!myConfirmed && (
                <Button onClick={confirm} disabled={actionLoading} className="w-full bg-[var(--navy)] text-white">
                  {actionLoading ? "Confirming…" : "Confirm Handover"}
                </Button>
              )}
              {transaction.isFullyConfirmed && (
                <Button onClick={complete} disabled={actionLoading} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {actionLoading ? "Completing…" : "Mark Trade Complete"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        {transaction.status === "completed" && !hasRated && (
          <Card className="border-[var(--gold)] bg-amber-50">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm text-amber-900">Rate {other.displayName}</h3>
              <p className="text-xs text-amber-700">Your rating is anonymous — not tied to your identity.</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setRatingHover(s)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setRating(s)}
                    className="p-1"
                  >
                    <Star className={`w-7 h-7 transition-colors ${s <= (ratingHover || rating) ? "fill-amber-400 stroke-amber-400" : "stroke-gray-300"}`} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Optional comment (anonymous)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={submitRating} disabled={actionLoading || !rating} className="w-full bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy-dark)] font-semibold">
                {actionLoading ? "Submitting…" : "Submit Rating"}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasRated && transaction.status === "completed" && (
          <div className="text-center text-sm text-green-600 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Rating submitted!
          </div>
        )}

        {/* Return request (buyer only, within window) */}
        {isBuyer && transaction.status === "completed" && transaction.isReturnEligible && !transaction.returnPolicy?.returnRequested && (
          <div>
            {!showReturn ? (
              <button onClick={() => setShowReturn(true)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Request return
              </button>
            ) : (
              <Card className="border-red-200">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-red-700">Request Return</h3>
                  <p className="text-xs text-muted-foreground">
                    Return window closes {new Date(transaction.returnPolicy.deadline).toLocaleDateString()}.
                  </p>
                  <textarea
                    placeholder="Reason for return…"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={requestReturn} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white">Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowReturn(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
