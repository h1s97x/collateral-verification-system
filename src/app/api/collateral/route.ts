import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const searchParams = request.nextUrl.searchParams;

  const keyword = searchParams.get('keyword');
  const mortgage_no = searchParams.get('mortgage_no');
  const property_no = searchParams.get('property_no');
  const owner_name = searchParams.get('owner_name');
  const status = searchParams.get('status');
  const verification_status = searchParams.get('verification_status');
  const property_type = searchParams.get('property_type');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

  let query = client
    .from('collateral_records')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // 关键词模糊搜索（抵押号、不动产编号、权利人）
  if (keyword) {
    query = query.or(
      `mortgage_no.ilike.%${keyword}%,property_no.ilike.%${keyword}%,owner_name.ilike.%${keyword}%,location.ilike.%${keyword}%`
    );
  }
  if (mortgage_no) {
    query = query.ilike('mortgage_no', `%${mortgage_no}%`);
  }
  if (property_no) {
    query = query.ilike('property_no', `%${property_no}%`);
  }
  if (owner_name) {
    query = query.ilike('owner_name', `%${owner_name}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (verification_status) {
    query = query.eq('verification_status', verification_status);
  }
  if (property_type) {
    query = query.eq('property_type', property_type);
  }

  // 分页
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: `查询失败: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      page_size: pageSize,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const client = getSupabaseClient();
  const body = await request.json();

  const { data, error } = await client
    .from('collateral_records')
    .insert({
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
    .select();

  if (error) {
    return NextResponse.json({ error: `新增失败: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ data: data?.[0] }, { status: 201 });
}
