import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('collateral_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: `查询失败: ${error.message}` }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: '记录不存在' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getSupabaseClient();
  const body = await request.json();

  const { data, error } = await client
    .from('collateral_records')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: `更新失败: ${error.message}` }, { status: 500 });
  }
  if (!data?.length) {
    return NextResponse.json({ error: '记录不存在或未更新' }, { status: 404 });
  }

  return NextResponse.json({ data: data[0] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getSupabaseClient();

  const { error } = await client
    .from('collateral_records')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: `删除失败: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
