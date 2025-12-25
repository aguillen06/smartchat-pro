# Performance Analysis Report

**Date:** December 25, 2025
**Analyzed by:** Claude Code
**Branch:** `claude/find-perf-issues-mjlsgzewgpft0v4l-zbwnR`

---

## Executive Summary

This analysis identifies **15 performance issues** across the SmartChat Pro codebase, including N+1 query patterns, inefficient algorithms, React anti-patterns, and serverless-unfriendly code patterns.

**Severity Breakdown:**
- 🔴 **Critical (3):** Significant performance impact
- 🟠 **Medium (7):** Moderate performance impact
- 🟡 **Low (5):** Minor performance impact

---

## 1. N+1 Queries & Database Issues

### 🔴 CRITICAL: Multiple Sequential Database Queries

**File:** `app/api/analytics/route.ts` (lines 36-88)

**Problem:** The analytics endpoint makes **5 separate sequential database queries** to the same table with nearly identical filters:

```typescript
// Query 1: Get total count
const { count: totalMessages } = await supabase
  .from("chat_analytics")
  .select("*", { count: "exact", head: true })
  .eq("tenant_id", tenantId)
  .gte("created_at", startDate.toISOString());

// Query 2: Get language data
const { data: byLanguage } = await supabase
  .from("chat_analytics")
  .select("language")
  .eq("tenant_id", tenantId)
  .gte("created_at", startDate.toISOString());

// Query 3: Get response times
const { data: responseTimes } = await supabase
  .from("chat_analytics")
  .select("response_time_ms")
  ...

// Query 4: Get recent messages (different filter)
// Query 5: Get daily data
```

**Impact:**
- 5x database round trips per request
- Each query scans the same data range
- Increased latency (could be 500ms+ per request)

**Recommendation:** Consolidate into a single query:
```typescript
const { data, count } = await supabase
  .from("chat_analytics")
  .select("language, response_time_ms, created_at, message", { count: "exact" })
  .eq("tenant_id", tenantId)
  .gte("created_at", startDate.toISOString())
  .order("created_at", { ascending: false })
  .limit(1000);
```
Then compute all aggregations in JavaScript from the single result set.

---

### 🟠 MEDIUM: Over-fetching for Re-ranking

**File:** `lib/rag/knowledge-service.ts` (line 70)

**Problem:** Fetches 2x the needed results just to re-rank:
```typescript
match_count: limit * 2, // Get more results for re-ranking
```

**Impact:**
- Doubles database work
- Doubles data transfer
- Only 50% of fetched data is used

**Recommendation:** If re-ranking is necessary, implement it in the database query itself with weighted scoring, or cache frequently accessed chunks.

---

## 2. React Performance Anti-Patterns

### 🔴 CRITICAL: O(n) Recalculation Inside Map Loop

**File:** `app/dashboard/page.tsx` (lines 339-360)

**Problem:** `Math.max()` is recalculated on **every iteration**:
```typescript
.map(([date, count]) => {
  const maxCount = Math.max(...Object.values(analytics.dailyCounts)); // ❌ O(n) on each iteration
  const height = maxCount > 0 ? (count / maxCount) * 120 : 0;
  ...
})
```

**Impact:**
- O(n²) complexity instead of O(n)
- With 30 days of data: 30 × 30 = 900 operations instead of 30

**Recommendation:** Calculate `maxCount` once before the map:
```typescript
const counts = Object.entries(analytics.dailyCounts);
const maxCount = Math.max(...Object.values(analytics.dailyCounts));
{counts.sort(...).map(([date, count]) => {
  const height = maxCount > 0 ? (count / maxCount) * 120 : 0;
  ...
})}
```

---

### 🟠 MEDIUM: Utility Functions Recreated on Every Render

**File:** `app/dashboard/page.tsx` (lines 85-91)

**Problem:** Helper functions are defined inside the component body:
```typescript
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};

const formatMs = (ms: number) => {
  return (ms / 1000).toFixed(2) + "s";
};
```

**Impact:**
- Functions are recreated on every render
- New function references cause unnecessary child re-renders if passed as props

**Recommendation:** Move outside component or use `useCallback`:
```typescript
// Outside component
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();
const formatMs = (ms: number) => `${(ms / 1000).toFixed(2)}s`;
```

---

### 🟡 LOW: Missing useMemo for Derived Data

**File:** `app/dashboard/page.tsx`

**Problem:** Derived data like sorted daily counts and language statistics are not memoized.

