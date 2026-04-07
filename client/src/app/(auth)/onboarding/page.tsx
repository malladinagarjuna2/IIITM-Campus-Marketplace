"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const HOSTEL_BLOCKS = ["BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "GH-1", "GH-2", "New BH", "Day Scholar"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();
  const [showRealIdentity, setShowRealIdentity] = useState("false");
  const [hostelBlock, setHostelBlock] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.onboardingComplete) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user || user.onboardingComplete) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelBlock) {
      toast.error("Please select your hostel block.");
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding(showRealIdentity === "true", hostelBlock);
      toast.success("Profile set up! Welcome to Campus Marketplace.");
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-[var(--navy)]">One last step</CardTitle>
        <CardDescription>You've been assigned a unique alien identity</CardDescription>
        {/* Robot avatar + alien name */}
        <div className="flex flex-col items-center gap-2 py-3">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.anonymousNickname}
              className="w-20 h-20 rounded-full border-2 border-[var(--gold)] bg-muted"
            />
          )}
          <span className="text-lg font-bold text-[var(--gold-dark)]">{user.anonymousNickname}</span>
          <span className="text-xs text-muted-foreground">Your campus alias</span>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Identity preference */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-[var(--navy)]">How do you want to appear?</Label>
            <RadioGroup value={showRealIdentity} onValueChange={setShowRealIdentity} className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer has-[:checked]:border-[var(--navy)] has-[:checked]:bg-blue-50">
                <RadioGroupItem value="false" id="anon" className="mt-0.5" />
                <Label htmlFor="anon" className="cursor-pointer">
                  <div className="font-medium">Stay anonymous</div>
                  <div className="text-sm text-muted-foreground">Use your nickname "{user.anonymousNickname}"</div>
                </Label>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer has-[:checked]:border-[var(--navy)] has-[:checked]:bg-blue-50">
                <RadioGroupItem value="true" id="real" className="mt-0.5" />
                <Label htmlFor="real" className="cursor-pointer">
                  <div className="font-medium">Show real name</div>
                  <div className="text-sm text-muted-foreground">Display as "{user.realName}"</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Hostel block */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[var(--navy)]">Your hostel block</Label>
            <p className="text-sm text-muted-foreground">Helps buyers know how close you are (no room number needed)</p>
            <Select onValueChange={(v: string | null) => setHostelBlock(v ?? "")} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select hostel block…" />
              </SelectTrigger>
              <SelectContent>
                {HOSTEL_BLOCKS.map((block) => (
                  <SelectItem key={block} value={block}>
                    {block}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-[var(--navy-dark)] font-semibold"
            disabled={loading}
          >
            {loading ? "Saving…" : "Enter Marketplace →"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
