import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 核对逻辑：模拟与省大数据局数据接口对接进行状态核对
// 实际生产环境中，此处应调用省局提供的数据接口进行比对
async function verifyWithProvincialSystem(record: {
  id: string;
  mortgage_no: string;
  property_no: string;
  owner_name: string;
  status: string;
  mortgage_amount: string | null;
  estimated_value: string | null;
}) {
  // 模拟省局接口核对逻辑
  // 实际场景中应替换为真实接口调用
  const mockResults: Record<string, string> = {
    '有效': '核对一致',
    '注销': '核对一致',
    '变更': '核对不一致',
    '待核实': '核对异常',
  };

  // 模拟接口延迟
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  const result = mockResults[record.status] || '核对异常';
  const discrepancies: string[] = [];

  if (result === '核对不一致') {
    discrepancies.push('省局记录与本地记录状态不一致，需人工复核');
    if (record.mortgage_amount) {
      discrepancies.push('抵押金额可能与省局登记数据存在差异');
    }
  } else if (result === '核对异常') {
    discrepancies.push('省局接口返回数据异常，无法完成自动核对');
  }

  return {
    verification_result: result,
    discrepancies: discrepancies.length > 0 ? discrepancies.join('；') : null,
  };
}

export async function POST(request: NextRequest) {
  const client = getSupabaseClient();
  const body = await request.json();
  const { record_ids, verified_by } = body as {
    record_ids: string[];
    verified_by?: string;
  };

  if (!record_ids?.length) {
    return NextResponse.json({ error: '请选择需要核对的记录' }, { status: 400 });
  }

  // 获取待核对记录
  const { data: records, error: fetchError } = await client
    .from('collateral_records')
    .select('id, mortgage_no, property_no, owner_name, status, mortgage_amount, estimated_value')
    .in('id', record_ids);

  if (fetchError) {
    return NextResponse.json({ error: `查询记录失败: ${fetchError.message}` }, { status: 500 });
  }

  if (!records?.length) {
    return NextResponse.json({ error: '未找到指定记录' }, { status: 404 });
  }

  const results: Array<{
    record_id: string;
    mortgage_no: string;
    verification_result: string;
    discrepancies: string | null;
  }> = [];

  // 逐条核对
  for (const record of records) {
    const verifyResult = await verifyWithProvincialSystem(record);

    // 写入核对日志
    const { error: logError } = await client
      .from('verification_logs')
      .insert({
        record_id: record.id,
        verification_type: '自动核对',
        verification_result: verifyResult.verification_result,
        discrepancies: verifyResult.discrepancies,
        verified_by: verified_by || '系统',
        verified_at: new Date().toISOString(),
      });

    if (logError) {
      console.error(`写入核对日志失败: ${logError.message}`);
    }

    // 更新记录核对状态
    const { error: updateError } = await client
      .from('collateral_records')
      .update({
        verification_status: verifyResult.verification_result,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    if (updateError) {
      console.error(`更新核对状态失败: ${updateError.message}`);
    }

    results.push({
      record_id: record.id,
      mortgage_no: record.mortgage_no,
      verification_result: verifyResult.verification_result,
      discrepancies: verifyResult.discrepancies,
    });
  }

  return NextResponse.json({
    data: results,
    summary: {
      total: results.length,
      consistent: results.filter((r) => r.verification_result === '核对一致').length,
      inconsistent: results.filter((r) => r.verification_result === '核对不一致').length,
      error: results.filter((r) => r.verification_result === '核对异常').length,
    },
  });
}
