'use client';

import React, { useEffect, useState } from 'react';
import type { DashboardStats } from '@/lib/types';

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#64748b] font-medium">{label}</p>
          <p className="text-2xl font-semibold mt-2 text-[#1e293b]">{value}</p>
          {sub && <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '核对一致': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '核对不一致': 'bg-red-50 text-red-700 border-red-200',
    '核对异常': 'bg-orange-50 text-orange-700 border-orange-200',
    '待核对': 'bg-slate-50 text-slate-600 border-slate-200',
    '有效': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '注销': 'bg-red-50 text-red-700 border-red-200',
    '变更': 'bg-amber-50 text-amber-700 border-amber-200',
    '待核实': 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<Array<Record<string, unknown>>>([]);
  const [recentLogs, setRecentLogs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, recordsRes, logsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/collateral?page_size=5'),
          fetch('/api/verification-logs?page_size=5'),
        ]);
        const statsData = await statsRes.json();
        const recordsData = await recordsRes.json();
        const logsData = await logsRes.json();

        if (statsData.data) setStats(statsData.data);
        if (recordsData.data) setRecentRecords(recordsData.data);
        if (logsData.data) setRecentLogs(logsData.data);
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#1e3a5f]">数据总览</h1>
        <p className="text-sm text-[#64748b] mt-1">不动产抵质押品核对系统运行概览</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="抵质押品总数"
          value={stats?.total_records || 0}
          color="bg-[#1e3a5f]/10"
          icon={
            <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          sub={`有效 ${stats?.valid_records || 0} 条`}
        />
        <StatCard
          label="待核对记录"
          value={stats?.pending_verification || 0}
          color="bg-amber-50"
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="核对不一致"
          value={stats?.inconsistent_records || 0}
          color="bg-red-50"
          icon={
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          label="今日核对"
          value={stats?.today_verified || 0}
          color="bg-emerald-50"
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          sub={`同步 ${stats?.today_synced || 0} 次`}
        />
      </div>

      {/* Recent Records & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Records */}
        <div className="bg-white rounded-lg border border-[#e2e8f0]">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[#1e3a5f]">最近录入记录</h2>
            <a href="/query" className="text-xs text-[#2d5a8e] hover:underline">查看全部</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs text-[#64748b]">
                  <th className="text-left px-5 py-3 font-medium">抵押号</th>
                  <th className="text-left px-5 py-3 font-medium">权利人</th>
                  <th className="text-left px-5 py-3 font-medium">状态</th>
                  <th className="text-left px-5 py-3 font-medium">核对</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#94a3b8]">暂无数据</td>
                  </tr>
                ) : (
                  recentRecords.map((r) => (
                    <tr key={String(r.id)} className="border-t border-[#f1f5f9] hover:bg-[#f8fafc]">
                      <td className="px-5 py-3 font-mono text-xs">{String(r.mortgage_no)}</td>
                      <td className="px-5 py-3">{String(r.owner_name)}</td>
                      <td className="px-5 py-3"><StatusBadge status={String(r.status)} /></td>
                      <td className="px-5 py-3"><StatusBadge status={String(r.verification_status)} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Verification Logs */}
        <div className="bg-white rounded-lg border border-[#e2e8f0]">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[#1e3a5f]">最近核对日志</h2>
            <a href="/verify" className="text-xs text-[#2d5a8e] hover:underline">查看全部</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs text-[#64748b]">
                  <th className="text-left px-5 py-3 font-medium">抵押号</th>
                  <th className="text-left px-5 py-3 font-medium">核对类型</th>
                  <th className="text-left px-5 py-3 font-medium">结果</th>
                  <th className="text-left px-5 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#94a3b8]">暂无核对记录</td>
                  </tr>
                ) : (
                  recentLogs.map((log) => {
                    const record = log.collateral_records as Record<string, string> | null;
                    return (
                      <tr key={String(log.id)} className="border-t border-[#f1f5f9] hover:bg-[#f8fafc]">
                        <td className="px-5 py-3 font-mono text-xs">{record?.mortgage_no || '-'}</td>
                        <td className="px-5 py-3">{String(log.verification_type)}</td>
                        <td className="px-5 py-3"><StatusBadge status={String(log.verification_result)} /></td>
                        <td className="px-5 py-3 text-xs text-[#94a3b8]">
                          {log.verified_at ? new Date(String(log.verified_at)).toLocaleString('zh-CN') : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
