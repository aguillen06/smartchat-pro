'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const WIDGET_KEY = 'demo_widget_key_123';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  created_at: string;
  conversation_id: string;
  conversations?: {
    id: string;
    visitor_id: string;
    started_at: string;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      const response = await fetch(`/api/leads?widgetKey=${WIDGET_KEY}`);

      if (!response.ok) {
        console.error('Error loading leads:', await response.text());
        return;
      }

      const leadsData = await response.json();
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Captured Date', 'Conversation Link'];
    const rows = leads.map(lead => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.source || '',
      new Date(lead.created_at).toLocaleString(),
      `${window.location.origin}/dashboard/conversations/${lead.conversation_id}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Captured</h2>
          <p className="text-gray-600 mt-1">
            Contact information collected from conversations
          </p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Export to CSV
          </button>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {leads.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-500">
              Leads will appear here when visitors share their contact information during conversations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Captured Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name || <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {lead.source || 'chat_prompt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/dashboard/conversations/${lead.conversation_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Conversation →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {leads.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-blue-600 font-medium">Total Leads</div>
              <div className="text-2xl font-bold text-blue-900">{leads.length}</div>
            </div>
            <div>
              <div className="text-sm text-blue-600 font-medium">With Email</div>
              <div className="text-2xl font-bold text-blue-900">
                {leads.filter(l => l.email).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600 font-medium">With Phone</div>
              <div className="text-2xl font-bold text-blue-900">
                {leads.filter(l => l.phone).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
