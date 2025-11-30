export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerUser, getServerSupabase } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  conversationsToday: number;
}

interface RecentConversation {
  id: string;
  visitor_id: string;
  started_at: string;
  last_message_at: string;
  messageCount: number;
}

async function loadDashboardData() {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      redirect('/login');
    }

    console.log('🔍 [Dashboard] Loading data for user:', user.id, user.email);

    // Get user-scoped Supabase client (respects RLS)
    const supabase = await getServerSupabase();

    // Get user's widgets
    const { data: widgets, error: widgetsError } = await supabase
      .from('widgets')
      .select('id, widget_key, welcome_message, primary_color')
      .eq('owner_id', user.id);

    if (widgetsError) {
      console.error('❌ [Dashboard] Error fetching widgets:', widgetsError);
      return null;
    }

    if (!widgets || widgets.length === 0) {
      console.log('⚠️ [Dashboard] No widgets found for user');
      return {
        stats: {
          totalConversations: 0,
          totalMessages: 0,
          totalLeads: 0,
          conversationsToday: 0,
        },
        recentConversations: [],
        widgets: [],
      };
    }

    const widgetIds = widgets.map(w => w.id);
    console.log('✅ [Dashboard] Found', widgets.length, 'widget(s)');

    // Get total conversations across all user's widgets
    const { count: conversationCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('widget_id', widgetIds);

    // Get total messages
    const { data: conversationIds } = await supabase
      .from('conversations')
      .select('id')
      .in('widget_id', widgetIds);

    const convIds = conversationIds?.map(c => c.id) || [];
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds);

    // Get total leads
    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('widget_id', widgetIds);

    // Get conversations today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('widget_id', widgetIds)
      .gte('started_at', today.toISOString());

    const statsData = {
      totalConversations: conversationCount || 0,
      totalMessages: messageCount || 0,
      totalLeads: leadCount || 0,
      conversationsToday: todayCount || 0,
    };

    // Get recent conversations with message counts
    const { data: conversations } = await supabase
      .from('conversations')
      .select(`
        id,
        visitor_id,
        started_at,
        last_message_at,
        messages (count)
      `)
      .in('widget_id', widgetIds)
      .order('started_at', { ascending: false })
      .limit(5);

    const formattedConversations = conversations?.map((conv: any) => ({
      id: conv.id,
      visitor_id: conv.visitor_id,
      started_at: conv.started_at,
      last_message_at: conv.last_message_at,
      messageCount: conv.messages?.[0]?.count || 0,
    })) || [];

    return {
      stats: statsData,
      recentConversations: formattedConversations,
      widgets,
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return null;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function DashboardOverview() {
  const data = await loadDashboardData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading dashboard data. Check server logs.</div>
      </div>
    );
  }

  const { stats, recentConversations, widgets } = data;

  return (
    <div className="space-y-6">
      {/* No Widgets Warning */}
      {widgets.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">No widgets found</h3>
              <p className="text-sm text-yellow-700 mb-3">
                You don't have any chat widgets yet. Create one to start collecting conversations and leads.
              </p>
              <Link
                href="/dashboard/widgets/new"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Create Your First Widget →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalConversations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMessages}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✉️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Captured</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.conversationsToday}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
          <Link
            href="/dashboard/conversations"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentConversations.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No conversations yet. The chat widget is ready to receive messages!
            </div>
          ) : (
            recentConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard/conversations/${conversation.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {conversation.visitor_id.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {conversation.visitor_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {conversation.messageCount} messages
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(conversation.last_message_at || conversation.started_at)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/knowledge"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-semibold text-gray-900 mb-2">Manage Knowledge Base</h3>
          <p className="text-sm text-gray-600">
            Add or update documents to improve AI responses
          </p>
        </Link>

        <Link
          href="/dashboard/settings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-semibold text-gray-900 mb-2">Widget Settings</h3>
          <p className="text-sm text-gray-600">
            Customize appearance and AI behavior
          </p>
        </Link>

        <Link
          href="/dashboard/test-widget"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">🧪</div>
          <h3 className="font-semibold text-gray-900 mb-2">Test Widget</h3>
          <p className="text-sm text-gray-600">
            Try out your chatbot in a live demo
          </p>
        </Link>
      </div>
    </div>
  );
}
