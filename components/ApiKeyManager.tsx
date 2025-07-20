"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed: string
  status: "active" | "inactive"
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [showKey, setShowKey] = useState<string | null>(null) // Stores ID of key to show
  const { toast } = useToast()

  const fetchApiKeys = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/api-keys")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setApiKeys(data)
    } catch (err) {
      setError("Failed to fetch API keys.")
      console.error("Error fetching API keys:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "API Key name cannot be empty.",
        variant: "destructive",
      })
      return
    }
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const newKey = await response.json()
      setApiKeys((prev) => [...prev, newKey])
      setNewKeyName("")
      toast({
        title: "Success",
        description: `API Key "${newKey.name}" created.`,
      })
    } catch (err) {
      setError("Failed to create API key.")
      console.error("Error creating API key:", err)
      toast({
        title: "Error",
        description: "Failed to create API key.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    try {
      const response = await fetch("/api/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setApiKeys((prev) => prev.map((key) => (key.id === id ? { ...key, status: newStatus } : key)))
      toast({
        title: "Success",
        description: `API Key status updated to ${newStatus}.`,
      })
    } catch (err) {
      setError("Failed to update API key status.")
      console.error("Error updating API key status:", err)
      toast({
        title: "Error",
        description: "Failed to update API key status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setApiKeys((prev) => prev.filter((key) => key.id !== id))
      toast({
        title: "Success",
        description: "API Key deleted.",
      })
    } catch (err) {
      setError("Failed to delete API key.")
      console.error("Error deleting API key:", err)
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading API keys...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchApiKeys} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Key Management</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newKeyName">Key Name</Label>
                <Input
                  id="newKeyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., 'Integration with CRM'"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateKey}>Create Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {showKey === key.id ? key.key : "********************"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-6 w-6"
                    onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                    aria-label={showKey === key.id ? "Hide key" : "Show key"}
                  >
                    {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell>{key.lastUsed}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      key.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(key.id, key.status)}
                    className="mr-2"
                  >
                    {key.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteKey(key.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
