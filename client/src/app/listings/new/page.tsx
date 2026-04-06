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
import { ArrowLeft, Plus, X } from "lucide-react";
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
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [priceReferenceLink, setPriceReferenceLink] = useState("");

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const addImage = () => {
    if (images.length < 5) setImages([...images, ""]);
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const updateImage = (idx: number, val: string) => {
    const updated = [...images];
    updated[idx] = val;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = images.filter((img) => img.trim());
    if (validImages.length === 0) {
      toast.error("At least 1 image URL is required.");
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
          images: validImages,
          priceReferenceLink: priceReferenceLink || undefined,
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
                <Label>Image URLs <span className="text-destructive">*</span> <span className="font-normal text-muted-foreground">(1-5)</span></Label>
                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder={`Image ${idx + 1} URL (https://…)`}
                        value={img}
                        onChange={(e) => updateImage(idx, e.target.value)}
                        type="url"
                      />
                      {images.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(idx)} className="shrink-0 text-muted-foreground hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={addImage} className="gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add image
                    </Button>
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
