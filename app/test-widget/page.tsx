'use client';

import Script from 'next/script';

export default function TestWidgetPage() {
  // Example widget key - in production, this would come from the database
  const exampleWidgetKey = 'demo_widget_key_123';

  const embedCode = `<!-- SmartChat Pro Widget -->
<script
  src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget.js"
  data-widget-key="${exampleWidgetKey}"
  data-primary-color="#0EA5E9"
  data-position="bottom-right"
></script>`;

  return (
    <>
      {/* Include the widget on this page */}
      <Script
        src="/widget.js"
        data-widget-key={exampleWidgetKey}
        data-primary-color="#0EA5E9"
        data-position="bottom-right"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              SmartChat Pro Widget Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See the chat widget in action. Click the blue button in the bottom-right corner to start chatting!
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Instant responses powered by Claude AI. No waiting, just intelligent conversations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Intelligent Context
              </h3>
              <p className="text-gray-600">
                Trained on your knowledge base to provide accurate, relevant answers.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mobile Ready
              </h3>
              <p className="text-gray-600">
                Fully responsive design that works beautifully on all devices.
              </p>
            </div>
          </div>

          {/* Embed Instructions */}
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How to Embed
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Step 1: Copy the embed code
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <pre className="text-sm text-gray-100 overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode);
                      alert('Embed code copied to clipboard!');
                    }}
                    className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Step 2: Paste before closing &lt;/body&gt; tag
                </h3>
                <p className="text-gray-600">
                  Add the script tag to your website just before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Configuration Options
                </h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="font-mono text-sm text-gray-900">data-widget-key</code>
                    <span className="text-red-500 ml-2">(required)</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Your unique widget identifier from the dashboard
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="font-mono text-sm text-gray-900">data-primary-color</code>
                    <span className="text-gray-500 ml-2">(optional)</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Hex color code for the widget (default: #0EA5E9)
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="font-mono text-sm text-gray-900">data-position</code>
                    <span className="text-gray-500 ml-2">(optional)</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Widget position: bottom-right, bottom-left, top-right, or top-left (default: bottom-right)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Content for Context */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Sample Product Information
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
              <p className="text-gray-600">
                This is sample content to demonstrate how the widget appears on a real page.
                Try asking the chatbot about our features, pricing, or anything else!
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ AI-powered conversations</li>
                    <li>✓ Customizable branding</li>
                    <li>✓ Knowledge base integration</li>
                    <li>✓ Lead capture</li>
                    <li>✓ Analytics dashboard</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pricing</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Starter: $29/month</li>
                    <li>Professional: $79/month</li>
                    <li>Enterprise: Custom pricing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
