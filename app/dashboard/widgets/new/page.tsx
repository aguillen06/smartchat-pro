'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bot, Palette, MessageSquare, FileText } from 'lucide-react';

export default function NewWidgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    welcomeMessage: 'Hi! How can we help you today?',
    primaryColor: '#0D9488',
    businessDescription: '',
  });

  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    welcomeMessage: '',
    businessDescription: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      welcomeMessage: '',
      businessDescription: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Assistant name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Assistant name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Assistant name must not exceed 100 characters';
    }

    if (!formData.welcomeMessage.trim()) {
      newErrors.welcomeMessage = 'Welcome message is required';
    } else if (formData.welcomeMessage.trim().length < 10) {
      newErrors.welcomeMessage = 'Welcome message must be at least 10 characters';
    } else if (formData.welcomeMessage.trim().length > 500) {
      newErrors.welcomeMessage = 'Welcome message must not exceed 500 characters';
    }

    if (formData.businessDescription.trim() && formData.businessDescription.trim().length < 20) {
      newErrors.businessDescription = 'Business description should be at least 20 characters if provided';
    } else if (formData.businessDescription.trim().length > 2000) {
      newErrors.businessDescription = 'Business description must not exceed 2000 characters';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.welcomeMessage && !newErrors.businessDescription;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          welcomeMessage: formData.welcomeMessage.trim(),
          primaryColor: formData.primaryColor,
          businessDescription: formData.businessDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create widget');
      }

      const widget = await response.json();

      // Redirect to settings page
      router.push('/dashboard/settings');
    } catch (err: any) {
      console.error('Error creating widget:', err);
      setError(err.message || 'Failed to create widget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, primaryColor: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Your AI Assistant</h1>
        <p className="text-gray-600 mt-2">
          Set up your AI assistant to start engaging with your website visitors
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Widget Name */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Bot className="w-5 h-5 text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Assistant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Customer Support Bot"
                disabled={loading}
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This name is for your reference only and won't be shown to visitors
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.welcomeMessage ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Hi! How can we help you today?"
                disabled={loading}
                maxLength={500}
              />
              {errors.welcomeMessage && (
                <p className="mt-1 text-sm text-red-600">{errors.welcomeMessage}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                The first message visitors will see when they open the chat
              </p>
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleColorChange}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                  placeholder="#0D9488"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  disabled={loading}
                />
                <div
                  className="w-10 h-10 rounded-lg border border-gray-300"
                  style={{ backgroundColor: formData.primaryColor }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This color will be used for the chat widget header and buttons
              </p>
            </div>
          </div>
        </div>

        {/* AI Context */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-teal-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">AI Context</h2>
          </div>

          <div>
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </label>
            <textarea
              id="businessDescription"
              value={formData.businessDescription}
              onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.businessDescription ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Tell the AI about your business, products, services, and any specific information it should know when helping visitors..."
              disabled={loading}
              maxLength={2000}
            />
            {errors.businessDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.businessDescription}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This helps the AI provide more accurate and relevant responses to your visitors ({formData.businessDescription.length}/2000)
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm">
            <div
              className="p-4 text-white"
              style={{ backgroundColor: formData.primaryColor }}
            >
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                <span className="font-semibold">Chat Support</span>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                {formData.welcomeMessage || 'Your welcome message will appear here'}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating AI Assistant...
              </span>
            ) : (
              'Create AI Assistant'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}