"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { createNewWorkspace, switchActiveWorkspace } from "@/lib/actions/workspace";

export interface WorkspaceSummary {
  id: string;
  name: string;
}

export function WorkspaceSwitcherClient({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSwitch(id: string) {
    if (id === activeWorkspaceId) {
      setIsOpen(false);
      return;
    }
    await switchActiveWorkspace(id);
    setIsOpen(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await createNewWorkspace(newName);
      setNewName("");
      setIsCreating(false);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!activeWorkspace) return null;

  return (
    <div
      className="relative px-3 pb-3 border-b border-[var(--border)] mb-3"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neu-raised w-full flex items-center justify-between border border-[var(--border-control)] hover:border-primary/40 px-3 py-2 rounded-2xl transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="neu-tint-primary size-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0">
            {activeWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="text-xs font-bold text-foreground truncate">
              {activeWorkspace.name}
            </span>
            <span className="text-[10px] text-muted-foreground">Workspace</span>
          </div>
        </div>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="neu-lifted absolute top-full left-3 right-3 mt-1.5 border border-[var(--border-control)] rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {!isCreating ? (
            <>
              <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                {workspaces.map((ws) => {
                  const isSelected = ws.id === activeWorkspace.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleSwitch(ws.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "neu-pressed text-primary-ink font-bold"
                          : "text-foreground/85 hover:bg-muted/60"
                      }`}
                    >
                      <div
                        className={`size-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? "neu-tint-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ws.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate">{ws.name}</span>
                      {isSelected && (
                        <Check className="ml-auto size-3.5 shrink-0 text-primary-ink" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-1.5 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left text-primary-ink hover:bg-accent transition-colors font-bold cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Create Workspace
                </button>
              </div>
            </>
          ) : (
            <div className="p-3">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase mb-2">
                New Workspace
              </h4>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Thaiwatsadu"
                  className="w-full bg-[var(--sheet)] border border-[var(--border-control)] rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary mb-2 placeholder:text-muted-foreground"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newName.trim()}
                    className="neu-tint-primary flex-1 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
