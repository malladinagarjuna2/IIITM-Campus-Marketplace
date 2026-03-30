"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export default function ChatsListPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    api<any>("/chats", { token })
      .then((d) => setChats(d.chats))
      .catch(() => toast.error("Failed to load chats"))
      .finally(() => setLoading(false));
  }, [user, token]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-[var(--navy)] mb-4">My Chats</h1>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No chats yet. Browse listings to start chatting!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const other = user._id === chat.buyer._id ? chat.seller : chat.buyer;
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <Link key={chat._id} href={`/chats/${chat._id}`}>
                  <div className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[var(--navy)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {other.displayName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{other.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(chat.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{chat.listing?.title}</p>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{lastMsg.content}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {chat.mode === "negotiation" && (
                        <Badge className="bg-[var(--gold)] text-[var(--navy-dark)] text-[10px]">Negotiating</Badge>
                      )}
                      {chat.status === "completed" && (
                        <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">Deal ✓</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
