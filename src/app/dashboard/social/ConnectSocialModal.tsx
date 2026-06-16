"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { connectSocialPlatform, disconnectSocialPlatform } from "@/lib/actions/social";

interface ConnectSocialModalProps {
  platformId: "FACEBOOK" | "INSTAGRAM" | "TWITTER" | "LINKEDIN" | "LINE" | "TIKTOK" | "YOUTUBE";
  platformName: string;
  buttonClass: string;
}

export function ConnectSocialModal({ platformId, platformName, buttonClass }: ConnectSocialModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await connectSocialPlatform({
      platform: platformId,
      accountName,
      accountId,
      accessToken,
    });

    if (result.success) {
      setOpen(false);
      setAccountName("");
      setAccountId("");
      setAccessToken("");
    } else {
      setError(result.error || "Failed to connect.");
    }
    setIsLoading(false);
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button className={buttonClass} onClick={() => setOpen(true)}>+ Add Account</button>
      <DialogContent className="sm:max-w-[425px] bg-[#0A0F1D] border-white/10 text-slate-100 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Connect {platformName}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter your access credentials below to authorize VibePost to publish content automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConnect}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-300">Account / Page Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. VibePost Official" 
                required 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-500/50" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountId" className="text-slate-300">Page ID / Account ID</Label>
              <Input 
                id="accountId" 
                placeholder="e.g. 100063481152764" 
                required 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-500/50" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token" className="text-slate-300">Access Token</Label>
              <Input 
                id="token" 
                placeholder="EAAGm0P..." 
                type="password"
                required 
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-500/50" 
              />
            </div>
          </div>
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
              {isLoading ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
