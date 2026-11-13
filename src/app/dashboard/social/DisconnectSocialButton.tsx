"use client";

import React, { useState } from "react";
import { disconnectSocialPlatform } from "@/lib/actions/social";
import { Trash2 } from "lucide-react";

interface DisconnectSocialButtonProps {
  connectionId: string;
  accountName: string;
}

export function DisconnectSocialButton({ connectionId, accountName }: DisconnectSocialButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${accountName}?`)) return;
    
    setIsLoading(true);
    await disconnectSocialPlatform(connectionId);
    setIsLoading(false);
  };

  return (
    <button 
      onClick={handleDisconnect}
      disabled={isLoading}
      title="Disconnect account"
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
