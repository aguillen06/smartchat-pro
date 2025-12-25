// Simple in-memory session storage
// NOTE: For production, use Redis or database with TTL support
// WARNING: In serverless environments (Vercel), setInterval may not work reliably
// as function instances are ephemeral. Consider using external session storage.

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  tenantId: string;
  messages: Message[];
  createdAt: number;
  lastActivity: number;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_MESSAGES = 20; // Keep last 20 messages
  private lastCleanup = Date.now();
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Note: setInterval is unreliable in serverless environments
    // We use lazy cleanup on access as a fallback
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }
  }

  // OPTIMIZED: Lazy cleanup on access for serverless environments
  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  createSession(sessionId: string, tenantId: string): Session {
    this.maybeCleanup();
    const session: Session = {
      id: sessionId,
      tenantId,
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    this.maybeCleanup();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.messages.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // OPTIMIZED: Use shift() for in-place removal instead of slice() which creates new array
    while (session.messages.length > this.MAX_MESSAGES) {
      session.messages.shift();
    }

    session.lastActivity = Date.now();
  }

  getMessages(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    // OPTIMIZED: Collect keys to delete first, then delete (safer iteration)
    const expiredKeys: string[] = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        expiredKeys.push(sessionId);
      }
    }
    for (const key of expiredKeys) {
      this.sessions.delete(key);
    }
  }

  // Get stats for monitoring
  getStats() {
    return {
      activeSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values()).map(s => ({
        id: s.id,
        messageCount: s.messages.length,
        lastActivity: new Date(s.lastActivity).toISOString(),
      })),
    };
  }
}

export const sessionManager = new SessionManager();
