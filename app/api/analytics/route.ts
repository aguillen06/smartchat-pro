import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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
    const startDateISO = startDate.toISOString();

    // OPTIMIZED: Single query for all date-filtered analytics data
    // Previously: 5 separate queries, now: 2 queries (parallel)
    const [analyticsResult, recentResult] = await Promise.all([
      // Query 1: Get all data for aggregations in one query
      supabase
        .from("chat_analytics")
        .select("language, response_time_ms, created_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", startDateISO),

      // Query 2: Get recent messages (different filter - no date range)
      supabase
        .from("chat_analytics")
        .select("message, language, created_at, response_time_ms")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

    const analyticsData = analyticsResult.data || [];
    const recentMessages = recentResult.data || [];

    // Compute all aggregations from single dataset
    const totalMessages = analyticsData.length;

    // Language stats
    const languageStats: Record<string, number> = {};
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    const dailyCounts: Record<string, number> = {};

    // Single pass through data for all aggregations
    for (const row of analyticsData) {
      // Language stats
      languageStats[row.language] = (languageStats[row.language] || 0) + 1;

      // Response time accumulation
      if (row.response_time_ms) {
        totalResponseTime += row.response_time_ms;
        responseTimeCount++;
      }

      // Daily counts
      const date = new Date(row.created_at).toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }

    const avgResponseTime = responseTimeCount > 0
      ? Math.round(totalResponseTime / responseTimeCount)
      : 0;

    return NextResponse.json(
      {
        period: `${days} days`,
        totalMessages,
        languageStats,
        avgResponseTimeMs: avgResponseTime,
        dailyCounts,
        recentMessages,
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
