"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"

interface EDIStatus {
  id: string
  order_id: string
  edi_submission_status: string
  edi_status: string
  file_status: string
  created_at: string
  updated_at: string
}

interface EDINote {
  id: string
  order_id: string
  note_text: string
  created_by: string
  created_at: string
}

interface EDISubmissionStatusProps {
  orderId: string
  isEditing?: boolean
  currentUser?: string
}

export default function EDISubmissionStatus({
  orderId,
  isEditing = false,
  currentUser = "System User",
}: EDISubmissionStatusProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ediStatus, setEdiStatus] = useState<EDIStatus | null>(null)
  const [ediNotes, setEdiNotes] = useState<EDINote[]>([])
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  // Form state for editing
  const [formData, setFormData] = useState({
    edi_submission_status: "",
    edi_status: "",
    file_status: "",
  })

  useEffect(() => {
    fetchEDIData()
  }, [orderId])

  const fetchEDIData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/edi-submission/${orderId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch EDI data")
      }

      const data = await response.json()
      setEdiStatus(data.ediStatus)
      setEdiNotes(data.ediNotes)

      // Initialize form data
      if (data.ediStatus) {
        setFormData({
          edi_submission_status: data.ediStatus.edi_submission_status,
          edi_status: data.ediStatus.edi_status,
          file_status: data.ediStatus.file_status,
        })
      } else {
        setFormData({
          edi_submission_status: "pending",
          edi_status: "not_started",
          file_status: "not_uploaded",
        })
      }
    } catch (error) {
      console.error("Error fetching EDI data:", error)
      toast({
        title: "Error",
        description: "Failed to load EDI submission data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/edi-submission/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update EDI status")
      }

      const updatedStatus = await response.json()
      setEdiStatus(updatedStatus)

      toast({
        title: "Success",
        description: "EDI submission status updated successfully",
      })
    } catch (error) {
      console.error("Error updating EDI status:", error)
      toast({
        title: "Error",
        description: "Failed to update EDI submission status",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingNote(true)
      const response = await fetch("/api/edi-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          note_text: newNote.trim(),
          created_by: currentUser,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      const newNoteData = await response.json()
      setEdiNotes([...ediNotes, newNoteData])
      setNewNote("")

      toast({
        title: "Success",
        description: "Note added successfully",
      })
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    } finally {
      setAddingNote(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Enter to create new lines, not submit
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Insert a new line at cursor position
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      const newValue = value.substring(0, start) + "\n" + value.substring(end)
      setNewNote(newValue)

      // Set cursor position after the new line
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading EDI submission data...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* EDI Status Form */}
      <Card>
        <CardHeader>
          <CardTitle>EDI Submission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ediSubmissionStatus">EDI Submission Status</Label>
              <Select
                value={formData.edi_submission_status}
                onValueChange={(value) => setFormData({ ...formData, edi_submission_status: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ediStatus">EDI Status</Label>
              <Select
                value={formData.edi_status}
                onValueChange={(value) => setFormData({ ...formData, edi_status: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select EDI status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="data_preparation">Data Preparation</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="transmission">Transmission</SelectItem>
                  <SelectItem value="acknowledgment_pending">Acknowledgment Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileStatus">File Status</Label>
              <Select
                value={formData.file_status}
                onValueChange={(value) => setFormData({ ...formData, file_status: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select file status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_uploaded">Not Uploaded</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEditing && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleStatusUpdate} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notes (with History)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add New Note */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="newNote">Add Note</Label>
              <Textarea
                id="newNote"
                placeholder="Enter your note here... Press Enter to create new lines."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[100px] resize-y"
              />
            </div>
            <Button onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
              {addingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {/* Notes History */}
          <div className="space-y-4">
            <h4 className="font-semibold">Notes History</h4>
            {ediNotes.length === 0 ? (
              <p className="text-muted-foreground">No notes added yet.</p>
            ) : (
              <div className="space-y-3">
                {ediNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{note.created_by}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{note.note_text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
