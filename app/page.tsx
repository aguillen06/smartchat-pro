'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Users,
  Clock,
  ChevronRight,
  Check,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Add dot grid animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const dots: { x: number; y: number; baseAlpha: number; currentAlpha: number }[] = [];
    const spacing = 30;
    const margin = 30;

    // Create dots grid
    for (let x = margin; x < canvas.width; x += spacing) {
      for (let y = margin; y < canvas.height; y += spacing) {
        dots.push({
          x,
          y,
          baseAlpha: 0.1,
          currentAlpha: 0.1
        });
      }
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        const distance = Math.sqrt(
          Math.pow(mouseX - dot.x, 2) + Math.pow(mouseY - dot.y, 2)
        );

        const maxDistance = 150;
        if (distance < maxDistance) {
          const intensity = 1 - (distance / maxDistance);
          dot.currentAlpha = dot.baseAlpha + (0.5 * intensity);
        } else {
          dot.currentAlpha += (dot.baseAlpha - dot.currentAlpha) * 0.1;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${dot.currentAlpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [loading, user]);

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
      answer: "Not at all! If you can copy and paste, you can install SmartChat Pro. We handle all the technical complexity for you."
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

  return (
    <div className="min-h-screen bg-white">
      {/* Dot grid canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight">SYMTRI AI</span>
                  <span className="text-[10px] text-gray-500 tracking-widest">INTELLIGENT SYSTEMS</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-black transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-black transition-colors font-medium">
                Pricing
              </a>
              <Link href="/login" className="text-gray-600 hover:text-black transition-colors font-medium">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-all hover:transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-black transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="block text-gray-600 hover:text-black transition-colors font-medium">
              Pricing
            </a>
            <Link href="/login" className="block text-gray-600 hover:text-black transition-colors font-medium">
              Login
            </Link>
            <Link
              href="/signup"
              className="block bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full uppercase tracking-wider">
                SmartChat Pro
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              AI Chat That
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400"> Converts</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Intelligent customer support that works 24/7. Deploy in minutes, not months.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#demo"
                className="border border-gray-300 hover:border-black text-black px-8 py-4 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-0.5"
              >
                See Demo
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              14-day free trial · No credit card required · 5-minute setup
            </p>
          </div>

          {/* Floating gradient orbs */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute left-1/4 top-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features, simple to use
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <MessageSquare className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Conversations</h3>
              <p className="text-gray-600">
                Natural responses using your knowledge base. Train it with your FAQs and product info.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Users className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatic Lead Capture</h3>
              <p className="text-gray-600">
                Collects contact info naturally during conversations without being pushy.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <BarChart3 className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                Track conversations, leads, and analytics. See what your customers are asking about.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Zap className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">5-Minute Setup</h3>
              <p className="text-gray-600">
                Just copy/paste one line of code. Works with any website or platform.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Clock className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
              <p className="text-gray-600">
                Never miss a lead. Your AI assistant works around the clock, every day.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-gray-200 hover:border-emerald-500 transition-all">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Shield className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with 99.9% uptime. Your data is encrypted and protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-xl text-gray-600">
              No technical expertise required
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your account in 30 seconds. Start with a free 14-day trial.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Customize</h3>
              <p className="text-gray-600">
                Add your knowledge base and match your brand colors.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Go Live</h3>
              <p className="text-gray-600">
                Paste one line of code on your website. You're done!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 hover:border-gray-300 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
              <p className="text-gray-600 mb-6">Test drive SmartChat Pro</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>14 days free</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>100 conversations</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>1 widget</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>All features included</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center border border-gray-300 hover:border-black text-black py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Starter */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 hover:border-gray-300 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for small businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>1,000 conversations/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>1 widget</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>Email support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>Lead capture & analytics</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-xl border-2 border-emerald-500 p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">For growing companies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$399</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>5,000 conversations/month</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>3 widgets</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" strokeWidth={2} />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include: AI responses · Lead capture · Dashboard · Analytics · Customization
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      faqOpen[index] ? 'rotate-90' : ''
                    }`}
                  />
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
      <section className="py-24 bg-black text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of businesses using SmartChat Pro
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-lg font-semibold transition-all hover:transform hover:-translate-y-0.5 inline-block"
            >
              Start Your Free Trial
            </Link>
            <a
              href="#pricing"
              className="border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-block"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex flex-col mb-4">
                <span className="text-xl font-bold tracking-tight">SYMTRI AI</span>
                <span className="text-[10px] text-gray-500 tracking-widest">INTELLIGENT SYSTEMS</span>
              </div>
              <p className="text-sm text-gray-600">
                AI-powered customer support for modern businesses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#demo" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-black transition-colors text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-gray-600 hover:text-black transition-colors text-sm">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2025 Symtri AI. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-black transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-black transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}