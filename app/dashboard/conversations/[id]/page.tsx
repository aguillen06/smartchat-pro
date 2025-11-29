export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ConversationData {
  id: string;
  visitor_id: string;
  started_at: string;
  last_message_at: string | null;
  messages: Message[];
}

async function loadConversation(conversationId: string): Promise<ConversationData | null> {
  try {
    const supabase = getSupabaseAdmin();

    // Get conversation with all messages
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        id,
        visitor_id,
        started_at,
        last_message_at,
        messages (
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    // Sort messages by created_at
    const sortedMessages = (conversation.messages || []).sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      id: conversation.id,
      visitor_id: conversation.visitor_id,
      started_at: conversation.started_at,
      last_message_at: conversation.last_message_at,
      messages: sortedMessages,
    };
  } catch (error) {
    console.error('Error loading conversation:', error);
    return null;
  }
}

function formatDateTime(dateString: string) {
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

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await loadConversation(id);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/conversations"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Conversations
          </Link>
        </div>
      </div>

      {/* Conversation Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {conversation.visitor_id.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{conversation.visitor_id}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Started {formatDateTime(conversation.started_at)}
              </p>
              <p className="text-sm text-gray-500">
                {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Conversation ID</div>
            <div className="text-sm font-mono text-gray-700">{conversation.id}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
        </div>
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No messages in this conversation yet.
            </div>
          ) : (
            conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-75">
                      {message.role === 'user' ? 'Visitor' : 'AI Assistant'}
                    </span>
                    <span className="text-xs opacity-60">{formatTime(message.created_at)}</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link
          href="/dashboard/conversations"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          ← Back to All Conversations
        </Link>
        <div className="text-sm text-gray-500">
          Last activity:{' '}
          {conversation.last_message_at
            ? formatDateTime(conversation.last_message_at)
            : formatDateTime(conversation.started_at)}
        </div>
      </div>
    </div>
  );
}
