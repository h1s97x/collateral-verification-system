import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { dataSyncLogs, collateralRecords } from '@/storage/database/shared/schema';
import { eq, count, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

    const offset = (page - 1) * pageSize;

    // 查询同步日志
    const logs = await db
      .select()
      .from(dataSyncLogs)
      .orderBy(desc(dataSyncLogs.created_at))
      .limit(pageSize)
      .offset(offset);

    // 获取总数
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(dataSyncLogs);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询同步日志失败';
    return NextResponse.json({ error: `查询同步日志失败: ${message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { sync_type = '增量同步' } = body as { sync_type?: string };

    // 模拟同步过程
    const startTime = new Date();
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    const recordsCount = sync_type === '全量同步'
      ? Math.floor(Math.random() * 200) + 100
      : Math.floor(Math.random() * 50) + 20;

    const endTime = new Date();

    // 写入同步日志
    const [syncLog] = await db
      .insert(dataSyncLogs)
      .values({
        sync_type,
        sync_status: '成功',
        records_count: recordsCount,
        started_at: startTime,
        completed_at: endTime,
      })
      .returning();

    // 更新已同步记录的核对状态
    if (sync_type === '全量同步') {
      await db
        .update(collateralRecords)
        .set({
          verification_status: '待核对',
          updated_at: new Date(),
        })
        .where(eq(collateralRecords.verification_status, '核对一致'));
    }

    return NextResponse.json({
      data: {
        id: syncLog.id,
        sync_type: syncLog.sync_type,
        sync_status: syncLog.sync_status,
        records_count: syncLog.records_count,
        message: `同步完成，获取 ${recordsCount} 条更新记录`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '同步失败';
    return NextResponse.json({ error: `同步失败: ${message}` }, { status: 500 });
  }
}
