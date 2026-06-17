import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/storage/database/db';
import { collateralRecords } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;

    const [record] = await db
      .select()
      .from(collateralRecords)
      .where(eq(collateralRecords.id, id))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: `查询失败: ${message}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    const updateFields: Record<string, unknown> = {
      updated_at: new Date(),
    };

    const allowedFields = [
      'mortgage_no', 'property_no', 'property_type', 'owner_name', 'owner_id_no',
      'location', 'area', 'estimated_value', 'status', 'mortgagee',
      'mortgage_amount', 'mortgage_start_date', 'mortgage_end_date',
      'verification_status', 'last_verified_at', 'remark',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    const [updated] = await db
      .update(collateralRecords)
      .set(updateFields)
      .where(eq(collateralRecords.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: '记录不存在或未更新' }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: `更新失败: ${message}` }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;

    await db
      .delete(collateralRecords)
      .where(eq(collateralRecords.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '删除失败';
    return NextResponse.json({ error: `删除失败: ${message}` }, { status: 500 });
  }
}
