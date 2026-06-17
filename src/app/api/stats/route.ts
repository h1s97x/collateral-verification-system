import { NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { collateralRecords, verificationLogs, dataSyncLogs } from '@/storage/database/shared/schema';
import { eq, gte, count } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();

    // 总记录数
    const [totalResult] = await db
      .select({ count: count() })
      .from(collateralRecords);

    // 有效记录
    const [validResult] = await db
      .select({ count: count() })
      .from(collateralRecords)
      .where(eq(collateralRecords.status, '有效'));

    // 待核对
    const [pendingResult] = await db
      .select({ count: count() })
      .from(collateralRecords)
      .where(eq(collateralRecords.verification_status, '待核对'));

    // 核对不一致
    const [inconsistentResult] = await db
      .select({ count: count() })
      .from(collateralRecords)
      .where(eq(collateralRecords.verification_status, '核对不一致'));

    // 今日核对数
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayVerifiedResult] = await db
      .select({ count: count() })
      .from(verificationLogs)
      .where(gte(verificationLogs.verified_at, todayStart));

    // 今日同步数
    const [todaySyncedResult] = await db
      .select({ count: count() })
      .from(dataSyncLogs)
      .where(gte(dataSyncLogs.created_at, todayStart));

    return NextResponse.json({
      data: {
        total_records: totalResult.count,
        valid_records: validResult.count,
        pending_verification: pendingResult.count,
        inconsistent_records: inconsistentResult.count,
        today_verified: todayVerifiedResult.count,
        today_synced: todaySyncedResult.count,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '统计失败';
    return NextResponse.json({ error: `统计失败: ${message}` }, { status: 500 });
  }
}
