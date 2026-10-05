"use client"

import React, { useState, useRef, useEffect } from "react"
import { switchActiveWorkspace, createNewWorkspace } from "@/lib/actions/workspace"

export function WorkspaceSwitcherClient({ 
  workspaces, 
  activeWorkspaceId 
}: { 
  workspaces: any[]; 
  activeWorkspaceId: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleSwitch(id: string) {
    if (id === activeWorkspaceId) {
      setIsOpen(false)
      return
    }
    await switchActiveWorkspace(id)
    setIsOpen(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setIsSubmitting(true)
    try {
      await createNewWorkspace(newName)
      setNewName("")
      setIsCreating(false)
      setIsOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeWorkspace) return null

  return (
    <div className="relative px-3 pb-3 border-b border-[#e4e7ee] dark:border-white/10 mb-3" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-[#181d27] hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-[#e4e7ee] dark:border-white/10 px-3 py-2 rounded-xl transition-all shadow-2xs"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shadow-2xs shrink-0">
            {activeWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{activeWorkspace.name}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Workspace</span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-3 right-3 mt-1.5 bg-white dark:bg-[#181d27] border border-[#e4e7ee] dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {!isCreating ? (
            <>
              <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                {workspaces.map(ws => {
                  const isSelected = ws.id === activeWorkspace.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSwitch(ws.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                        isSelected 
                          ? 'bg-[#edf0ff] dark:bg-[#2c304c] text-[#30327a] dark:text-[#e2e7fc] font-semibold' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {ws.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate">{ws.name}</span>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0 text-indigo-600 dark:text-indigo-400"><path d="M20 6 9 17l-5-5"/></svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-1.5 border-t border-[#e4e7ee] dark:border-white/10">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Create Workspace
                </button>
              </div>
            </>
          ) : (
            <div className="p-3">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">New Workspace</h4>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Thaiwatsadu"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-[#e4e7ee] dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 mb-2 placeholder-slate-400"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newName.trim()}
                    className="flex-1 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
  )
}