**Recommendation:** Use `useMemo` for expensive calculations:
```typescript
const sortedDailyCounts = useMemo(() =>
  Object.entries(analytics?.dailyCounts || {}).sort(([a], [b]) => a.localeCompare(b)),
  [analytics?.dailyCounts]
);
```

---

## 3. Inefficient Algorithms

### 🔴 CRITICAL: O(n²) Point Connection Algorithm

**File:** `public/index.html` (lines 1445-1461)

**Problem:** Nested loop checks every point against every other point:
```javascript
this.points.forEach((point, i) => {
  this.points.slice(i + 1).forEach(otherPoint => {  // O(n²)
    const dist = Math.sqrt(
      Math.pow(point.x - otherPoint.x, 2) +
      Math.pow(point.y - otherPoint.y, 2)
    );
    if (dist < 70) { /* draw line */ }
  });
});
```

**Impact:**
- With 50×50 grid = 2,500 points
- 2,500 × 2,499 / 2 = **3.1 million** distance calculations per frame
- Running at 60 FPS = 187 million calculations per second

**Recommendation:** Use spatial hashing or only check adjacent grid cells:
```javascript
// Pre-compute neighbor relationships once at init
// Only check grid neighbors, not all points
const spacing = 50;
const maxDist = 70;
// Since maxDist < spacing * sqrt(2), only immediate neighbors need checking
```

---

### 🟠 MEDIUM: Repeated String Operations

**File:** `lib/rag/knowledge-service.ts` (lines 25-55)

**Problem:** `getSourceInfo` calls `toLowerCase()` and multiple `includes()` on the same content:
```typescript
function getSourceInfo(content: string, product: string): { title: string; url: string } {
  const lowerContent = content.toLowerCase(); // ✓ Good - but could cache

  if (lowerContent.includes('pricing') || lowerContent.includes('setup fee')) {
    title = 'Pricing';
  } else if (lowerContent.includes('industries') || lowerContent.includes('healthcare')) {
    // ... 8 more includes() calls
  }
```

**Impact:** Up to 15+ string searches on every knowledge chunk processed.

**Recommendation:** Use regex with alternation for single-pass matching:
```typescript
const patterns = {
  pricing: /pricing|setup fee/i,
  industries: /industries|healthcare/i,
  // ...
};
```

---

### 🟠 MEDIUM: Sequential API Calls in Batch Embedding

**File:** `lib/rag/embedding-provider.ts` (lines 39-49)

**Problem:** Batch embedding processes chunks sequentially:
```typescript
for (let i = 0; i < texts.length; i += batchSize) {
  const batch = texts.slice(i, i + batchSize);
  const response = await getOpenAI().embeddings.create({...});  // Sequential!
  results.push(...response.data.map((d) => d.embedding));
}
```

**Impact:** With 5 batches, waits for each to complete before starting next.

**Recommendation:** Use `Promise.all()` for parallel execution:
```typescript
const batches = [];
for (let i = 0; i < texts.length; i += batchSize) {
  batches.push(texts.slice(i, i + batchSize));
}
const results = await Promise.all(
  batches.map(batch => getOpenAI().embeddings.create({ model: this.model, input: batch }))
);
return results.flatMap(r => r.data.map(d => d.embedding));
```

---

## 4. Serverless & Memory Issues

### 🟠 MEDIUM: setInterval in Serverless Environment

**File:** `lib/session-manager.ts` (line 25)

**Problem:** `setInterval` is used for cleanup in a serverless context:
```typescript
constructor() {
  setInterval(() => this.cleanup(), 5 * 60 * 1000);
}
```

**Impact:**
- In serverless (Vercel), instances are ephemeral
- The interval may never fire or fire inconsistently
- Memory may not be reclaimed as expected

**Recommendation:**
1. For serverless: Use Redis/external storage with TTL
2. For local dev: Keep interval but add cleanup on module unload

---

### 🟠 MEDIUM: Array Mutation Creates Copies

**File:** `lib/session-manager.ts` (lines 59-61)

**Problem:** Creates a new array on every message add:
```typescript
if (session.messages.length > this.MAX_MESSAGES) {
  session.messages = session.messages.slice(-this.MAX_MESSAGES);
}
```

**Impact:** Memory allocation on every message beyond limit.

**Recommendation:** Use `shift()` to remove from front in-place:
```typescript
while (session.messages.length > this.MAX_MESSAGES) {
  session.messages.shift();
}
```

