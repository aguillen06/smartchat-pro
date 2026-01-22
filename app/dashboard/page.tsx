"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface Analytics {
  period: string;
  totalMessages: number;
  languageStats: Record<string, number>;
  avgResponseTimeMs: number;
  dailyCounts: Record<string, number>;
  recentMessages: Array<{
    message: string;
    language: string;
    created_at: string;
    response_time_ms: number;
  }>;
}

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface UserData {
  email: string;
  firstName?: string;
  tenant: {
    id: string;
    name: string;
    businessName?: string;
    status: string;
  };
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString();
};

const formatMs = (ms: number): string => {
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user data with tenant
      const { data: userRecord, error } = await supabase
        .from("users")
        .select(`
          email,
          first_name,
          tenant:tenants (
            id,
            name,
            business_name,
            status,
            onboarding_completed_at
          )
        `)
        .eq("auth_user_id", user.id)
        .single();

      if (error || !userRecord) {
        console.error("Failed to fetch user data:", error);
        router.push("/login");
        return;
      }

      const tenant = Array.isArray(userRecord.tenant) ? userRecord.tenant[0] : userRecord.tenant;

      // Check if onboarding is completed
      if (tenant && !tenant.onboarding_completed_at) {
        router.push("/onboarding/business");
        return;
      }

      setUserData({
        email: userRecord.email,
        firstName: userRecord.first_name || undefined,
        tenant: {
          id: tenant?.id || "",
          name: tenant?.name || "",
          businessName: tenant?.business_name || undefined,
          status: tenant?.status || "pending",
        },
      });

      setCheckingAuth(false);
    }

    checkAuth();
  }, [supabase, router]);

  // Fetch analytics when authenticated
  useEffect(() => {
    if (!userData?.tenant?.id) return;

    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?tenantId=${userData?.tenant.id}&days=${days}`);
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, [days, userData?.tenant?.id]);

  // Fetch subscription status
  useEffect(() => {
    if (!userData?.tenant?.id) return;

    async function fetchSubscription() {
      try {
        const res = await fetch("/api/stripe/subscription");
        const data = await res.json();
        if (data.hasSubscription && data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      }
    }
    fetchSubscription();
  }, [userData?.tenant?.id]);

  const handleManageBilling = useCallback(async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    }
    setLoadingPortal(false);
  }, []);

  const sortedDailyCounts = useMemo(() => {
    if (!analytics?.dailyCounts) return [];
    return Object.entries(analytics.dailyCounts).sort(([a], [b]) => a.localeCompare(b));
  }, [analytics?.dailyCounts]);

  const maxDailyCount = useMemo((): number => {
    if (!analytics?.dailyCounts) return 0;
    const values: number[] = Object.values(analytics.dailyCounts);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [analytics?.dailyCounts]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [supabase, router]);

  // Loading check
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)"
      }}>
        Loading...
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "24px 16px"
    }}>
      <style>{`
        @media (min-width: 640px) {
          .dashboard-container { padding: 40px 20px !important; }
          .dashboard-title { font-size: 32px !important; }
        }
      `}</style>
      <div className="dashboard-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="dashboard-title" style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0"
            }}>
              SmartChat Analytics
            </h1>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
              {userData?.tenant?.businessName || userData?.tenant?.name || "Your Business"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <a
              href="/settings"
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                color: "#6b7280",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Settings
            </a>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                color: "#6b7280",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {userData?.tenant?.status === "trial" && (
          <div style={{
            background: "#DBEAFE",
            border: "1px solid #93C5FD",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#3B82F6"
              }} />
              <span style={{ color: "#1E40AF", fontWeight: "500" }}>
                You're on a 14-day free trial
              </span>
            </div>
            <button
              onClick={handleManageBilling}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1E40AF",
                background: "white",
                border: "1px solid #93C5FD",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Subscription Status */}
        {subscription && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Plan</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", textTransform: "capitalize" }}>
                  {subscription.plan}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Status</div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  background: subscription.status === "active" ? "#D1FAE5" : subscription.status === "trialing" ? "#DBEAFE" : "#FEF3C7",
                  color: subscription.status === "active" ? "#065F46" : subscription.status === "trialing" ? "#1E40AF" : "#92400E"
                }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: subscription.status === "active" ? "#18181B" : subscription.status === "trialing" ? "#3B82F6" : "#F59E0B"
                  }} />
                  {subscription.status === "trialing" ? "Trial" : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  {subscription.cancel_at_period_end ? "Access Until" : "Next Billing"}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              </div>
              {subscription.cancel_at_period_end && (
                <div style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                  background: "#FEE2E2",
                  color: "#991B1B"
                }}>
                  Cancels at period end
                </div>
              )}
            </div>
            <button
              onClick={handleManageBilling}
              disabled={loadingPortal}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#18181B",
                background: "white",
                border: "1px solid #18181B",
                borderRadius: "8px",
                cursor: loadingPortal ? "not-allowed" : "pointer",
                opacity: loadingPortal ? 0.6 : 1
              }}
            >
              {loadingPortal ? "Loading..." : "Manage Billing"}
            </button>
          </div>
        )}

        {/* Period Selector */}
        <div style={{ marginBottom: "24px" }}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              cursor: "pointer"
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <>
            {/* Skeleton Stats Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "32px"
            }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{
                    width: "100px",
                    height: "14px",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }} />
                  <div style={{
                    width: "60px",
                    height: "36px",
                    background: "#e5e7eb",
                    borderRadius: "6px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }} />
                </div>
              ))}
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </>
        ) : analytics ? (
          <>
            {/* Stats Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "32px"
            }}>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
                  Total Messages
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#18181B" }}>
                  {analytics.totalMessages}
                </div>
              </div>

              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
                  Avg Response Time
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#3B82F6" }}>
                  {formatMs(analytics.avgResponseTimeMs)}
                </div>
              </div>

              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
                  English Messages
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#8B5CF6" }}>
                  {analytics.languageStats.en || 0}
                </div>
              </div>

              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
                  Spanish Messages
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#F59E0B" }}>
                  {analytics.languageStats.es || 0}
                </div>
              </div>
            </div>

            {/* Daily Chart */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              marginBottom: "32px"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                Daily Messages
              </h2>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "150px" }}>
                {sortedDailyCounts.length > 0 ? (
                  sortedDailyCounts.map(([date, count]) => {
                    const height = maxDailyCount > 0 ? (count / maxDailyCount) * 120 : 0;
                    return (
                      <div key={date} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          height: `${height}px`,
                          background: "#18181B",
                          borderRadius: "4px 4px 0 0",
                          minHeight: count > 0 ? "20px" : "0"
                        }} />
                        <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "8px" }}>
                          {date.slice(5)}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#1f2937" }}>
                          {count}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: "#9ca3af", textAlign: "center", width: "100%", padding: "40px" }}>
                    No data for this period
                  </div>
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1f2937" }}>
                Recent Messages
              </h2>
              {analytics.recentMessages.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {analytics.recentMessages.map((msg, i) => (
                    <div key={i} style={{
                      padding: "16px",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      borderLeft: `4px solid ${msg.language === "es" ? "#F59E0B" : "#8B5CF6"}`
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{
                          fontSize: "12px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: msg.language === "es" ? "#FEF3C7" : "#EDE9FE",
                          color: msg.language === "es" ? "#92400E" : "#5B21B6"
                        }}>
                          {msg.language.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                          {formatMs(msg.response_time_ms)}
                        </span>
                      </div>
                      <div style={{ color: "#1f2937", marginBottom: "4px" }}>
                        {msg.message}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {formatDate(msg.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>
                  No messages yet
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
            Failed to load analytics
          </div>
        )}
      </div>
    </div>
  );
}
