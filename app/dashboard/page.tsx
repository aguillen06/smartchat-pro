"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

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

// OPTIMIZED: Move utility functions outside component to prevent recreation on each render
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString();
};

const formatMs = (ms: number): string => {
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const tenantId = "c48decc4-98f5-4fe8-971f-5461d3e6ae1a";

  // Check if already authenticated
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("dashboard_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  // Fetch analytics when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?tenantId=${tenantId}&days=${days}`);
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, [days, isAuthenticated]);

  // OPTIMIZED: Memoize sorted daily counts to avoid recalculation on each render
  const sortedDailyCounts = useMemo(() => {
    if (!analytics?.dailyCounts) return [];
    return Object.entries(analytics.dailyCounts).sort(([a], [b]) => a.localeCompare(b));
  }, [analytics?.dailyCounts]);

  // OPTIMIZED: Calculate maxCount once instead of inside map loop
  const maxDailyCount = useMemo((): number => {
    if (!analytics?.dailyCounts) return 0;
    const values: number[] = Object.values(analytics.dailyCounts);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [analytics?.dailyCounts]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("dashboard_auth", "true");
        setIsAuthenticated(true);
      } else {
        setAuthError("Invalid password");
      }
    } catch {
      setAuthError("Authentication failed");
    }
  }, [password]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("dashboard_auth");
    setIsAuthenticated(false);
    setPassword("");
  }, []);

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

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          margin: "20px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981 0%, #0D9488 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", margin: "0 0 8px 0" }}>
              SmartChat Analytics
            </h1>
            <p style={{ color: "#6b7280", margin: 0 }}>Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "16px",
                border: authError ? "2px solid #EF4444" : "1px solid #d1d5db",
                borderRadius: "8px",
                marginBottom: "16px",
                outline: "none",
                boxSizing: "border-box"
              }}
              autoFocus
            />
            {authError && (
              <div style={{ color: "#EF4444", fontSize: "14px", marginBottom: "16px" }}>
                {authError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                color: "white",
                background: "linear-gradient(135deg, #10B981 0%, #0D9488 100%)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0"
            }}>
              SmartChat Analytics
            </h1>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Chat usage metrics for Symtri AI
            </p>
          </div>
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
          <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
            Loading...
          </div>
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
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#10B981" }}>
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
                {/* OPTIMIZED: Use pre-computed sortedDailyCounts and maxDailyCount */}
                {sortedDailyCounts.length > 0 ? (
                  sortedDailyCounts.map(([date, count]) => {
                    const height = maxDailyCount > 0 ? (count / maxDailyCount) * 120 : 0;
                    return (
                      <div key={date} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          height: `${height}px`,
                          background: "linear-gradient(135deg, #10B981 0%, #0D9488 100%)",
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
