'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { CollateralRecord } from '@/lib/types';
import { VERIFICATION_STATUS } from '@/lib/types';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    '核对一致': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '核对不一致': 'bg-red-50 text-red-700 border-red-200',
    '核对异常': 'bg-orange-50 text-orange-700 border-orange-200',
    '待核对': 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

export default function VerifyPage() {
  const [records, setRecords] = useState<CollateralRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResults, setVerifyResults] = useState<Array<Record<string, unknown>>>([]);
  const [showResults, setShowResults] = useState(false);
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collateral?verification_status=待核对&page_size=50');
      const data = await res.json();
      if (data.data) setRecords(data.data);
    } catch (err) {
      console.error('查询失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/verification-logs?page_size=10');
      const data = await res.json();
      if (data.data) setLogs(data.data);
    } catch (err) {
      console.error('查询日志失败:', err);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchLogs();
  }, [fetchPending, fetchLogs]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const handleVerify = async () => {
    if (selectedIds.size === 0) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/collateral/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_ids: Array.from(selectedIds), verified_by: '操作员' }),
      });
      const data = await res.json();
      if (data.data) {
        setVerifyResults(data.data);
        setShowResults(true);
        setSelectedIds(new Set());
        fetchPending();
        fetchLogs();
      }
    } catch (err) {
      console.error('核对失败:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1e3a5f]">状态核对</h1>
          <p className="text-sm text-[#64748b] mt-1">选择待核对记录，与省大数据局数据接口进行实时比对</p>
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying || selectedIds.size === 0}
          className="flex items-center gap-2 px-5 py-2 bg-[#1e3a5f] text-white text-sm rounded hover:bg-[#2d5a8e] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {verifying ? '核对中...' : `核对 (${selectedIds.size})`}
        </button>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-lg border border-[#e2e8f0]">
        <div className="px-5 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#1e3a5f]">待核对队列</span>
            <span className="text-xs text-[#64748b] bg-[#f0f4f8] px-2 py-0.5 rounded">{records.length} 条</span>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#64748b] cursor-pointer">
            <input
              type="checkbox"
              checked={records.length > 0 && selectedIds.size === records.length}
              onChange={toggleAll}
              className="rounded border-[#e2e8f0]"
            />
            全选
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs text-[#64748b]">
                <th className="text-left px-4 py-3 font-medium w-10"></th>
                <th className="text-left px-4 py-3 font-medium">抵押号</th>
                <th className="text-left px-4 py-3 font-medium">不动产编号</th>
                <th className="text-left px-4 py-3 font-medium">类型</th>
                <th className="text-left px-4 py-3 font-medium">权利人</th>
                <th className="text-left px-4 py-3 font-medium">记录状态</th>
                <th className="text-left px-4 py-3 font-medium">核对状态</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#94a3b8]">加载中...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#94a3b8]">暂无待核对记录</td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={r.id} className={`border-t border-[#f1f5f9] hover:bg-[#f8fafc] ${selectedIds.has(r.id) ? 'bg-[#1e3a5f]/5' : ''} ${idx % 2 === 1 ? 'bg-[#fafbfc]' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="rounded border-[#e2e8f0]"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#2d5a8e]">{r.mortgage_no}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.property_no}</td>
                    <td className="px-4 py-3 text-xs">{r.property_type}</td>
                    <td className="px-4 py-3">{r.owner_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.verification_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Results Modal */}
      {showResults && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowResults(false)}>
          <div className="bg-white rounded-lg w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0]">
              <h3 className="font-semibold text-[#1e3a5f]">核对结果</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-semibold text-emerald-700">
                    {verifyResults.filter((r) => r.verification_result === '核对一致').length}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">一致</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-semibold text-red-700">
                    {verifyResults.filter((r) => r.verification_result === '核对不一致').length}
                  </div>
                  <div className="text-xs text-red-600 mt-1">不一致</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-semibold text-orange-700">
                    {verifyResults.filter((r) => r.verification_result === '核对异常').length}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">异常</div>
                </div>
              </div>

              {/* Detail Results */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {verifyResults.map((r) => (
                  <div key={String(r.record_id)} className="flex items-start gap-3 p-3 bg-[#f8fafc] rounded">
                    <StatusBadge status={String(r.verification_result)} />
                    <div>
                      <div className="text-sm font-medium">{String(r.mortgage_no)}</div>
                      {String(r.discrepancies || '') !== '' && (
                        <div className="text-xs text-[#dc2626] mt-1">{String(r.discrepancies)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowResults(false)}
                className="w-full px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded hover:bg-[#2d5a8e]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Verification Logs */}
      <div className="bg-white rounded-lg border border-[#e2e8f0]">
        <div className="px-5 py-3 border-b border-[#e2e8f0]">
          <span className="text-sm font-medium text-[#1e3a5f]">最近核对日志</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs text-[#64748b]">
                <th className="text-left px-4 py-3 font-medium">抵押号</th>
                <th className="text-left px-4 py-3 font-medium">核对类型</th>
                <th className="text-left px-4 py-3 font-medium">核对结果</th>
                <th className="text-left px-4 py-3 font-medium">差异说明</th>
                <th className="text-left px-4 py-3 font-medium">核对人</th>
                <th className="text-left px-4 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#94a3b8]">暂无核对日志</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const record = log.collateral_records as Record<string, string> | null;
                  return (
                    <tr key={String(log.id)} className="border-t border-[#f1f5f9] hover:bg-[#f8fafc]">
                      <td className="px-4 py-3 font-mono text-xs">{record?.mortgage_no || '-'}</td>
                      <td className="px-4 py-3 text-xs">{String(log.verification_type)}</td>
                      <td className="px-4 py-3"><StatusBadge status={String(log.verification_result)} /></td>
                      <td className="px-4 py-3 text-xs text-[#64748b] max-w-[300px] truncate" title={String(log.discrepancies || '')}>
                        {String(log.discrepancies || '-')}
                      </td>
                      <td className="px-4 py-3 text-xs">{String(log.verified_by || '-')}</td>
                      <td className="px-4 py-3 text-xs text-[#94a3b8]">
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
  );
}
