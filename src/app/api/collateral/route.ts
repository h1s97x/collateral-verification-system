import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { collateralRecords } from '@/storage/database/shared/schema';
import { eq, ilike, or, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;

    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    const verification_status = searchParams.get('verification_status');
    const property_type = searchParams.get('property_type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

    // 构建查询条件
    const conditions = [];

    if (keyword) {
      conditions.push(
        or(
          ilike(collateralRecords.mortgage_no, `%${keyword}%`),
          ilike(collateralRecords.property_no, `%${keyword}%`),
          ilike(collateralRecords.owner_name, `%${keyword}%`),
          ilike(collateralRecords.location, `%${keyword}%`)
        )!
      );
    }
    if (status) {
      conditions.push(eq(collateralRecords.status, status));
    }
    if (verification_status) {
      conditions.push(eq(collateralRecords.verification_status, verification_status));
    }
    if (property_type) {
      conditions.push(eq(collateralRecords.property_type, property_type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 查询总数
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collateralRecords)
      .where(whereClause);

    // 分页查询
    const offset = (page - 1) * pageSize;
    const data = await db
      .select()
      .from(collateralRecords)
      .where(whereClause)
      .orderBy(desc(collateralRecords.created_at))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      data,
      pagination: {
        page,
        page_size: pageSize,
        total: countResult.count,
        total_pages: Math.ceil(countResult.count / pageSize),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: `查询失败: ${message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const [newRecord] = await db
      .insert(collateralRecords)
      .values({
        mortgage_no: body.mortgage_no,
        property_no: body.property_no,
        property_type: body.property_type,
        owner_name: body.owner_name,
        owner_id_no: body.owner_id_no || null,
        location: body.location || null,
        area: body.area || null,
        estimated_value: body.estimated_value || null,
        status: body.status || '有效',
        mortgagee: body.mortgagee || null,
        mortgage_amount: body.mortgage_amount || null,
        mortgage_start_date: body.mortgage_start_date || null,
        mortgage_end_date: body.mortgage_end_date || null,
        verification_status: '待核对',
        remark: body.remark || null,
      })
      .returning();

    return NextResponse.json({ data: newRecord }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '新增失败';
    return NextResponse.json({ error: `新增失败: ${message}` }, { status: 500 });
  }
}
