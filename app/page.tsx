'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Add smooth scrolling
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll as any);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleSmoothScroll as any);
      });
    };
  }, [loading, user]);

  // Embed the SmartChat widget for demo
  useEffect(() => {
    // Only load widget if not authenticated and not loading
    if (!loading && !user) {
      // Check if widget script already exists
      const existingScript = document.querySelector('script[data-widget-key]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://smartchat-pro-ohmk.vercel.app/widget.js';
        script.setAttribute('data-widget-key', 'demo_widget_key_123');
        script.setAttribute('data-primary-color', '#0D9488');
        script.async = true;
        document.body.appendChild(script);

        // Cleanup function to remove script when component unmounts
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
          // Also remove the widget iframe if it exists
          const widgetContainer = document.getElementById('smartchat-widget-container');
          if (widgetContainer && widgetContainer.parentNode) {
            widgetContainer.parentNode.removeChild(widgetContainer);
          }
        };
      }
    }
  }, [loading, user]);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Redirecting to dashboard...</div>
      </div>
    );
  }

  const faqs = [
    {
      question: "How long does setup take?",
      answer: "Setup takes literally 5 minutes. Create your account, customize your widget, and paste one line of code on your website. That's it!"
    },
    {
      question: "Do I need coding skills?",
      answer: "Not at all! If you can copy and paste, you can install Symtri AI SmartChat. We handle all the technical complexity for you."
    },
    {
      question: "What happens after my free trial?",
      answer: "After your 14-day free trial, you can choose to upgrade to a paid plan or your widget will be deactivated. No surprise charges!"
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! There are no contracts or cancellation fees. You can cancel your subscription anytime from your dashboard."
    }
  ];

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags would go in layout.tsx or use next/head */}

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  Symtri AI
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-teal-600 transition-colors">
                Pricing
              </a>
              <Link href="/login" className="text-gray-700 hover:text-teal-600 transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-teal-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-lime-100 text-lime-800 rounded-full">
                Symtri AI SmartChat
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Chat Support
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                for Your Website
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Convert more visitors into customers with intelligent chatbots that capture leads 24/7.
              Deploy in minutes, not months.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                Start Free Trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#demo"
                className="border-2 border-gray-300 hover:border-teal-600 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              14-day free trial • No credit card required • Setup in 5 minutes
            </p>
          </div>

          {/* Hero Widget Mockup */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              {/* Browser window frame */}
              <div className="bg-gray-200 rounded-t-lg p-2 flex items-center gap-2 px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 ml-2">
                  yourwebsite.com
                </div>
              </div>
              {/* Website content with widget */}
              <div className="bg-white rounded-b-lg shadow-2xl p-8 w-96">
                <div className="space-y-3 mb-4">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>

                {/* Chat widget mockup */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mt-8">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Symtri AI SmartChat</p>
                      <p className="text-xs text-green-600">● Online</p>
                    </div>
                  </div>

                  {/* Sample conversation */}
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                      <p className="text-gray-700">Hi! How can I help you today?</p>
                    </div>
                    <div className="bg-teal-600 rounded-lg p-2 max-w-[80%] ml-auto">
                      <p className="text-white">What are your business hours?</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                      <p className="text-gray-700">We're open Monday-Friday, 9AM-6PM CST!</p>
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-xs"
                      disabled
                    />
                    <button className="bg-teal-600 text-white p-1.5 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The AI Adoption Challenge
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <p className="text-gray-700">
                    <strong>77% of SMBs</strong> want to adopt AI for customer service
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">❌</span>
                  <p className="text-gray-700">
                    <strong>85% of AI projects fail</strong> due to complexity and cost
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-500 text-xl">⏰</span>
                  <p className="text-gray-700">
                    <strong>6-12 months</strong> average implementation time for enterprise solutions
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-teal-600 mb-4">
                The Symtri AI SmartChat Solution
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-lime-500 text-xl">✅</span>
                  <p className="text-gray-700">
                    <strong>Deploy in 5 minutes</strong>, not months
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lime-500 text-xl">✅</span>
                  <p className="text-gray-700">
                    <strong>No coding required</strong> - just copy & paste
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lime-500 text-xl">✅</span>
                  <p className="text-gray-700">
                    <strong>Affordable pricing</strong> starting at $199/month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Delight Customers
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features that are simple to use
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group hover:bg-teal-50 p-6 rounded-lg transition-colors">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Conversations</h3>
              <p className="text-gray-600">
                Natural responses using your knowledge base. Train it with your FAQs and product info.
              </p>
            </div>

            <div className="group hover:bg-teal-50 p-6 rounded-lg transition-colors">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2">Automatic Lead Capture</h3>
              <p className="text-gray-600">
                Collects contact info naturally during conversations without being pushy.
              </p>
            </div>

            <div className="group hover:bg-teal-50 p-6 rounded-lg transition-colors">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Dashboard</h3>
              <p className="text-gray-600">
                Track conversations, leads, and analytics. See what your customers are asking about.
              </p>
            </div>

            <div className="group hover:bg-teal-50 p-6 rounded-lg transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">5-Minute Setup</h3>
              <p className="text-gray-600">
                Just copy/paste one line of code. Works with any website or platform.
              </p>
            </div>

            <div className="group hover:bg-teal-50 p-6 rounded-lg transition-colors">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Fully Customizable</h3>
              <p className="text-gray-600">
                Match your brand colors and style. Customize welcome messages and responses.
              </p>
            </div>

            <div className="group hover:bg-teal-50 p-6 rounded-lg transition-colors">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with 99.9% uptime. Your data is encrypted and protected.
              </p>
            </div>
          </div>

          {/* Coming Soon - Multilingual Feature */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-teal-50 to-lime-50 rounded-lg p-8 border border-teal-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl">🌐</span>
                <h3 className="text-2xl font-bold text-gray-900">Multilingual Support Coming Soon</h3>
                <span className="bg-lime-500 text-white px-2 py-1 rounded-full text-xs font-semibold">NEW</span>
              </div>
              <p className="text-gray-700 mb-4">
                Connect with customers globally in their preferred language
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  🇺🇸 English
                </span>
                <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  🇪🇸 Español
                </span>
                <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  🇲🇽 Spanish (Mexico)
                </span>
                <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  🇫🇷 Français
                </span>
                <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  More languages...
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Automatic language detection • Seamless switching • Cultural context awareness
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              No technical expertise required
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account in 30 seconds. Start with a free 14-day trial.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Customize</h3>
              <p className="text-gray-600">
                Add your knowledge base and match your brand colors.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Go Live</h3>
              <p className="text-gray-600">
                Paste one line of code on your website. You're done!
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="bg-lime-500 hover:bg-lime-600 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              Start Your Free Trial Now
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
              <p className="text-gray-600 mb-4">Test drive Symtri AI SmartChat</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>14 days free</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>100 conversations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>1 widget</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>All features included</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Starter */}
            <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-600 mb-4">Perfect for small businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>1,000 conversations/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>1 widget</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Email support</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Lead capture & analytics</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-teal-500 rounded-lg p-8 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 mb-4">For growing companies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$399</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>5,000 conversations/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>3 widgets</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-lime-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-lime-500 hover:bg-lime-600 text-gray-900 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              All plans include: AI responses • Lead capture • Dashboard • Analytics • Customization
            </p>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try It Now - Live Demo
            </h2>
            <p className="text-xl text-gray-600">
              Click the chat bubble in the corner to test Symtri AI SmartChat
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="bg-gradient-to-br from-teal-50 to-lime-50 rounded-lg p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
                  <span className="text-5xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Widget is Live on This Page!
                </h3>
                <p className="text-lg text-gray-700 mb-2">
                  The Symtri AI SmartChat widget is already embedded and working.
                </p>
                <p className="text-gray-600 mb-6">
                  Look for the teal chat bubble in the bottom-right corner of your screen!
                </p>

                {/* Arrow pointing to corner */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium">
                      Click the chat bubble to try it →
                    </div>
                    <div className="absolute -bottom-2 right-0 text-teal-600">
                      <svg className="w-12 h-12 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Features of the demo */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-teal-600 mb-1">⚡</div>
                    <p className="text-gray-700 font-medium">Instant Responses</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-teal-600 mb-1">🤖</div>
                    <p className="text-gray-700 font-medium">AI-Powered</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-teal-600 mb-1">📧</div>
                    <p className="text-gray-700 font-medium">Lead Capture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of businesses across the globe improving their customer service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Symtri AI SmartChat has transformed our customer service. We're capturing 3x more leads than before!"
              </p>
              <p className="text-sm text-gray-600">
                <strong>Sarah Johnson</strong><br />
                Fashion Boutique Owner, New York
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Setup took literally 5 minutes. Our customers love the instant responses!"
              </p>
              <p className="text-sm text-gray-600">
                <strong>Miguel Rodriguez</strong><br />
                Restaurant Chain CEO, Mexico City
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The analytics help us understand what our customers need. Worth every penny!"
              </p>
              <p className="text-sm text-gray-600">
                <strong>Sophie Laurent</strong><br />
                E-commerce Director, Paris
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      faqOpen[index] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen[index] && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Convert More Visitors into Customers?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join hundreds of businesses using Symtri AI SmartChat to delight their customers
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white hover:bg-gray-100 text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              Start Your Free Trial
            </Link>
            <a
              href="#pricing"
              className="border-2 border-white hover:bg-white hover:text-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              View Pricing
            </a>
          </div>
          <p className="text-teal-100 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent mb-4">
                Symtri AI
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                SmartChat by Symtri AI
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Intelligent AI solutions for businesses worldwide
              </p>
              <p className="text-sm text-gray-400">
                🌍 Supporting businesses globally
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-teal-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-teal-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-teal-400 transition-colors">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-teal-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-teal-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-teal-400 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="hover:text-teal-400 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-teal-400 transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © 2025 Symtri AI LLC. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}