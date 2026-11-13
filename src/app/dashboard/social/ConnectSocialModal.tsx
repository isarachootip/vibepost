"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { connectSocialPlatform } from "@/lib/actions/social";

interface ConnectSocialModalProps {
  platformId:
    | "FACEBOOK"
    | "INSTAGRAM"
    | "TWITTER"
    | "LINKEDIN"
    | "LINE"
    | "TIKTOK"
    | "YOUTUBE";
  platformName: string;
  buttonClass: string;
}

export function ConnectSocialModal({
  platformId,
  platformName,
  buttonClass,
}: ConnectSocialModalProps) {
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
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
        + Add Account
      </button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Connect {platformName}
          </DialogTitle>
          <DialogDescription>
            Enter your access credentials below to authorize VibePost to publish
            content automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConnect}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Account / Page Name</Label>
              <Input
                id="name"
                placeholder="e.g. VibePost Official"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountId">Page ID / Account ID</Label>
              <Input
                id="accountId"
                placeholder="e.g. 100063481152764"
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token">Access Token</Label>
              <Input
                id="token"
                placeholder="EAAGm0P..."
                type="password"
                required
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="text-destructive text-xs font-semibold mb-4">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" variant="tactile" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
