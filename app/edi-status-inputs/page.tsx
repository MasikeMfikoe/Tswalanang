"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EDIOption {
  id: string
  category: string
  value: string
  label: string
  display_order: number
  is_active: boolean
}

interface CategoryData {
  title: string
  category: string
  options: EDIOption[]
}

export default function EDIStatusInputsPage() {
  const [categories, setCategories] = useState<CategoryData[]>([
    { title: "EDI Status", category: "edi_status_type", options: [] },
    { title: "EDI Submission Status", category: "edi_submission_type", options: [] },
    { title: "File Status", category: "file_status_type", options: [] },
  ])
  const [loading, setLoading] = useState(true)
  const [editingOption, setEditingOption] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ value: "", label: "" })
  const [newOptions, setNewOptions] = useState<Record<string, { value: string; label: string }>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchAllOptions()
  }, [])

  const fetchAllOptions = async () => {
    setLoading(true)
    try {
      const updatedCategories = await Promise.all(
        categories.map(async (category) => {
          const response = await fetch(`/api/edi-options/manage?category=${category.category}`)
          if (response.ok) {
            const data = await response.json()
            return { ...category, options: data.options || [] }
          }
          return category
        }),
      )
      setCategories(updatedCategories)
    } catch (error) {
      console.error("[v0] Error fetching options:", error)
      toast({
        title: "Error",
        description: "Failed to fetch EDI options",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddOption = async (categoryType: string) => {
    const newOption = newOptions[categoryType]
    if (!newOption?.value || !newOption?.label) {
      toast({
        title: "Error",
        description: "Please enter both value and label",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/edi-options/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryType,
          value: newOption.value,
          label: newOption.label,
        }),
      })

      if (response.ok) {
        setNewOptions((prev) => ({ ...prev, [categoryType]: { value: "", label: "" } }))
        await fetchAllOptions()
        toast({
          title: "Success",
          description: "Option added successfully",
        })
      } else {
        throw new Error("Failed to add option")
      }
    } catch (error) {
      console.error("[v0] Error adding option:", error)
      toast({
        title: "Error",
        description: "Failed to add option",
        variant: "destructive",
      })
    }
  }

  const handleEditOption = (option: EDIOption) => {
    setEditingOption(option.id)
    setEditValues({ value: option.value, label: option.label })
  }

  const handleSaveEdit = async (optionId: string) => {
    try {
      const response = await fetch("/api/edi-options/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: optionId,
          value: editValues.value,
          label: editValues.label,
        }),
      })

      if (response.ok) {
        setEditingOption(null)
        await fetchAllOptions()
        toast({
          title: "Success",
          description: "Option updated successfully",
        })
      } else {
        throw new Error("Failed to update option")
      }
    } catch (error) {
      console.error("[v0] Error updating option:", error)
      toast({
        title: "Error",
        description: "Failed to update option",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return

    try {
      const response = await fetch(`/api/edi-options/manage?id=${optionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAllOptions()
        toast({
          title: "Success",
          description: "Option deleted successfully",
        })
      } else {
        throw new Error("Failed to delete option")
      }
    } catch (error) {
      console.error("[v0] Error deleting option:", error)
      toast({
        title: "Error",
        description: "Failed to delete option",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading EDI options...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">EDI Status Inputs</h1>
        <Button onClick={fetchAllOptions} variant="outline">
          Refresh Options
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.category} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category.title}
                <Badge variant="secondary">{category.options.length} options</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new option form */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Add New Option</h4>
                <Input
                  placeholder="Value (e.g., draft_entry)"
                  value={newOptions[category.category]?.value || ""}
                  onChange={(e) =>
                    setNewOptions((prev) => ({
                      ...prev,
                      [category.category]: { ...prev[category.category], value: e.target.value },
                    }))
                  }
                />
                <Input
                  placeholder="Label (e.g., Draft Entry)"
                  value={newOptions[category.category]?.label || ""}
                  onChange={(e) =>
                    setNewOptions((prev) => ({
                      ...prev,
                      [category.category]: { ...prev[category.category], label: e.target.value },
                    }))
                  }
                />
                <Button onClick={() => handleAddOption(category.category)} size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>

              {/* Existing options */}
              <div className="space-y-2">
                {category.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    {editingOption === option.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editValues.value}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, value: e.target.value }))}
                          placeholder="Value"
                        />
                        <Input
                          value={editValues.label}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="Label"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(option.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingOption(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.value}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleEditOption(option)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteOption(option.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
                {category.options.length === 0 && (
                  <div className="text-center text-gray-500 py-4">No options available. Add some options above.</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button onClick={fetchAllOptions} size="lg">
          Save & Update All Changes
        </Button>
      </div>
    </div>
  )
}
