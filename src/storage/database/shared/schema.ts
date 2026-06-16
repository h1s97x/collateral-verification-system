import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, text, numeric, integer, index } from "drizzle-orm/pg-core";

// 系统表 - 禁止删除
export const healthCheck = pgTable("health_check", {
  id: integer().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 不动产抵质押品记录表
export const collateralRecords = pgTable(
  "collateral_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    mortgage_no: varchar("mortgage_no", { length: 64 }).notNull(),       // 抵押号
    property_no: varchar("property_no", { length: 64 }).notNull(),       // 不动产编号
    property_type: varchar("property_type", { length: 32 }).notNull(),   // 不动产类型(住宅/商业/工业/土地等)
    owner_name: varchar("owner_name", { length: 128 }).notNull(),        // 权利人
    owner_id_no: varchar("owner_id_no", { length: 64 }),                 // 权利人证件号
    location: varchar("location", { length: 512 }),                      // 坐落位置
    area: numeric("area", { precision: 12, scale: 2 }),                  // 面积(平方米)
    estimated_value: numeric("estimated_value", { precision: 15, scale: 2 }), // 评估价值(万元)
    status: varchar("status", { length: 32 }).notNull().default("有效"), // 状态(有效/注销/变更/待核实)
    mortgagee: varchar("mortgagee", { length: 128 }),                    // 抵押权人
    mortgage_amount: numeric("mortgage_amount", { precision: 15, scale: 2 }), // 抵押金额(万元)
    mortgage_start_date: timestamp("mortgage_start_date", { withTimezone: true }), // 抵押开始日期
    mortgage_end_date: timestamp("mortgage_end_date", { withTimezone: true }),     // 抵押结束日期
    verification_status: varchar("verification_status", { length: 32 }).notNull().default("待核对"), // 核对状态(待核对/核对一致/核对不一致/核对异常)
    last_verified_at: timestamp("last_verified_at", { withTimezone: true }),       // 最后核对时间
    remark: text("remark"),                                               // 备注
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("collateral_mortgage_no_idx").on(table.mortgage_no),
    index("collateral_property_no_idx").on(table.property_no),
    index("collateral_status_idx").on(table.status),
    index("collateral_verification_status_idx").on(table.verification_status),
    index("collateral_owner_name_idx").on(table.owner_name),
    index("collateral_created_at_idx").on(table.created_at),
  ]
);

// 核对日志表
export const verificationLogs = pgTable(
  "verification_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    record_id: varchar("record_id", { length: 36 }).notNull().references(() => collateralRecords.id),
    verification_type: varchar("verification_type", { length: 32 }).notNull(), // 核对类型(自动核对/手动核对/批量核对)
    verification_result: varchar("verification_result", { length: 32 }).notNull(), // 核对结果(一致/不一致/异常)
    discrepancies: text("discrepancies"),                                   // 差异说明
    verified_by: varchar("verified_by", { length: 128 }),                  // 核对人
    verified_at: timestamp("verified_at", { withTimezone: true }).defaultNow().notNull(), // 核对时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("verification_record_id_idx").on(table.record_id),
    index("verification_result_idx").on(table.verification_result),
    index("verification_verified_at_idx").on(table.verified_at),
  ]
);

// 数据同步日志表
export const dataSyncLogs = pgTable(
  "data_sync_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    sync_type: varchar("sync_type", { length: 32 }).notNull(),             // 同步类型(全量同步/增量同步/接口对接)
    sync_status: varchar("sync_status", { length: 32 }).notNull(),         // 同步状态(进行中/成功/失败/超时)
    records_count: integer("records_count").default(0),                    // 记录数
    error_message: text("error_message"),                                   // 错误信息
    started_at: timestamp("started_at", { withTimezone: true }),           // 开始时间
    completed_at: timestamp("completed_at", { withTimezone: true }),       // 完成时间
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sync_type_idx").on(table.sync_type),
    index("sync_status_idx").on(table.sync_status),
    index("sync_created_at_idx").on(table.created_at),
  ]
);
