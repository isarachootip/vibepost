"use client"

import { useState } from "react"
import { createDefaultWorkspace } from "@/lib/actions/workspace"

export function CreateWorkspaceButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    try {
      const result = await createDefaultWorkspace()
      if (result.error) {
        alert("Error creating workspace: " + result.error)
        setIsLoading(false)
      } else {
        // Success! Reload the page to fetch the new workspace context
        window.location.reload()
      }
    } catch (err: any) {
      alert("Unexpected error: " + err.message)
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black px-8 py-3 rounded-full font-semibold transition-all shadow-[0_4px_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating...
        </>
      ) : (
        "Create Workspace"
      )}
    </button>
  )
}
