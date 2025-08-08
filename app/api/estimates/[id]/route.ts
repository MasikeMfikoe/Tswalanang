import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "Estimate ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("estimates").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching estimate:", error)
      return NextResponse.json({ error: "Failed to fetch estimate" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Estimate not found" }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Unexpected error fetching estimate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const updates = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Estimate ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("estimates").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating estimate:", error)
      return NextResponse.json({ error: "Failed to update estimate" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Estimate not found or no changes applied" }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Unexpected error updating estimate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "Estimate ID is required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("estimates").delete().eq("id", id)

    if (error) {
      console.error("Error deleting estimate:", error)
      return NextResponse.json({ error: "Failed to delete estimate" }, { status: 500 })
    }

    return NextResponse.json({ message: "Estimate deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error deleting estimate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
