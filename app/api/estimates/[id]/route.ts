import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch a specific estimate by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createRouteHandlerClient({ cookies })

    const { data: estimate, error } = await supabase.from("estimates").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Estimate not found" }, { status: 404 })
      }

      console.error("Error fetching estimate:", error)
      return NextResponse.json({ error: "Failed to fetch estimate", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: estimate,
      success: true,
    })
  } catch (error) {
    console.error("Unexpected error in estimate GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// PUT: Update an existing estimate
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createRouteHandlerClient({ cookies })
    const updateData = await request.json()

    // Check if estimate exists
    const { data: existingEstimate, error: checkError } = await supabase
      .from("estimates")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Estimate not found" }, { status: 404 })
      }

      console.error("Error checking estimate existence:", checkError)
      return NextResponse.json(
        { error: "Failed to check estimate existence", details: checkError.message },
        { status: 500 },
      )
    }

    // Update the estimate
    const { data: updatedEstimate, error } = await supabase
      .from("estimates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating estimate:", error)
      return NextResponse.json({ error: "Failed to update estimate", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedEstimate,
      success: true,
      message: "Estimate updated successfully",
    })
  } catch (error) {
    console.error("Unexpected error in estimate PUT route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE: Remove an estimate
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createRouteHandlerClient({ cookies })

    // Check if estimate exists
    const { data: existingEstimate, error: checkError } = await supabase
      .from("estimates")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Estimate not found" }, { status: 404 })
      }

      console.error("Error checking estimate existence:", checkError)
      return NextResponse.json(
        { error: "Failed to check estimate existence", details: checkError.message },
        { status: 500 },
      )
    }

    // Delete the estimate
    const { error } = await supabase.from("estimates").delete().eq("id", id)

    if (error) {
      console.error("Error deleting estimate:", error)
      return NextResponse.json({ error: "Failed to delete estimate", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Estimate deleted successfully",
    })
  } catch (error) {
    console.error("Unexpected error in estimate DELETE route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
