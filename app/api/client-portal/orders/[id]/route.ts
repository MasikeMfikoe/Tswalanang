import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Assuming this is the correct path to your Supabase client
import { ordersApi } from "@/lib/api/ordersApi"

interface Params {
 id: string;
}

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<Params> }
) {
 try {
   const { id } = await params; // Await the params object
   const { searchParams } = new URL(request.url)
   const clientId = searchParams.get("clientId")

   if (!clientId) {
     return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
   }

   // Fetch the order details
   const { data: order, error: orderError } = await ordersApi.getOrder(id)

   if (orderError || !order) {
     console.error("Error fetching order:", orderError)
     return NextResponse.json({ error: "Order not found" }, { status: 404 })
   }

   // Verify if the order belongs to the client
   const { data: userProfile, error: userError } = await supabase
     .from("user_profiles")
     .select("customer_id")
     .eq("id", clientId)
     .single()

   if (userError || !userProfile || userProfile.customer_id !== order.customer_id) {
     console.warn(`Unauthorized access attempt for order ${id} by client ${clientId}`)
     return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
   }

   return NextResponse.json({ success: true, data: order })
 } catch (error) {
   console.error('Error in GET /api/client-portal/orders/[id]:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}

export async function PUT(
 request: NextRequest,
 { params }: { params: Promise<Params> }
) {
 try {
   const { id } = await params; // Await the params object
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
