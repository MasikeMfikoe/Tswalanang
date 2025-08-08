import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Assuming this is the correct path to your Supabase client
import { ordersApi } from "@/lib/api/ordersApi"

interface Params {
 id: string;
}

export async function GET(
 request: NextRequest,
 { params }: { params: Params }
) {
 try {
   const { id } = params;

   if (!id) {
     return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
   }

   const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

   if (error) {
     console.error("Error fetching order for client portal:", error)
     return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
   }

   if (!data) {
     return NextResponse.json({ error: "Order not found" }, { status: 404 })
   }

   return NextResponse.json(data, { status: 200 })
 } catch (error) {
   console.error('Error in GET /api/client-portal/orders/[id]:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}

export async function PUT(
 request: NextRequest,
 { params }: { params: Params }
) {
 try {
   const { id } = params; // Await the params object
   const body = await request.json();
   const { clientId, updates } = body

   if (!clientId) {
     return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
   }

   // Verify if the order belongs to the client
   const { data: order, error: orderError } = await ordersApi.getOrder(id)
   if (orderError || !order) {
     return NextResponse.json({ error: "Order not found" }, { status: 404 })
   }

   const { data: userProfile, error: userError } = await supabase
     .from("user_profiles")
     .select("customer_id")
     .eq("id", clientId)
     .single()

   if (userError || !userProfile || userProfile.customer_id !== order.customer_id) {
     console.warn(`Unauthorized update attempt for order ${id} by client ${clientId}`)
     return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
   }

   // Apply allowed updates (e.g., status, notes)
   const allowedUpdates: Record<string, any> = {}
   if (updates.status) allowedUpdates.status = updates.status
   if (updates.notes) allowedUpdates.notes = updates.notes

   const { data, error } = await supabase
     .from("orders")
     .update(allowedUpdates)
     .eq("id", id)
     .select()
     .single()

   if (error) {
     throw error
   }

   return NextResponse.json({ success: true, data })
 } catch (error) {
   console.error('Error in PUT /api/client-portal/orders/[id]:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
