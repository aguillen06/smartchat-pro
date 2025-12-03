'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 ${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">SYMTRI AI</span>
                <span className="text-[9px] text-gray-500 tracking-widest">SMARTCHAT PRO</span>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mx-auto p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }
                  ${!sidebarOpen && 'justify-center'}
                `}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  Free Plan
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">SYMTRI AI</span>
                <span className="text-[9px] text-gray-500 tracking-widest">SMARTCHAT PRO</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Free Plan
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className={`${sidebarOpen ? 'md:pl-64' : 'md:pl-20'} transition-all duration-200`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {navigation.find(item =>
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            )?.name || 'Dashboard'}
          </h1>
        </header>

        {/* Page content */}
        <div className="p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}