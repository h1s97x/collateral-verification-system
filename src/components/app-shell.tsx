'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icons as simple SVG components
const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  verify: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  entry: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  sync: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  export: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const navItems = [
  { href: '/', label: '数据总览', icon: Icons.dashboard },
  { href: '/query', label: '信息查询', icon: Icons.search },
  { href: '/verify', label: '状态核对', icon: Icons.verify },
  { href: '/entry', label: '数据录入', icon: Icons.entry },
  { href: '/sync', label: '数据同步', icon: Icons.sync },
];

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 bg-[#1e3a5f] text-white shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#d4a017] flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
              不
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">不动产抵质押品</div>
              <div className="text-xs text-white/60 leading-tight">核对系统</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-white/10 border-l-[3px] border-[#d4a017] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <div className="text-xs text-white/40">省大数据局</div>
          <div className="text-xs text-white/40 mt-1">v1.0.0</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#1e3a5f] text-white flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1"
          aria-label="菜单"
        >
          {mobileOpen ? Icons.close : Icons.menu}
        </button>
        <span className="ml-3 font-semibold text-sm">不动产抵质押品核对系统</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-60 h-full bg-[#1e3a5f] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center px-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#d4a017] flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
                  不
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">不动产抵质押品</div>
                  <div className="text-xs text-white/60 leading-tight">核对系统</div>
                </div>
              </div>
            </div>
            <nav className="py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 border-l-[3px] border-[#d4a017] text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-14">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
