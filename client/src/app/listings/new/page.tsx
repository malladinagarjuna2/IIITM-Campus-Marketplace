"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, X } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["books", "electronics", "clothing", "furniture", "stationery", "sports", "accessories", "other"];
const CONDITIONS = [
  { value: "like-new", label: "Like New", desc: "Barely used, no defects" },
  { value: "good", label: "Good", desc: "Minor signs of use" },
  { value: "fair", label: "Fair", desc: "Noticeable wear, fully functional" },
  { value: "poor", label: "Poor", desc: "Heavy wear or minor defects" },
];

export default function NewListingPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [priceReferenceLink, setPriceReferenceLink] = useState("");
  const [listingType, setListingType] = useState<"sell" | "rent">("sell");
  const [rentalPricePerDay, setRentalPricePerDay] = useState("");
  const [rentalDeposit, setRentalDeposit] = useState("");
  const [rentalMaxDays, setRentalMaxDays] = useState("");
  const [rentalFrom, setRentalFrom] = useState("");
  const [rentalTo, setRentalTo] = useState("");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - images.length;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("At least 1 photo is required.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (!condition) {
      toast.error("Please select a condition.");
      return;
    }

    setLoading(true);
    try {
      const data = await api<any>("/listings", {
        method: "POST",
        body: {
          title,
          description,
          category,
          price: Number(price),
          condition,
          images,
          priceReferenceLink: priceReferenceLink || undefined,
          listingType,
          rentalDetails: listingType === "rent" ? {
            pricePerDay: Number(rentalPricePerDay),
            securityDeposit: Number(rentalDeposit) || 0,
            maxDurationDays: Number(rentalMaxDays) || undefined,
            availableFrom: rentalFrom || undefined,
            availableTo: rentalTo || undefined,
          } : undefined,
        },
        token,
      });
      toast.success("Listing published!");
      router.push(`/listings/${data.listing._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--navy)]">Create New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Listing type toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setListingType("sell")}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${listingType === "sell" ? "bg-[var(--navy)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  🏷️ Sell
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("rent")}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${listingType === "rent" ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  🔑 Rent
                </button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. MTech Algorithms Textbook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground text-right">{title.length}/120</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <textarea
                  id="description"
                  placeholder="Describe the item — edition, year, any damage, accessories included…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={2000}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
              </div>

              {/* Category + Price row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select onValueChange={(v: string | null) => { if (v) setCategory(v); }} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) <span className="text-destructive">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    placeholder="e.g. 350"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Rental details */}
              {listingType === "rent" && (
                <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <p className="text-sm font-semibold text-purple-800">Rental Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="rpd" className="text-xs">Price per Day (₹) <span className="text-destructive">*</span></Label>
                      <Input id="rpd" type="number" min={0} placeholder="e.g. 50" value={rentalPricePerDay} onChange={(e) => setRentalPricePerDay(e.target.value)} required={listingType === "rent"} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rdep" className="text-xs">Security Deposit (₹)</Label>
                      <Input id="rdep" type="number" min={0} placeholder="e.g. 200" value={rentalDeposit} onChange={(e) => setRentalDeposit(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rmax" className="text-xs">Max Duration (days)</Label>
                      <Input id="rmax" type="number" min={1} placeholder="e.g. 7" value={rentalMaxDays} onChange={(e) => setRentalMaxDays(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rfrom" className="text-xs">Available From</Label>
                      <Input id="rfrom" type="date" value={rentalFrom} onChange={(e) => setRentalFrom(e.target.value)} />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label htmlFor="rto" className="text-xs">Available To</Label>
                      <Input id="rto" type="date" value={rentalTo} onChange={(e) => setRentalTo(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Condition */}
              <div className="space-y-2">
                <Label>Condition <span className="text-destructive">*</span></Label>
                <RadioGroup value={condition} onValueChange={setCondition} className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((c) => (
                    <div
                      key={c.value}
                      className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors has-[:checked]:border-[var(--navy)] has-[:checked]:bg-blue-50`}
                    >
                      <RadioGroupItem value={c.value} id={`cond-${c.value}`} className="mt-0.5" />
                      <Label htmlFor={`cond-${c.value}`} className="cursor-pointer">
                        <div className="font-medium text-sm">{c.label}</div>
                        <div className="text-xs text-muted-foreground">{c.desc}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Photos <span className="text-destructive">*</span> <span className="font-normal text-muted-foreground">(1–5)</span></Label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--navy)] hover:bg-blue-50 transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="sr-only"
                        onChange={handleImageFiles}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Price reference link */}
              <div className="space-y-2">
                <Label htmlFor="refLink">Price Reference Link <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="refLink"
                  type="url"
                  placeholder="Amazon / Flipkart link for price comparison"
                  value={priceReferenceLink}
                  onChange={(e) => setPriceReferenceLink(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white font-semibold py-5"
              >
                {loading ? "Publishing…" : "Publish Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
