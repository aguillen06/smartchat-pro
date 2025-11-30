'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Plus, Settings, Trash2, Edit2, Copy, Check, AlertTriangle, TestTube } from 'lucide-react';

interface Widget {
  id: string;
  widget_key: string;
  name: string;
  settings: {
    theme_color?: string;
    welcome_message?: string;
    business_name?: string;
    business_description?: string;
    position?: string;
    collect_email?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    welcomeMessage: '',
    primaryColor: '',
    businessDescription: '',
  });

  useEffect(() => {
    if (user) {
      loadWidgets();
    }
  }, [user]);

  async function loadWidgets() {
    try {
      const response = await fetch('/api/widgets');

      if (!response.ok) {
        console.error('Error loading widgets:', await response.text());
        setLoading(false);
        return;
      }

      const data = await response.json();
      setWidgets(data);
      if (data.length > 0) {
        setSelectedWidget(data[0]);
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit() {
    if (!selectedWidget) return;

    setEditForm({
      name: selectedWidget.name,
      welcomeMessage: selectedWidget.settings.welcome_message || '',
      primaryColor: selectedWidget.settings.theme_color || '#0D9488',
      businessDescription: selectedWidget.settings.business_description || '',
    });
    setIsEditing(true);
  }

  async function handleSave() {
    if (!selectedWidget) return;

    setSaving(true);

    try {
      const response = await fetch('/api/widgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          widgetId: selectedWidget.id,
          name: editForm.name,
          welcomeMessage: editForm.welcomeMessage,
          primaryColor: editForm.primaryColor,
          businessDescription: editForm.businessDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updatedWidget = await response.json();

      // Update local state
      setSelectedWidget(updatedWidget);
      setWidgets(widgets.map(w =>
        w.id === updatedWidget.id ? updatedWidget : w
      ));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(widgetId: string) {
    try {
      const response = await fetch(`/api/widgets?id=${widgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete widget');
      }

      // Remove from local state
      const remainingWidgets = widgets.filter(w => w.id !== widgetId);
      setWidgets(remainingWidgets);

      if (selectedWidget?.id === widgetId) {
        setSelectedWidget(remainingWidgets[0] || null);
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting widget:', error);
      alert('Failed to delete widget');
    }
  }

  function copyEmbedCode() {
    if (!selectedWidget) return;

    const embedCode = getEmbedCode();
    navigator.clipboard.writeText(embedCode);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }

  function getEmbedCode() {
    if (!selectedWidget) return '';

    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return `<!-- SmartChat Pro Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${origin}/widget.js';
    script.setAttribute('data-widget-key', '${selectedWidget.widget_key}');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading widgets...</div>
      </div>
    );
  }

  if (!selectedWidget) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Widgets Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first widget to start engaging with your website visitors.
          </p>
          <Link
            href="/dashboard/widgets/new"
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Widget
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widget Settings</h2>
          <p className="text-gray-600 mt-1">
            Manage and configure your chat widgets
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/test-widget"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Widget
          </Link>
          <Link
            href="/dashboard/widgets/new"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Widget
          </Link>
        </div>
      </div>

      {/* Widget Selector */}
      {widgets.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Widget
          </label>
          <select
            value={selectedWidget.id}
            onChange={(e) => {
              const widget = widgets.find(w => w.id === e.target.value);
              if (widget) {
                setSelectedWidget(widget);
                setIsEditing(false);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {widgets.map((widget) => (
              <option key={widget.id} value={widget.id}>
                {widget.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Widget Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Widget Details</h3>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={startEdit}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium text-sm"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            <button
              onClick={() => setDeleteConfirm(selectedWidget.id)}
              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Widget Name</label>
              <div className="text-gray-900 font-medium">{selectedWidget.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Welcome Message</label>
              <div className="text-gray-900">{selectedWidget.settings.welcome_message}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: selectedWidget.settings.theme_color || '#0D9488' }}
                />
                <span className="font-mono text-sm">{selectedWidget.settings.theme_color || '#0D9488'}</span>
              </div>
            </div>
            {selectedWidget.settings.business_description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Business Description</label>
                <div className="text-gray-900 text-sm">{selectedWidget.settings.business_description}</div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
              <div className="text-gray-900 text-sm">
                {new Date(selectedWidget.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Widget Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
              <input
                type="text"
                value={editForm.welcomeMessage}
                onChange={(e) => setEditForm({ ...editForm, welcomeMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editForm.primaryColor}
                  onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={editForm.primaryColor}
                  onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={editForm.businessDescription}
                onChange={(e) => setEditForm({ ...editForm, businessDescription: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Tell the AI about your business..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Delete Widget?</h4>
              <p className="text-sm text-red-700 mb-4">
                This will permanently delete the widget and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Yes, Delete Widget
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Key */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Key</h3>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all">
          {selectedWidget.widget_key}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This is your unique widget identifier. Keep it secure.
        </p>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Embed Code</h3>
          <button
            onClick={copyEmbedCode}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            {showCopied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </>
            )}
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">{getEmbedCode()}</pre>
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="font-medium text-gray-900">Installation Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Copy the embed code above</li>
            <li>Open your website's HTML file</li>
            <li>Paste the code just before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag</li>
            <li>Save and publish your changes</li>
            <li>The chat widget will appear on your website!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}