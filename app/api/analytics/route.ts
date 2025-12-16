import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const days = parseInt(searchParams.get("days") || "7");

  if (!tenantId) {
    return NextResponse.json(
      { error: "Missing tenantId" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total messages
    const { count: totalMessages } = await supabase
      .from("chat_analytics")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString());

    // Get messages by language
    const { data: byLanguage } = await supabase
      .from("chat_analytics")
      .select("language")
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString());

    const languageStats = byLanguage?.reduce((acc: Record<string, number>, row) => {
      acc[row.language] = (acc[row.language] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get average response time
    const { data: responseTimes } = await supabase
      .from("chat_analytics")
      .select("response_time_ms")
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString());

    const avgResponseTime = responseTimes?.length
      ? Math.round(
          responseTimes.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) /
            responseTimes.length
        )
      : 0;

    // Get recent messages
    const { data: recentMessages } = await supabase
      .from("chat_analytics")
      .select("message, language, created_at, response_time_ms")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get daily counts
    const { data: dailyData } = await supabase
      .from("chat_analytics")
      .select("created_at")
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString());

    const dailyCounts = dailyData?.reduce((acc: Record<string, number>, row) => {
      const date = new Date(row.created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json(
      {
        period: `${days} days`,
        totalMessages: totalMessages || 0,
        languageStats,
        avgResponseTimeMs: avgResponseTime,
        dailyCounts,
        recentMessages: recentMessages || [],
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500, headers: corsHeaders }
    );
  }
}
