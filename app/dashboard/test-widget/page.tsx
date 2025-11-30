'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Check, Clock, Users, Shield } from 'lucide-react';

interface Widget {
  id: string;
  widget_key: string;
  name: string;
  settings: {
    theme_color?: string;
    welcome_message?: string;
    business_name?: string;
    business_description?: string;
  };
}

export default function TestWidgetPage() {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadWidget();
  }, []);

  async function loadWidget() {
    try {
      const response = await fetch('/api/widgets');
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const widgets = await response.json();
      if (widgets.length > 0) {
        setWidget(widgets[0]);
        // Load the widget script after we have the widget data
        loadWidgetScript(widgets[0]);
      }
    } catch (error) {
      console.error('Error loading widget:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadWidgetScript(widgetData: Widget) {
    // Remove any existing widget scripts first
    const existingScripts = document.querySelectorAll('script[data-widget-key]');
    existingScripts.forEach(script => script.remove());

    // Remove any existing widget containers
    const existingWidgets = document.querySelectorAll('[id^="smartchat-widget"]');
    existingWidgets.forEach(widget => widget.remove());

    // Create and append the widget script
    const script = document.createElement('script');
    script.src = `${window.location.origin}/widget.js`;
    script.setAttribute('data-widget-key', widgetData.widget_key);
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading widget preview...</div>
      </div>
    );
  }

  if (!widget) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Widget Found</h2>
          <p className="text-gray-600 mb-6">
            You need to create a widget before you can test it.
          </p>
          <Link
            href="/dashboard/widgets/new"
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Create Your First Widget
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Instructions Bar */}
      <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
            <span className="text-gray-500">|</span>
            <p className="text-gray-700">
              This is how your <strong>{widget.name}</strong> widget will appear on your website
            </p>
          </div>
          {scriptLoaded && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Check className="w-4 h-4 mr-1" />
              Widget Active
            </span>
          )}
        </div>
      </div>

      {/* Mock Website */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Example Business</span>
            </div>
            <nav className="flex gap-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Services</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-8 py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Our Business
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              This is a preview of how your chat widget will look on your actual website.
              Try clicking the chat icon in the bottom-right corner!
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Get Started
              </button>
              <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Your chat widget provides instant support to visitors any time of day
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Generation</h3>
              <p className="text-gray-600">
                Capture and qualify leads automatically with intelligent conversations
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Powered</h3>
              <p className="text-gray-600">
                Smart responses powered by your knowledge base and business context
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-8 py-16 bg-gray-50 rounded-lg mx-8 mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of businesses using our platform
            </p>
            <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-lg">
              Start Free Trial
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-8 py-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2024 Example Business. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Widget Notice */}
      <div className="fixed bottom-24 right-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600">💡</span>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Your Widget is Active</p>
            <p className="text-sm text-gray-600">
              Look for the chat icon in the bottom-right corner. Click it to test your widget!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}