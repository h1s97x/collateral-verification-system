'use client';

import React, { useState } from 'react';
import type { CollateralInsert } from '@/lib/types';
import { PROPERTY_TYPES, RECORD_STATUS } from '@/lib/types';

export default function EntryPage() {
  const [form, setForm] = useState<CollateralInsert>({
    mortgage_no: '',
    property_no: '',
    property_type: '住宅',
    owner_name: '',
    status: '有效',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof CollateralInsert, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.mortgage_no.trim()) {
      setError('抵押号不能为空');
      return;
    }
    if (!form.property_no.trim()) {
      setError('不动产编号不能为空');
      return;
    }
    if (!form.owner_name.trim()) {
      setError('权利人不能为空');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/collateral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setForm({
            mortgage_no: '',
            property_no: '',
            property_type: '住宅',
            owner_name: '',
            status: '有效',
          });
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError('提交失败，请重试');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1e3a5f]">数据录入</h1>
        <p className="text-sm text-[#64748b] mt-1">录入不动产抵质押品信息，录入后自动进入待核对状态</p>
      </div>

      <div className="bg-white rounded-lg border border-[#e2e8f0] max-w-3xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息区 */}
          <div>
            <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4 pb-2 border-b border-[#e2e8f0]">基本信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                label="抵押号"
                required
                value={form.mortgage_no}
                onChange={(v) => handleChange('mortgage_no', v)}
                placeholder="请输入抵押号"
              />
              <FormField
                label="不动产编号"
                required
                value={form.property_no}
                onChange={(v) => handleChange('property_no', v)}
                placeholder="请输入不动产编号"
              />
              <div>
                <label className="block text-xs text-[#64748b] mb-1">
                  不动产类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.property_type}
                  onChange={(e) => handleChange('property_type', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <FormField
                label="权利人"
                required
                value={form.owner_name}
                onChange={(v) => handleChange('owner_name', v)}
                placeholder="请输入权利人姓名"
              />
            </div>
          </div>

          {/* 权利人信息 */}
          <div>
            <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4 pb-2 border-b border-[#e2e8f0]">权利人信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                label="权利人证件号"
                value={form.owner_id_no || ''}
                onChange={(v) => handleChange('owner_id_no', v)}
                placeholder="请输入证件号"
              />
              <FormField
                label="坐落位置"
                value={form.location || ''}
                onChange={(v) => handleChange('location', v)}
                placeholder="请输入不动产坐落位置"
              />
            </div>
          </div>

          {/* 价值信息 */}
          <div>
            <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4 pb-2 border-b border-[#e2e8f0]">价值信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                label="面积(㎡)"
                value={form.area || ''}
                onChange={(v) => handleChange('area', v)}
                placeholder="请输入面积"
                type="number"
              />
              <FormField
                label="评估价值(万元)"
                value={form.estimated_value || ''}
                onChange={(v) => handleChange('estimated_value', v)}
                placeholder="请输入评估价值"
                type="number"
              />
            </div>
          </div>

          {/* 抵押信息 */}
          <div>
            <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4 pb-2 border-b border-[#e2e8f0]">抵押信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                label="抵押权人"
                value={form.mortgagee || ''}
                onChange={(v) => handleChange('mortgagee', v)}
                placeholder="请输入抵押权人名称"
              />
              <FormField
                label="抵押金额(万元)"
                value={form.mortgage_amount || ''}
                onChange={(v) => handleChange('mortgage_amount', v)}
                placeholder="请输入抵押金额"
                type="number"
              />
              <div>
                <label className="block text-xs text-[#64748b] mb-1">抵押开始日期</label>
                <input
                  type="date"
                  value={form.mortgage_start_date ? form.mortgage_start_date.slice(0, 10) : ''}
                  onChange={(e) => handleChange('mortgage_start_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#64748b] mb-1">抵押结束日期</label>
                <input
                  type="date"
                  value={form.mortgage_end_date ? form.mortgage_end_date.slice(0, 10) : ''}
                  onChange={(e) => handleChange('mortgage_end_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
                />
              </div>
            </div>
          </div>

          {/* 其他 */}
          <div>
            <h3 className="text-sm font-semibold text-[#1e3a5f] mb-4 pb-2 border-b border-[#e2e8f0]">其他信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-xs text-[#64748b] mb-1">记录状态</label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
                >
                  {Object.values(RECORD_STATUS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#64748b] mb-1">备注</label>
                <input
                  type="text"
                  value={form.remark || ''}
                  onChange={(e) => handleChange('remark', e.target.value)}
                  placeholder="请输入备注信息"
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
                />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded">
              录入成功！记录已进入待核对状态。
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setForm({ mortgage_no: '', property_no: '', property_type: '住宅', owner_name: '', status: '有效' })}
              className="px-5 py-2 border border-[#e2e8f0] text-sm rounded hover:bg-[#f8fafc] text-[#64748b]"
            >
              重置
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#1e3a5f] text-white text-sm rounded hover:bg-[#2d5a8e] disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交录入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#64748b] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[#e2e8f0] rounded text-sm focus:outline-none focus:border-[#2d5a8e] focus:ring-1 focus:ring-[#2d5a8e]"
      />
    </div>
  );
}
