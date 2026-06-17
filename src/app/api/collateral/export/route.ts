import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { collateralRecords } from '@/storage/database/shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get('status');
    const verification_status = searchParams.get('verification_status');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    const conditions = [];
    if (status) conditions.push(eq(collateralRecords.status, status));
    if (verification_status) conditions.push(eq(collateralRecords.verification_status, verification_status));
    if (start_date) conditions.push(gte(collateralRecords.created_at, new Date(start_date)));
    if (end_date) conditions.push(lte(collateralRecords.created_at, new Date(end_date)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(collateralRecords)
      .where(whereClause)
      .orderBy(desc(collateralRecords.created_at))
      .limit(10000);

    // 生成 CSV
    const headers = [
      '抵押号', '不动产编号', '不动产类型', '权利人', '证件号',
      '坐落位置', '面积(㎡)', '评估价值(万元)', '状态', '抵押权人',
      '抵押金额(万元)', '抵押开始日期', '抵押结束日期', '核对状态',
      '最后核对时间', '备注', '创建时间',
    ];

    const rows = data.map((r) => {
      return [
        r.mortgage_no,
        r.property_no,
        r.property_type,
        r.owner_name,
        r.owner_id_no || '',
        r.location || '',
        r.area || '',
        r.estimated_value || '',
        r.status,
        r.mortgagee || '',
        r.mortgage_amount || '',
        r.mortgage_start_date ? new Date(r.mortgage_start_date).toLocaleDateString('zh-CN') : '',
        r.mortgage_end_date ? new Date(r.mortgage_end_date).toLocaleDateString('zh-CN') : '',
        r.verification_status,
        r.last_verified_at ? new Date(r.last_verified_at).toLocaleString('zh-CN') : '',
        r.remark || '',
        r.created_at ? new Date(r.created_at).toLocaleString('zh-CN') : '',
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
  } catch (err) {
    const message = err instanceof Error ? err.message : '导出失败';
    return NextResponse.json({ error: `导出失败: ${message}` }, { status: 500 });
  }
}
