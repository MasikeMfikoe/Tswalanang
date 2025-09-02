// app/api/check-email-availability/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public schema (your app tables)
const supabasePublic = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "public" },
});

// Client for auth schema (built-in auth tables)
const supabaseAuth = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "auth" },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1) Check Supabase Auth users (auth.users)
    const { data: authUser, error: authErr } = await supabaseAuth
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle(); // returns null if no row

    if (authErr) {
      console.error("Error checking email in auth.users:", authErr);
      return NextResponse.json(
        { isAvailable: false, error: "Unable to verify email availability" },
        { status: 500 }
      );
    }

    if (authUser) {
      return NextResponse.json({
        isAvailable: false,
        error: "Email already exists",
      });
    }

    // 2) Check your user_profiles table as well
    const { data: profileUser, error: profileErr } = await supabasePublic
      .from("user_profiles")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileErr) {
      console.error("Error checking email in user_profiles:", profileErr);
      return NextResponse.json(
        { isAvailable: false, error: "Unable to verify email availability" },
        { status: 500 }
      );
    }

    if (profileUser) {
      return NextResponse.json({
        isAvailable: false,
        error: "Email already exists",
      });
    }

    return NextResponse.json({ isAvailable: true });
  } catch (err) {
    console.error("Email availability check failed:", err);
    return NextResponse.json(
      { isAvailable: false, error: "Unable to verify email availability" },
      { status: 500 }
    );
  }
}
