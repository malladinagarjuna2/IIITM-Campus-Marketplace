"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Buyer {
  _id: string;
  displayName: string;
  hostelBlock?: string;
}

interface Demand {
  _id: string;
  title: string;
  description?: string;
  category: string;
  budgetRange?: string;
  responseCount: number;
  buyer: Buyer;
  createdAt: string;
  expiresAt: string;
}

export default function DemandCard({ demand }: { demand: Demand }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(demand.expiresAt).getTime() - Date.now()) / 86400000));

  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{demand.title}</h3>
          <Badge variant="outline" className="shrink-0 text-xs capitalize">{demand.category}</Badge>
        </div>
        {demand.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{demand.description}</p>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--navy)]">{demand.budgetRange || "Flexible"}</span>
          <span className="text-muted-foreground">{daysLeft}d left</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{demand.buyer.displayName}</span>
          <div className="flex items-center gap-2">
            {demand.buyer.hostelBlock && (
              <span className="bg-muted px-1.5 py-0.5 rounded">{demand.buyer.hostelBlock}</span>
            )}
            {demand.responseCount > 0 && (
              <span className="text-[var(--gold-dark)] font-medium">{demand.responseCount} responses</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