---

### 🟡 LOW: New Supabase Client Per Request

**File:** `app/api/analytics/route.ts` (lines 4-7)

**Problem:** Creates a new Supabase client at module scope but import suggests it might be re-created:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Recommendation:** Use the shared client from `lib/supabase/client.ts` for consistency and connection pooling benefits.

---

## 5. Event Handler Issues

### 🟠 MEDIUM: Unthrottled Mouse/Scroll Events

**File:** `public/index.html` (lines 1381, 1493, 1625)

**Problem:** Mouse and scroll events fire without throttling:
```javascript
window.addEventListener('mousemove', (e) => {
  this.mouse.x = e.clientX - rect.left;
  this.mouse.y = e.clientY - rect.top;
});

window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 50) { ... }
});
```

**Impact:**
- Mousemove can fire 60-100+ times per second
- Scroll events can fire 100+ times during fast scroll
- Causes layout thrashing if DOM reads/writes aren't batched

**Recommendation:** Throttle to match animation frame rate:
```javascript
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      // handle scroll
      ticking = false;
    });
    ticking = true;
  }
});
```

---

### 🟡 LOW: Multiple Concurrent Animation Loops

**File:** `public/index.html` (lines 1464-1467, 1597-1600)

**Problem:** Two separate `requestAnimationFrame` loops run concurrently:
```javascript
// GridAnimation
animate() {
  this.draw();
  this.animationId = requestAnimationFrame(() => this.animate());
}

// GeometricShape
animate() {
  this.draw();
  requestAnimationFrame(() => this.animate());
}
```

**Impact:** Potential for race conditions and inefficient rendering.

**Recommendation:** Consolidate into single animation loop:
```javascript
const animations = [gridAnimation, geoShape];
function animate() {
  animations.forEach(a => a.draw());
  requestAnimationFrame(animate);
}
animate();
```

---

## 6. Minor Issues

### 🟡 LOW: Redundant Session Creation Logic

**File:** `app/api/chat/route.ts` (lines 82-89)

**Problem:** Convoluted session handling:
```typescript
let session = sessionId ? sessionManager.getSession(sessionId) : undefined;
const finalSessionId = sessionId || `session-${Date.now()}-...`;

if (!session && sessionId) {
  session = sessionManager.createSession(finalSessionId, resolvedTenantId);
} else if (!session) {
  session = sessionManager.createSession(finalSessionId, resolvedTenantId);
}
```

**Recommendation:** Simplify:
```typescript
const finalSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
let session = sessionManager.getSession(finalSessionId)
  ?? sessionManager.createSession(finalSessionId, resolvedTenantId);
```

---

### 🟡 LOW: Unnecessary Set Spread

**File:** `app/api/chat/route.ts` (line 158)

**Problem:** Creates Set and immediately spreads:
```typescript
const sources = [...new Set(results.map(r => r.metadata?.source_title).filter(Boolean))];
```

**Impact:** Minor, but creates intermediate array.

**Recommendation:** For small arrays this is fine, but if performance matters:
```typescript
const seen = new Set();
const sources = results
  .map(r => r.metadata?.source_title)
  .filter(title => title && !seen.has(title) && seen.add(title));
```

---

## Summary & Priority Matrix

| Priority | Issue | File | Est. Impact |
|----------|-------|------|-------------|
| 1 | N+1 queries in analytics | `analytics/route.ts` | High - 5x DB calls |
| 2 | O(n²) grid algorithm | `index.html` | High - 3M ops/frame |
| 3 | O(n) in map loop | `dashboard/page.tsx` | Medium - O(n²) |
| 4 | Sequential batch embedding | `embedding-provider.ts` | Medium - latency |
| 5 | Unthrottled events | `index.html` | Medium - CPU |
| 6 | setInterval in serverless | `session-manager.ts` | Medium - memory |
| 7 | Over-fetching 2x data | `knowledge-service.ts` | Low-Medium |
| 8 | Repeated string ops | `knowledge-service.ts` | Low |
| 9 | Utility fn recreation | `dashboard/page.tsx` | Low |
| 10 | Array slice vs shift | `session-manager.ts` | Low |

---

## Next Steps

1. **Immediate:** Fix analytics N+1 queries (biggest DB impact)
2. **Short-term:** Optimize canvas animation algorithms
3. **Medium-term:** Add proper session storage (Redis) for production
4. **Long-term:** Implement embedding caching and connection pooling
