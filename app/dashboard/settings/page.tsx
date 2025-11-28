'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface WidgetSettings {
  id: string;
  widget_key: string;
  welcome_message: string;
  primary_color: string;
  ai_instructions: string | null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetSettings[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<WidgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadWidgets();
    }
  }, [user]);

  async function loadWidgets() {
    try {
      // For now, we'll fetch from the API endpoint you'll need to create
      // Or we can use a direct Supabase query
      const response = await fetch('/api/user/widgets');

      if (!response.ok) {
        console.error('Error loading widgets:', await response.text());
        setLoading(false);
        return;
      }

      const data = await response.json();
      setWidgets(data);
      if (data.length > 0) {
        setSelectedWidget(data[0]); // Select first widget by default
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedWidget) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/widgets/${selectedWidget.widget_key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          welcome_message: selectedWidget.welcome_message,
          primary_color: selectedWidget.primary_color,
          ai_instructions: selectedWidget.ai_instructions || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updatedWidget = await response.json();
      setSelectedWidget(updatedWidget);

      // Update in list
      setWidgets(widgets.map(w =>
        w.id === updatedWidget.id ? updatedWidget : w
      ));

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
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

    // Use window.location.origin in browser, or NEXT_PUBLIC_APP_URL for SSR/fallback
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return `<!-- SmartChat Pro Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${origin}/widget.js';
    script.setAttribute('data-widget-key', '${selectedWidget.widget_key}');
    script.setAttribute('data-primary-color', '${selectedWidget.primary_color || '#3B82F6'}');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (!selectedWidget) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets found</h3>
          <p className="text-gray-500">
            Create your first widget to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Widget Settings</h2>
        <p className="text-gray-600 mt-1">
          Customize your chatbot's appearance and behavior
        </p>
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
              if (widget) setSelectedWidget(widget);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {widgets.map((widget) => (
              <option key={widget.id} value={widget.id}>
                {widget.widget_key}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
        <div className="space-y-6">
          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <textarea
              value={selectedWidget.welcome_message}
              onChange={(e) => setSelectedWidget({ ...selectedWidget, welcome_message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hi! How can I help you today?"
            />
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedWidget.primary_color || '#3B82F6'}
                onChange={(e) => setSelectedWidget({ ...selectedWidget, primary_color: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedWidget.primary_color || '#3B82F6'}
                onChange={(e) => setSelectedWidget({ ...selectedWidget, primary_color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* AI Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Instructions (Optional)
            </label>
            <textarea
              value={selectedWidget.ai_instructions || ''}
              onChange={(e) => setSelectedWidget({ ...selectedWidget, ai_instructions: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Custom instructions for the AI (leave empty to use default)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Customize how the AI responds. Leave empty to use the default system prompt.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

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
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            {showCopied ? '✓ Copied!' : 'Copy Code'}
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

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> You can customize the widget's appearance using the settings above before embedding it.
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div
            className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-white font-medium shadow-lg"
            style={{ backgroundColor: selectedWidget.primary_color || '#3B82F6' }}
          >
            <span className="text-2xl">💬</span>
            <span>Chat with us</span>
          </div>
          <p className="text-gray-600 mt-4">{selectedWidget.welcome_message}</p>
        </div>
      </div>
    </div>
  );
}
