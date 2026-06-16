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
- 避免嵌套查询（PostgREST schema cache 问题），改用两次查询 + Map 组装
