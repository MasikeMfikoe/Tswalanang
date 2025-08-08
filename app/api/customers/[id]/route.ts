import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Assuming this is the correct path to your Supabase client

interface Params {
 id: string;
}

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<Params> }
) {
 try {
   const { id } = await params; // Await the params object
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );

   const { data, error } = await supabaseAdmin
     .from('customers')
     .select('*')
     .eq('id', id)
     .single();

   if (error) {
     console.error('Error fetching customer:', error);
     return NextResponse.json({ error: error.message }, { status: 500 });
   }

   if (!data) {
     return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
   }

   return NextResponse.json(data);
 } catch (error) {
   console.error('Error in GET /api/customers/[id]:', error);
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
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );

   const { data, error } = await supabaseAdmin
     .from('customers')
     .update(body)
     .eq('id', id)
     .select()
     .single();

   if (error) {
     console.error('Error updating customer:', error);
     return NextResponse.json({ error: error.message }, { status: 500 });
   }

   return NextResponse.json(data);
 } catch (error) {
   console.error('Error in PUT /api/customers/[id]:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}

export async function DELETE(
 request: NextRequest,
 { params }: { params: Promise<Params> }
) {
 try {
   const { id } = await params; // Await the params object
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );

   const { error } = await supabaseAdmin
     .from('customers')
     .delete()
     .eq('id', id);

   if (error) {
     console.error('Error deleting customer:', error);
     return NextResponse.json({ error: error.message }, { status: 500 });
   }

   return NextResponse.json({ message: 'Customer deleted successfully' });
 } catch (error) {
   console.error('Error in DELETE /api/customers/[id]:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
