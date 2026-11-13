"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function CreateWorkspaceButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="neu-tint-primary px-8 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create Workspace"
      )}
    </button>
  );
}
