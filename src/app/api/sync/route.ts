import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const searchParams = request.nextUrl.searchParams;

  const sync_status = searchParams.get('sync_status');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

  let query = client
    .from('data_sync_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (sync_status) {
    query = query.eq('sync_status', sync_status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: `查询同步日志失败: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      page_size: pageSize,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const client = getSupabaseClient();
  const body = await request.json();
  const sync_type = body.sync_type || '增量同步';

  // 创建同步日志
  const { data: syncLog, error: insertError } = await client
    .from('data_sync_logs')
    .insert({
      sync_type,
      sync_status: '进行中',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: `创建同步任务失败: ${insertError.message}` }, { status: 500 });
  }

  // 模拟与省大数据局数据接口对接同步
  // 实际生产环境中，此处应调用省局数据同步接口
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    const recordsCount = Math.floor(10 + Math.random() * 90);

    // 更新同步日志为成功
    const { error: updateError } = await client
      .from('data_sync_logs')
      .update({
        sync_status: '成功',
        records_count: recordsCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLog.id);

    if (updateError) {
      console.error(`更新同步日志失败: ${updateError.message}`);
    }

    // 将所有待核对记录的核对状态重置为待核对（模拟新数据同步）
    await client
      .from('collateral_records')
      .update({
        verification_status: '待核对',
        updated_at: new Date().toISOString(),
      })
      .eq('verification_status', '核对一致');

    return NextResponse.json({
      data: {
        id: syncLog.id,
        sync_type,
        sync_status: '成功',
        records_count: recordsCount,
        message: `同步完成，获取 ${recordsCount} 条更新记录`,
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';

    await client
      .from('data_sync_logs')
      .update({
        sync_status: '失败',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLog.id);

    return NextResponse.json({ error: `同步失败: ${errorMessage}` }, { status: 500 });
  }
}
