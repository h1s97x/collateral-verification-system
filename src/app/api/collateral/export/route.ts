import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const searchParams = request.nextUrl.searchParams;

  const status = searchParams.get('status');
  const verification_status = searchParams.get('verification_status');
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');

  let query = client
    .from('collateral_records')
    .select('id, mortgage_no, property_no, property_type, owner_name, owner_id_no, location, area, estimated_value, status, mortgagee, mortgage_amount, mortgage_start_date, mortgage_end_date, verification_status, last_verified_at, remark, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (verification_status) {
    query = query.eq('verification_status', verification_status);
  }
  if (start_date) {
    query = query.gte('created_at', start_date);
  }
  if (end_date) {
    query = query.lte('created_at', end_date);
  }

  // 导出最多10000条
  query = query.limit(10000);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: `导出查询失败: ${error.message}` }, { status: 500 });
  }

  // 生成 CSV
  const headers = [
    '抵押号', '不动产编号', '不动产类型', '权利人', '证件号',
    '坐落位置', '面积(㎡)', '评估价值(万元)', '状态', '抵押权人',
    '抵押金额(万元)', '抵押开始日期', '抵押结束日期', '核对状态',
    '最后核对时间', '备注', '创建时间',
  ];

  const rows = (data || []).map((r: Record<string, unknown>) => {
    const d = r as Record<string, string | null>;
    return [
      d.mortgage_no,
      d.property_no,
      d.property_type,
      d.owner_name,
      d.owner_id_no || '',
      d.location || '',
      d.area || '',
      d.estimated_value || '',
      d.status,
      d.mortgagee || '',
      d.mortgage_amount || '',
      d.mortgage_start_date ? new Date(d.mortgage_start_date).toLocaleDateString('zh-CN') : '',
      d.mortgage_end_date ? new Date(d.mortgage_end_date).toLocaleDateString('zh-CN') : '',
      d.verification_status,
      d.last_verified_at ? new Date(d.last_verified_at).toLocaleString('zh-CN') : '',
      d.remark || '',
      d.created_at ? new Date(d.created_at).toLocaleString('zh-CN') : '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
  });

  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=collateral_export_${new Date().toISOString().slice(0, 10)}.csv`,
    },
  });
}
