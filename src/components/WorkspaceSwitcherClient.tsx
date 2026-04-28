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
    <div className="relative px-4 pb-4 border-b border-white/5 mb-4" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/20 hover:bg-black/40 border border-white/10 px-3 py-2 rounded-xl transition-all"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0">
            {activeWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-white truncate">{activeWorkspace.name}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-[#0f1423] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {!isCreating ? (
            <>
              <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitch(ws.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${ws.id === activeWorkspace.id ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${ws.id === activeWorkspace.id ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'}`}>
                      {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspace.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-1 border-t border-white/10">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-blue-400 hover:bg-blue-500/10 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Create Workspace
                </button>
              </div>
            </>
          ) : (
            <div className="p-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">New Workspace</h4>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Thaiwatsadu"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-2 placeholder-slate-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newName.trim()}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
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
