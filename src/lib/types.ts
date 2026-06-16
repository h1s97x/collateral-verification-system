// 不动产抵质押品记录
export interface CollateralRecord {
  id: string;
  mortgage_no: string;
  property_no: string;
  property_type: string;
  owner_name: string;
  owner_id_no: string | null;
  location: string | null;
  area: string | null;
  estimated_value: string | null;
  status: string;
  mortgagee: string | null;
  mortgage_amount: string | null;
  mortgage_start_date: string | null;
  mortgage_end_date: string | null;
  verification_status: string;
  last_verified_at: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string | null;
}

// 新增抵质押品记录表单
export interface CollateralInsert {
  mortgage_no: string;
  property_no: string;
  property_type: string;
  owner_name: string;
  owner_id_no?: string;
  location?: string;
  area?: string;
  estimated_value?: string;
  status?: string;
  mortgagee?: string;
  mortgage_amount?: string;
  mortgage_start_date?: string;
  mortgage_end_date?: string;
  remark?: string;
}

// 核对日志
export interface VerificationLog {
  id: string;
  record_id: string;
  verification_type: string;
  verification_result: string;
  discrepancies: string | null;
  verified_by: string | null;
  verified_at: string;
  created_at: string;
  collateral_records?: Pick<CollateralRecord, 'mortgage_no' | 'property_no' | 'owner_name'>;
}

// 数据同步日志
export interface DataSyncLog {
  id: string;
  sync_type: string;
  sync_status: string;
  records_count: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// 统计数据
export interface DashboardStats {
  total_records: number;
  valid_records: number;
  pending_verification: number;
  inconsistent_records: number;
  today_verified: number;
  today_synced: number;
}

// 查询参数
export interface CollateralQuery {
  keyword?: string;
  mortgage_no?: string;
  property_no?: string;
  owner_name?: string;
  status?: string;
  verification_status?: string;
  property_type?: string;
  page?: number;
  page_size?: number;
}

// 核对请求
export interface VerifyRequest {
  record_ids: string[];
  verified_by?: string;
}

// 状态枚举
export const RECORD_STATUS = {
  VALID: '有效',
  CANCELLED: '注销',
  CHANGED: '变更',
  PENDING: '待核实',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: '待核对',
  CONSISTENT: '核对一致',
  INCONSISTENT: '核对不一致',
  ERROR: '核对异常',
} as const;

export const PROPERTY_TYPES = ['住宅', '商业', '工业', '土地', '其他'] as const;
