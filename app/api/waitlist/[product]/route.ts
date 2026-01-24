import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Valid product slugs
const VALID_PRODUCTS = [
  "leadflow",
  "processpilot",
  "contentcraft",
  "phonebot",
  "smartchat",
  "academy",
  "secure-workspace",
];

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ product: string }> }
) {
  try {
    const { product } = await params;

    // Validate product
    if (!VALID_PRODUCTS.includes(product)) {
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { business_name, email, phone, monthly_leads, daily_calls } = body;

    // Validate required fields
    if (!business_name || !email) {
      return NextResponse.json(
        { error: "Business name and email are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Check for duplicate email + product combination
    const { data: existing } = await supabase
      .from("phonebot_waitlist")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("product", product)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You're already on the waitlist for this product" },
        { status: 409, headers: corsHeaders }
      );
    }

    // Get source URL from referer header
    const sourceUrl = request.headers.get("referer") || null;

    // Insert into waitlist
    const { data, error } = await supabase
      .from("phonebot_waitlist")
      .insert({
        business_name: business_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        daily_calls: monthly_leads || daily_calls || null, // Support both field names
        product,
        source_url: sourceUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the waitlist",
        id: data.id,
        downloadUrl: "https://symtri.ai/downloads/ai-readiness-checklist.pdf",
        downloadTitle: "AI Readiness Checklist",
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}
