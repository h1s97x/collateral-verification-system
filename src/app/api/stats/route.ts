import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  const client = getSupabaseClient();

  // 总记录数
  const { count: totalRecords, error: e1 } = await client
    .from('collateral_records')
    .select('*', { count: 'exact', head: true });
  if (e1) return NextResponse.json({ error: `统计失败: ${e1.message}` }, { status: 500 });

  // 有效记录
  const { count: validRecords, error: e2 } = await client
    .from('collateral_records')
    .select('*', { count: 'exact', head: true })
    .eq('status', '有效');
  if (e2) return NextResponse.json({ error: `统计失败: ${e2.message}` }, { status: 500 });

  // 待核对
  const { count: pendingVerification, error: e3 } = await client
    .from('collateral_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', '待核对');
  if (e3) return NextResponse.json({ error: `统计失败: ${e3.message}` }, { status: 500 });

  // 核对不一致
  const { count: inconsistentRecords, error: e4 } = await client
    .from('collateral_records')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', '核对不一致');
  if (e4) return NextResponse.json({ error: `统计失败: ${e4.message}` }, { status: 500 });

  // 今日核对数
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: todayVerified, error: e5 } = await client
    .from('verification_logs')
    .select('*', { count: 'exact', head: true })
    .gte('verified_at', todayStart.toISOString());
  if (e5) return NextResponse.json({ error: `统计失败: ${e5.message}` }, { status: 500 });

  // 今日同步数
  const { count: todaySynced, error: e6 } = await client
    .from('data_sync_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString());
  if (e6) return NextResponse.json({ error: `统计失败: ${e6.message}` }, { status: 500 });

  return NextResponse.json({
    data: {
      total_records: totalRecords || 0,
      valid_records: validRecords || 0,
      pending_verification: pendingVerification || 0,
      inconsistent_records: inconsistentRecords || 0,
      today_verified: todayVerified || 0,
      today_synced: todaySynced || 0,
    },
  });
}
