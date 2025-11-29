export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerUser, getServerSupabase } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

interface Conversation {
  id: string;
  visitor_id: string;
  started_at: string;
  last_message_at: string | null;
  messageCount: number;
}

async function loadConversations() {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      redirect('/login');
    }

    // Get user-scoped Supabase client (respects RLS)
    const supabase = await getServerSupabase();

    // Get user's widgets
    const { data: widgets } = await supabase
      .from('widgets')
      .select('id')
      .eq('owner_id', user.id);

    if (!widgets || widgets.length === 0) {
      return [];
    }

    const widgetIds = widgets.map(w => w.id);

    // Get all conversations with message counts
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        visitor_id,
        started_at,
        last_message_at,
        messages (count)
      `)
      .in('widget_id', widgetIds)
      .order('started_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return [];
    }

    return conversations?.map((conv: any) => ({
      id: conv.id,
      visitor_id: conv.visitor_id,
      started_at: conv.started_at,
      last_message_at: conv.last_message_at,
      messageCount: conv.messages?.[0]?.count || 0,
    })) || [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(dateString: string) {
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

export default async function ConversationsPage() {
  const conversations = await loadConversations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Conversations</h2>
          <p className="text-gray-600 mt-1">
            {conversations.length} total conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {conversations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">
              When visitors use your chat widget, their conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <tr
                    key={conversation.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {conversation.visitor_id.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {conversation.visitor_id}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {conversation.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">💬</span>
                        <span className="text-sm font-medium text-gray-900">
                          {conversation.messageCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(conversation.started_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {conversation.last_message_at
                          ? formatRelativeTime(conversation.last_message_at)
                          : formatRelativeTime(conversation.started_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/conversations/${conversation.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
