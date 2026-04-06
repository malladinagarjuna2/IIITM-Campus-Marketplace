"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Package, ShoppingBag, Lock, Plus, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [tab, setTab] = useState<"listings" | "history">("listings");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    // Fetch my listings
    api<any>("/listings/my", { token })
      .then((d) => setMyListings(d.listings))
      .catch(() => toast.error("Failed to load your listings"))
      .finally(() => setLoadingListings(false));

    // Fetch trade history
    api<any>("/transactions/history", { token })
      .then((d) => setTradeHistory(d.transactions))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [isLoading, user, token]);

  if (isLoading || !user) return null;

  const initials = (user.showRealIdentity ? user.realName : user.anonymousNickname)
    .split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Profile card */}
        <Card className="bg-gradient-to-br from-[var(--navy)] to-[var(--navy-light)] text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 border-2 border-white/30">
                <AvatarFallback className="text-xl font-bold bg-[var(--gold)] text-[var(--navy-dark)]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.displayName}</h2>
                {user.showRealIdentity && (
                  <p className="text-white/60 text-sm">{user.anonymousNickname}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
                  {user.hostelBlock && <span>{user.hostelBlock}</span>}
                  <span>{user.totalTrades} trade{user.totalTrades !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Rating display */}
            <Separator className="bg-white/20 my-4" />
            {user.isRatingVisible && user.averageRating ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${s <= Math.round(user.averageRating!) ? "fill-[var(--gold)] stroke-[var(--gold)]" : "stroke-white/30"}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-lg">{user.averageRating}</span>
                <span className="text-white/60 text-sm">average rating</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Lock className="w-4 h-4" />
                <span>
                  Rating hidden —{" "}
                  {user.tradesUntilRatingVisible > 0
                    ? `complete ${user.tradesUntilRatingVisible} more trade${user.tradesUntilRatingVisible !== 1 ? "s" : ""} to unlock`
                    : "complete your first trade to unlock"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
          {(["listings", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                tab === t ? "bg-white shadow-sm text-[var(--navy)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "listings" ? "My Listings" : "Trade History"}
            </button>
          ))}
        </div>

        {/* My Listings */}
        {tab === "listings" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{myListings.length} listing{myListings.length !== 1 ? "s" : ""}</h3>
              <Link href="/listings/new">
                <Button size="sm" className="bg-[var(--navy)] text-white gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> New Listing
                </Button>
              </Link>
            </div>
            {loadingListings ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nothing listed yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myListings.map((listing) => (
                  <Link key={listing._id} href={`/listings/${listing._id}`}>
                    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{listing.title}</div>
                          <div className="text-sm font-bold text-[var(--navy)]">₹{listing.price?.toLocaleString()}</div>
                        </div>
                        <Badge
                          className={`capitalize text-xs shrink-0 ${
                            listing.status === "active" ? "bg-green-100 text-green-800" :
                            listing.status === "sold" ? "bg-gray-100 text-gray-600" :
                            "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {listing.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Trade History */}
        {tab === "history" && (
          <>
            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : tradeHistory.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No trades yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tradeHistory.map((tx) => {
                  const isBuyer = tx.buyer._id === user._id;
                  const other = isBuyer ? tx.seller : tx.buyer;
                  return (
                    <Link key={tx._id} href={`/transactions/${tx._id}`}>
                      <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                            {tx.listing?.images?.[0] ? (
                              <img src={tx.listing.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xl">📦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{tx.listing?.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {isBuyer ? "Bought from" : "Sold to"} {other.displayName}
                            </div>
                            <div className="text-sm font-bold text-[var(--navy)]">₹{tx.agreedPrice?.toLocaleString()}</div>
                          </div>
                          <Badge
                            className={`capitalize text-xs shrink-0 ${
                              tx.status === "completed" ? "bg-green-100 text-green-800" :
                              tx.status === "disputed" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {tx.status.replace("-", " ")}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
