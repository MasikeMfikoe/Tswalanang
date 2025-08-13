"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export function ApiKeyManager() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const { toast } = useToast()

  const generateApiKey = async () => {
    try {
      const response = await fetch("/api/api-keys", { method: "POST" })
      const data = await response.json()
      if (response.ok) {
        if (data?.apiKey) {
          setApiKey(data.apiKey)
          toast({
            title: "API Key Generated",
            description: "Your new API key has been created successfully.",
          })
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        throw new Error(data.error || "Failed to generate API key")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">API Key Management</h2>
      <Button onClick={generateApiKey}>Generate New API Key</Button>
      {apiKey && (
        <div className="mt-4">
          <p className="mb-2">Your new API key (save this, it won't be shown again):</p>
          <Input value={apiKey} readOnly />
        </div>
      )}
    </div>
  )
}
