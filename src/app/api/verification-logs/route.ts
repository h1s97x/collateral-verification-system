import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface VerificationLogRow {
  id: string;
  record_id: string;
  verification_type: string;
  verification_result: string;
  discrepancies: string | null;
  verified_by: string | null;
  verified_at: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const searchParams = request.nextUrl.searchParams;

  const record_id = searchParams.get('record_id');
  const verification_result = searchParams.get('verification_result');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

  let query = client
    .from('verification_logs')
    .select('*', { count: 'exact' })
    .order('verified_at', { ascending: false });

  if (record_id) {
    query = query.eq('record_id', record_id);
  }
  if (verification_result) {
    query = query.eq('verification_result', verification_result);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: `查询日志失败: ${error.message}` }, { status: 500 });
  }

  // 获取关联的抵质押品记录信息（避免嵌套查询的 schema cache 问题）
  const logs = (data || []) as VerificationLogRow[];
  const enrichedLogs: Array<Record<string, unknown>> = logs.map((log) => ({
    ...log,
  }));

  if (logs.length > 0) {
    const recordIds = logs.map((l) => l.record_id);
    const { data: records, error: recordsError } = await client
      .from('collateral_records')
      .select('id, mortgage_no, property_no, owner_name')
      .in('id', recordIds);

    if (!recordsError && records) {
      const recordMap = new Map(records.map((r: { id: string }) => [r.id, r]));
      for (let i = 0; i < enrichedLogs.length; i++) {
        enrichedLogs[i].collateral_records = recordMap.get(logs[i].record_id) || null;
      }
    }
  }

  return NextResponse.json({
    data: enrichedLogs,
    pagination: {
      page,
      page_size: pageSize,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / pageSize),
    },
  });
}
