"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/actions/planner/action-result";

/** Runs a planner server action with pending state, error message and a router refresh. */
export function usePlannerAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run<T>(action: () => Promise<ActionResult<T>>, onSuccess?: (data: T) => void): void {
    setError(null);
    startTransition(async () => {
      try {
        const res = await action();
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onSuccess?.(res.data);
        router.refresh();
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
      }
    });
  }

  return { run, pending, error, clearError: () => setError(null) };
}
