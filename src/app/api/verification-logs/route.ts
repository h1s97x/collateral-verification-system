import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { verificationLogs, collateralRecords } from '@/storage/database/shared/schema';
import { desc, eq } from 'drizzle-orm';

interface VerificationLogRow {
  id: string;
  record_id: string;
  verification_type: string;
  verification_result: string;
  discrepancies: string | null;
  verified_by: string | null;
  verified_at: Date;
  created_at: Date;
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

    const offset = (page - 1) * pageSize;

    // 查询核对日志
    const logs = await db
      .select()
      .from(verificationLogs)
      .orderBy(desc(verificationLogs.created_at))
      .limit(pageSize)
      .offset(offset) as VerificationLogRow[];

    // 获取总数
    const countResult = await db
      .select({ id: verificationLogs.id })
      .from(verificationLogs);

    const total = countResult.length;

    // 获取关联的抵押号信息
    const recordIds = logs.map((log) => log.record_id);
    let recordsMap: Record<string, { mortgage_no: string; property_no: string; owner_name: string }> = {};

    if (recordIds.length > 0) {
      const records = await db
        .select({
          id: collateralRecords.id,
          mortgage_no: collateralRecords.mortgage_no,
          property_no: collateralRecords.property_no,
          owner_name: collateralRecords.owner_name,
        })
        .from(collateralRecords);

      recordsMap = records.reduce<Record<string, { mortgage_no: string; property_no: string; owner_name: string }>>(
        (acc, r) => { acc[r.id] = r; return acc; },
        {}
      );
    }

    const enrichedLogs = logs.map((log) => ({
      ...log,
      mortgage_no: recordsMap[log.record_id]?.mortgage_no || '未知',
      property_no: recordsMap[log.record_id]?.property_no || '未知',
      owner_name: recordsMap[log.record_id]?.owner_name || '未知',
    }));

    return NextResponse.json({
      data: enrichedLogs,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询日志失败';
    return NextResponse.json({ error: `查询日志失败: ${message}` }, { status: 500 });
  }
}
