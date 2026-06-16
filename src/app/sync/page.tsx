'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { DataSyncLog } from '@/lib/types';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '成功': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '失败': 'bg-red-50 text-red-700 border-red-200',
    '进行中': 'bg-blue-50 text-blue-700 border-blue-200',
    '超时': 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

export default function SyncPage() {
  const [logs, setLogs] = useState<DataSyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sync?page_size=20');
      const data = await res.json();
      if (data.data) setLogs(data.data);
    } catch (err) {
      console.error('查询日志失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSync = async (syncType: string) => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_type: syncType }),
      });
      const data = await res.json();
      if (data.error) {
        setSyncMessage(`同步失败: ${data.error}`);
      } else {
        setSyncMessage(`同步成功: ${data.data?.message || '数据已更新'}`);
        fetchLogs();
      }
    } catch (err) {
      setSyncMessage('同步请求失败，请重试');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1e3a5f]">数据同步</h1>
        <p className="text-sm text-[#64748b] mt-1">与省大数据局数据接口对接，实现信息互通与数据同步</p>
      </div>

      {/* Sync Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1e3a5f]">增量同步</h3>
              <p className="text-xs text-[#94a3b8]">仅同步变更数据</p>
            </div>
          </div>
          <button
            onClick={() => handleSync('增量同步')}
            disabled={syncing}
            className="w-full px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded hover:bg-[#2d5a8e] disabled:opacity-50"
          >
            {syncing ? '同步中...' : '执行增量同步'}
          </button>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4a017]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#d4a017]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1e3a5f]">全量同步</h3>
              <p className="text-xs text-[#94a3b8]">同步全部数据</p>
            </div>
          </div>
          <button
            onClick={() => handleSync('全量同步')}
            disabled={syncing}
            className="w-full px-4 py-2 border border-[#d4a017] text-[#d4a017] text-sm rounded hover:bg-[#d4a017]/5 disabled:opacity-50"
          >
            {syncing ? '同步中...' : '执行全量同步'}
          </button>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#2d5a8e]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#2d5a8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1e3a5f]">接口对接</h3>
              <p className="text-xs text-[#94a3b8]">对接省局数据接口</p>
            </div>
          </div>
          <button
            onClick={() => handleSync('接口对接')}
            disabled={syncing}
            className="w-full px-4 py-2 border border-[#2d5a8e] text-[#2d5a8e] text-sm rounded hover:bg-[#2d5a8e]/5 disabled:opacity-50"
          >
            {syncing ? '对接中...' : '执行接口对接'}
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`text-sm px-4 py-3 rounded border ${
          syncMessage.includes('成功')
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Sync Logs */}
      <div className="bg-white rounded-lg border border-[#e2e8f0]">
        <div className="px-5 py-3 border-b border-[#e2e8f0]">
          <span className="text-sm font-medium text-[#1e3a5f]">同步日志</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs text-[#64748b]">
                <th className="text-left px-4 py-3 font-medium">同步类型</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-right px-4 py-3 font-medium">记录数</th>
                <th className="text-left px-4 py-3 font-medium">错误信息</th>
                <th className="text-left px-4 py-3 font-medium">开始时间</th>
                <th className="text-left px-4 py-3 font-medium">完成时间</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#94a3b8]">加载中...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#94a3b8]">暂无同步日志</td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id} className={`border-t border-[#f1f5f9] hover:bg-[#f8fafc] ${idx % 2 === 1 ? 'bg-[#fafbfc]' : ''}`}>
                    <td className="px-4 py-3 font-medium text-xs">{log.sync_type}</td>
                    <td className="px-4 py-3"><StatusBadge status={log.sync_status} /></td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{log.records_count ?? '-'}</td>
                    <td className="px-4 py-3 text-xs text-[#dc2626] max-w-[300px] truncate" title={log.error_message || ''}>
                      {log.error_message || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94a3b8]">
                      {log.started_at ? new Date(log.started_at).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94a3b8]">
                      {log.completed_at ? new Date(log.completed_at).toLocaleString('zh-CN') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
