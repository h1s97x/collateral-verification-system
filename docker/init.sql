-- =============================================================
-- 不动产抵质押品核对应答系统 - 数据库初始化脚本
-- 适用于私有化部署的 PostgreSQL
-- =============================================================

-- 抵质押品记录表
CREATE TABLE IF NOT EXISTS collateral_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_no VARCHAR(64) NOT NULL,
  property_no VARCHAR(64) NOT NULL,
  property_type VARCHAR(32) NOT NULL,
  owner_name VARCHAR(128) NOT NULL,
  owner_id_no VARCHAR(64),
  location VARCHAR(512),
  area NUMERIC(12, 2),
  estimated_value NUMERIC(15, 2),
  status VARCHAR(32) NOT NULL DEFAULT '有效',
  mortgagee VARCHAR(128),
  mortgage_amount NUMERIC(15, 2),
  mortgage_start_date TIMESTAMPTZ,
  mortgage_end_date TIMESTAMPTZ,
  verification_status VARCHAR(32) NOT NULL DEFAULT '待核对',
  last_verified_at TIMESTAMPTZ,
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX IF NOT EXISTS collateral_mortgage_no_idx ON collateral_records (mortgage_no);
CREATE INDEX IF NOT EXISTS collateral_property_no_idx ON collateral_records (property_no);
CREATE INDEX IF NOT EXISTS collateral_status_idx ON collateral_records (status);
CREATE INDEX IF NOT EXISTS collateral_verification_status_idx ON collateral_records (verification_status);
CREATE INDEX IF NOT EXISTS collateral_owner_name_idx ON collateral_records (owner_name);
CREATE INDEX IF NOT EXISTS collateral_created_at_idx ON collateral_records (created_at);

-- 核对日志表
CREATE TABLE IF NOT EXISTS verification_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id VARCHAR(36) NOT NULL REFERENCES collateral_records(id),
  verification_type VARCHAR(32) NOT NULL,
  verification_result VARCHAR(32) NOT NULL,
  discrepancies TEXT,
  verified_by VARCHAR(128),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 核对日志索引
CREATE INDEX IF NOT EXISTS verification_record_id_idx ON verification_logs (record_id);
CREATE INDEX IF NOT EXISTS verification_result_idx ON verification_logs (verification_result);
CREATE INDEX IF NOT EXISTS verification_verified_at_idx ON verification_logs (verified_at);

-- 数据同步日志表
CREATE TABLE IF NOT EXISTS data_sync_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(32) NOT NULL,
  sync_status VARCHAR(32) NOT NULL,
  records_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 同步日志索引
CREATE INDEX IF NOT EXISTS sync_type_idx ON data_sync_logs (sync_type);
CREATE INDEX IF NOT EXISTS sync_status_idx ON data_sync_logs (sync_status);
CREATE INDEX IF NOT EXISTS sync_created_at_idx ON data_sync_logs (created_at);

-- =============================================================
-- 预置样例数据（可选，生产环境可移除）
-- =============================================================
INSERT INTO collateral_records (mortgage_no, property_no, property_type, owner_name, owner_id_no, location, area, estimated_value, status, mortgagee, mortgage_amount, mortgage_start_date, mortgage_end_date, verification_status, remark) VALUES
('DY2024001', 'BDC20240001', '住宅', '张建国', '320102198501123456', '南京市玄武区中山东路128号紫金花园3栋502室', 120.50, 350.00, '有效', '中国工商银行南京分行', 200.00, '2024-01-15', '2029-01-14', '待核对', '首套房抵押贷款'),
('DY2024002', 'BDC20240002', '商业', '李明辉', '320104199203085678', '南京市秦淮区夫子庙步行街88号', 256.80, 1200.00, '有效', '中国建设银行南京分行', 800.00, '2024-02-01', '2027-01-31', '待核对', '商业用房经营贷款'),
('DY2024003', 'BDC20240003', '住宅', '王秀兰', '320111196505221234', '南京市浦口区江浦街道文德路66号翠云山庄12栋301室', 89.30, 180.00, '注销', '中国农业银行南京分行', 100.00, '2023-03-20', '2024-03-19', '核对一致', '贷款已还清注销'),
('DY2024004', 'BDC20240004', '工业', '江苏恒通制造有限公司', '91320100MA1W2N3X4K', '南京市江宁区科学园龙眠大道568号', 5200.00, 3500.00, '变更', '中国银行南京分行', 2000.00, '2023-06-10', '2026-06-09', '核对不一致', '抵押金额发生变更'),
('DY2024005', 'BDC20240005', '土地', '南京瑞景房地产开发有限公司', '91320105MA2K7P8Q9R', '南京市栖霞区仙林大道以南、学思路以东地块', 15000.00, 8500.00, '有效', '交通银行南京分行', 5000.00, '2024-03-01', '2027-02-28', '待核对', '土地抵押开发贷款'),
('DY2024006', 'BDC20240006', '住宅', '陈志强', '320106198810157890', '南京市鼓楼区广州路140号随园大厦A座806室', 95.60, 420.00, '有效', '招商银行南京分行', 280.00, '2024-04-10', '2034-04-09', '核对一致', '二套房抵押贷款'),
('DY2024007', 'BDC20240007', '商业', '江苏盛达贸易有限公司', '913201023456789012', '南京市建邺区河西大街198号金鹰世界A座2201室', 180.00, 960.00, '待核实', '浦发银行南京分行', 600.00, '2024-01-20', '2026-01-19', '核对异常', '产权信息待确认'),
('DY2024008', 'BDC20240008', '住宅', '赵雅婷', '320113199504128765', '南京市雨花台区软件大道109号翠屏国际城5栋1602室', 138.20, 380.00, '有效', '中国工商银行南京分行', 250.00, '2024-05-15', '2034-05-14', '待核对', ''),
('DY2024009', 'BDC20240009', '工业', '南京光华科技有限责任公司', '913201045678901234', '南京市溧水区经济开发区团山东路18号', 8000.00, 4200.00, '有效', '中国建设银行南京分行', 3000.00, '2024-02-28', '2029-02-27', '待核对', '厂房抵押经营贷款'),
('DY2024010', 'BDC20240010', '住宅', '刘文彬', '320102197706093456', '南京市玄武区珠江路688号卓越大厦1栋202室', 76.80, 220.00, '注销', '中国农业银行南京分行', 150.00, '2022-08-01', '2024-07-31', '核对一致', '贷款到期注销');

-- 预置同步日志
INSERT INTO data_sync_logs (sync_type, sync_status, records_count, started_at, completed_at) VALUES
('增量同步', '成功', 42, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '3 seconds'),
('全量同步', '成功', 156, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '15 seconds'),
('接口对接', '成功', 28, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '2 seconds');
