import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/app-shell';

export const metadata: Metadata = {
  title: '不动产抵质押品核对系统 | 省大数据局',
  description: '省大数据局不动产抵质押品核对应答系统，提供抵质押品状态查询、实时核对、数据录入与导出功能',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[#f0f4f8]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
