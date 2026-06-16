'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { CollateralRecord, CollateralQuery } from '@/lib/types';
import { RECORD_STATUS, VERIFICATION_STATUS, PROPERTY_TYPES } from '@/lib/types';

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

export default function QueryPage() {
  const [records, setRecords] = useState<CollateralRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // 查询表单
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifFilter, setVerifFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // 导出状态
  const [exporting, setExporting] = useState(false);

  // 详情弹窗
  const [detailRecord, setDetailRecord] = useState<CollateralRecord | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('page_size', String(pageSize));
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);
      if (verifFilter) params.set('verification_status', verifFilter);
      if (typeFilter) params.set('property_type', typeFilter);

      const res = await fetch(`/api/collateral?${params}`);
      const data = await res.json();
      if (data.data) {
        setRecords(data.data);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('查询失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter, verifFilter, typeFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearch = () => {
    setPage(1);
    fetchRecords();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (verifFilter) params.set('verification_status', verifFilter);
      if (typeFilter) params.set('property_type', typeFilter);

      const res = await fetch(`/api/collateral/export?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `抵质押品导出_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1e3a5f]">信息查询</h1>
          <p className="text-sm text-[#64748b] mt-1">通过抵押号、不动产编号、权利人等信息检索抵质押品记录</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm rounded hover:bg-[#2d5a8e] disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? '导出中...' : '导出CSV'}
        </button>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs text-[#64748b] mb-1">关键词搜索</label>
            <input
              type="text"
              placeholder="抵押号/不动产编号/权利人/坐落位置"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">记录状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e]"
            >
              <option value="">全部</option>
              {Object.values(RECORD_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">核对状态</label>
            <select
              value={verifFilter}
              onChange={(e) => setVerifFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e]"
            >
              <option value="">全部</option>
              {Object.values(VERIFICATION_STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">不动产类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e]"
            >
              <option value="">全部</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-[#1e3a5f] text-white text-sm rounded hover:bg-[#2d5a8e]"
          >
            查询
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-[#e2e8f0]">
        <div className="px-5 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
          <span className="text-sm text-[#64748b]">共 {total} 条记录</span>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-[#1e3a5f] text-white text-xs rounded hover:bg-[#2d5a8e] disabled:opacity-50"
          >
            {exporting ? '导出中...' : '导出'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-xs">
                <th className="text-left px-4 py-3 font-medium">抵押号</th>
                <th className="text-left px-4 py-3 font-medium">不动产编号</th>
                <th className="text-left px-4 py-3 font-medium">类型</th>
                <th className="text-left px-4 py-3 font-medium">权利人</th>
                <th className="text-left px-4 py-3 font-medium">坐落位置</th>
                <th className="text-right px-4 py-3 font-medium">评估价值(万)</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">核对</th>
                <th className="text-left px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#94a3b8]">加载中...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#94a3b8]">暂无数据，请调整查询条件</td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={r.id} className={`border-t border-[#f1f5f9] hover:bg-[#f8fafc] ${idx % 2 === 1 ? 'bg-[#f8fafc]' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#2d5a8e]">{r.mortgage_no}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.property_no}</td>
                    <td className="px-4 py-3 text-xs">{r.property_type}</td>
                    <td className="px-4 py-3">{r.owner_name}</td>
                    <td className="px-4 py-3 text-xs text-[#64748b] max-w-[200px] truncate" title={r.location || ''}>{r.location || '-'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{r.estimated_value || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.verification_status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailRecord(r)}
                        className="text-xs text-[#2d5a8e] hover:underline"
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#e2e8f0] flex items-center justify-between">
            <span className="text-xs text-[#64748b]">
              第 {page}/{totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-[#e2e8f0] rounded hover:bg-[#f8fafc] disabled:opacity-40"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-[#e2e8f0] rounded hover:bg-[#f8fafc] disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDetailRecord(null)}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="font-semibold text-[#1e3a5f]">抵质押品详情</h3>
              <button onClick={() => setDetailRecord(null)} className="text-[#94a3b8] hover:text-[#1e293b]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <DetailField label="抵押号" value={detailRecord.mortgage_no} />
              <DetailField label="不动产编号" value={detailRecord.property_no} />
              <DetailField label="不动产类型" value={detailRecord.property_type} />
              <DetailField label="权利人" value={detailRecord.owner_name} />
              <DetailField label="证件号" value={detailRecord.owner_id_no} />
              <DetailField label="坐落位置" value={detailRecord.location} />
              <DetailField label="面积(㎡)" value={detailRecord.area} />
              <DetailField label="评估价值(万元)" value={detailRecord.estimated_value} />
              <DetailField label="抵押权人" value={detailRecord.mortgagee} />
              <DetailField label="抵押金额(万元)" value={detailRecord.mortgage_amount} />
              <DetailField label="抵押开始日期" value={detailRecord.mortgage_start_date ? new Date(detailRecord.mortgage_start_date).toLocaleDateString('zh-CN') : '-'} />
              <DetailField label="抵押结束日期" value={detailRecord.mortgage_end_date ? new Date(detailRecord.mortgage_end_date).toLocaleDateString('zh-CN') : '-'} />
              <div>
                <span className="text-xs text-[#64748b]">记录状态</span>
                <div className="mt-1"><StatusBadge status={detailRecord.status} /></div>
              </div>
              <div>
                <span className="text-xs text-[#64748b]">核对状态</span>
                <div className="mt-1"><StatusBadge status={detailRecord.verification_status} /></div>
              </div>
              <DetailField label="最后核对时间" value={detailRecord.last_verified_at ? new Date(detailRecord.last_verified_at).toLocaleString('zh-CN') : '-'} />
              <DetailField label="备注" value={detailRecord.remark} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-xs text-[#64748b]">{label}</span>
      <p className="mt-1 text-[#1e293b]">{value || '-'}</p>
    </div>
  );
}
