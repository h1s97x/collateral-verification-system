# AGENTS.md

## 项目概览

不动产抵质押品核对应答系统 — 面向省大数据局的政务数据管理平台，提供抵质押品状态查询、实时核对、数据录入与导出功能。

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局 (AppShell 侧边栏)
│   │   ├── page.tsx            # 数据总览 Dashboard
│   │   ├── query/page.tsx      # 信息查询页
│   │   ├── verify/page.tsx     # 状态核对页
│   │   ├── entry/page.tsx      # 数据录入页
│   │   ├── sync/page.tsx       # 数据同步页
│   │   ├── api/
│   │   │   ├── collateral/
│   │   │   │   ├── route.ts        # GET 查询列表 / POST 新增记录
│   │   │   │   ├── [id]/route.ts   # GET/PUT/DELETE 单条记录
│   │   │   │   ├── verify/route.ts # POST 核对
│   │   │   │   └── export/route.ts # GET 导出 CSV
│   │   │   ├── verification-logs/route.ts  # GET 核对日志
│   │   │   ├── sync/route.ts              # GET 同步日志 / POST 触发同步
│   │   │   └── stats/route.ts             # GET 统计数据
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 组件库
│   │   └── app-shell.tsx       # 侧边栏布局组件
│   ├── lib/
│   │   ├── types.ts            # 类型定义
│   │   └── utils.ts            # 工具函数
│   └── storage/database/
│       ├── supabase-client.ts  # Supabase 客户端
│       └── shared/schema.ts    # Drizzle Schema
```

## 数据库表

| 表名 | 说明 |
|------|------|
| collateral_records | 不动产抵质押品记录 |
| verification_logs | 核对日志 |
| data_sync_logs | 数据同步日志 |

## 构建与测试命令

- 开发：`coze dev` 或 `pnpm run dev`
- 构建：`pnpm run build`
- 类型检查：`pnpm ts-check`
- Lint：`pnpm lint`

## API 接口清单

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/stats` | GET | 获取统计概览 |
| `/api/collateral` | GET | 查询抵质押品列表（支持分页、关键词、状态筛选） |
| `/api/collateral` | POST | 新增抵质押品记录 |
| `/api/collateral/[id]` | GET/PUT/DELETE | 单条记录操作 |
| `/api/collateral/verify` | POST | 批量核对 |
| `/api/collateral/export` | GET | 导出 CSV |
| `/api/verification-logs` | GET | 核对日志 |
| `/api/sync` | GET/POST | 同步日志 / 触发同步 |

## 编码规范

- TypeScript strict 模式，禁止隐式 any
- 字段名使用 snake_case（与数据库一致）
- Supabase 操作必须检查 `{ data, error }`，error 必须 throw
- 中文 URL 参数需 URL 编码

## 后续迭代方案

### P0 — 安全与合规（上线硬性前提）

1. **接入登录认证**
   - 对接 Supabase Auth，实现账号密码/政务统一认证登录
   - 按角色分级：普通操作员（只读+核对）、管理员（录入+导出+同步）
   - 所有 API 接口增加 session 校验（`x-session` Header）

2. **操作审计日志**
   - 新增 `operation_logs` 表，记录所有增删改操作
   - 登录/登出、数据录入、状态变更、导出等均需留痕
   - 支持按操作人、操作类型、时间范围查询审计记录

### P1 — 核心增强（业务完整性）

3. **对接真实省局数据接口**
   - 核对接口：提交抵押号 → 省局返回最新登记状态 → 比对差异
   - 同步接口：按时间增量拉取省局变更数据 → 写入本地库
   - 增加接口超时重试、断路器、降级策略

4. **批量数据导入**
   - 支持 Excel/CSV 文件上传 → 解析校验 → 批量写入
   - 校验重复抵押号、必填字段缺失、数据格式异常
   - 导入结果报告（成功/失败/跳过数量及明细）

5. **数据可视化看板**
   - 抵质押品类型分布饼图
   - 核对状态趋势折线图（日/周/月）
   - 到期预警时间线
   - 异常记录地域分布

### P2 — 体验优化（效率与易用性）

6. **核对结果人工复核流程**
   - 核对不一致记录进入人工复核队列
   - 复核人确认/修正 → 写入复核意见 → 更新状态
   - 复核记录关联核对日志

7. **到期预警提醒**
   - 抵押到期前 N 天自动标记预警
   - Dashboard 增加预警卡片
   - 支持按到期时间段筛选

8. **移动端适配优化**
   - 核对操作、查询等高频场景适配触屏交互
   - 考虑 PWA 离线缓存
- 避免嵌套查询（PostgREST schema cache 问题），改用两次查询 + Map 组装
