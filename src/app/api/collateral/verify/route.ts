import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { collateralRecords, verificationLogs } from '@/storage/database/shared/schema';
import { eq, inArray } from 'drizzle-orm';

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
  const mockResults: Record<string, string> = {
    '有效': '核对一致',
    '注销': '核对一致',
    '变更': '核对不一致',
    '待核实': '核对异常',
  };

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
  try {
    const db = getDb();
    const body = await request.json();
    const { record_ids, verified_by } = body as {
      record_ids: string[];
      verified_by?: string;
    };

    if (!record_ids?.length) {
      return NextResponse.json({ error: '请选择需要核对的记录' }, { status: 400 });
    }

    // 获取待核对记录
    const records = await db
      .select({
        id: collateralRecords.id,
        mortgage_no: collateralRecords.mortgage_no,
        property_no: collateralRecords.property_no,
        owner_name: collateralRecords.owner_name,
        status: collateralRecords.status,
        mortgage_amount: collateralRecords.mortgage_amount,
        estimated_value: collateralRecords.estimated_value,
      })
      .from(collateralRecords)
      .where(inArray(collateralRecords.id, record_ids));

    if (!records?.length) {
      return NextResponse.json({ error: '未找到指定记录' }, { status: 404 });
    }

    const results: Array<{
      record_id: string;
      mortgage_no: string;
      verification_result: string;
      discrepancies: string | null;
    }> = [];

    for (const record of records) {
      const verifyResult = await verifyWithProvincialSystem(record);

      // 写入核对日志
      await db.insert(verificationLogs).values({
        record_id: record.id,
        verification_type: '自动核对',
        verification_result: verifyResult.verification_result,
        discrepancies: verifyResult.discrepancies,
        verified_by: verified_by || '系统',
        verified_at: new Date(),
      });

      // 更新记录核对状态
      await db
        .update(collateralRecords)
        .set({
          verification_status: verifyResult.verification_result,
          last_verified_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(collateralRecords.id, record.id));

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
  } catch (err) {
    const message = err instanceof Error ? err.message : '核对失败';
    return NextResponse.json({ error: `核对失败: ${message}` }, { status: 500 });
  }
}
