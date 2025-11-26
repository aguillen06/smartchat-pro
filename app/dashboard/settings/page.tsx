'use client';

import { useEffect, useState } from 'react';

const WIDGET_KEY = 'demo_widget_key_123';

interface WidgetSettings {
  id: string;
  name: string;
  welcome_message: string;
  primary_color: string;
  ai_instructions: string | null;
  widget_key: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch(`/api/widgets/${WIDGET_KEY}`);

      if (!response.ok) {
        console.error('Error loading widget settings:', await response.text());
        return;
      }

      const widget = await response.json();
      setSettings(widget);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/widgets/${WIDGET_KEY}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.name,
          welcome_message: settings.welcome_message,
          primary_color: settings.primary_color,
          ai_instructions: settings.ai_instructions || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updatedWidget = await response.json();
      setSettings(updatedWidget);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function copyEmbedCode() {
    const embedCode = `<!-- SmartChat Pro Widget -->
<script
  src="${window.location.origin}/widget.js"
  data-widget-key="${settings?.widget_key}"
  data-primary-color="${settings?.primary_color || '#3B82F6'}"
  data-position="bottom-right"
></script>`;

    navigator.clipboard.writeText(embedCode);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  const embedCode = `<!-- SmartChat Pro Widget -->
<script
  src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.js"
  data-widget-key="${settings.widget_key}"
  data-primary-color="${settings.primary_color || '#3B82F6'}"
  data-position="bottom-right"
></script>`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Widget Settings</h2>
        <p className="text-gray-600 mt-1">
          Customize your chatbot's appearance and behavior
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
        <div className="space-y-6">
          {/* Widget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Chatbot"
            />
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <textarea
              value={settings.welcome_message}
              onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
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
                value={settings.primary_color || '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.primary_color || '#3B82F6'}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
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
              value={settings.ai_instructions || ''}
              onChange={(e) => setSettings({ ...settings, ai_instructions: e.target.value })}
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
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
          {settings.widget_key}
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
          <pre className="text-sm text-gray-100 font-mono">{embedCode}</pre>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Copy this code and paste it into your website's HTML, just before the closing{' '}
          <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div
            className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-white font-medium shadow-lg"
            style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
          >
            <span className="text-2xl">💬</span>
            <span>{settings.name}</span>
          </div>
          <p className="text-gray-600 mt-4">{settings.welcome_message}</p>
        </div>
      </div>
    </div>
  );
}
