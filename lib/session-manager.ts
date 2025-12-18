// Simple in-memory session storage
// For production, use Redis or database

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

  constructor() {
    // Clean up old sessions every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  createSession(sessionId: string, tenantId: string): Session {
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
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.messages.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Keep only last MAX_MESSAGES
    if (session.messages.length > this.MAX_MESSAGES) {
      session.messages = session.messages.slice(-this.MAX_MESSAGES);
    }

    session.lastActivity = Date.now();
  }

  getMessages(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  private cleanup() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
      }
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
