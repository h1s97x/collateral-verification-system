import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';

let _db: NodePgDatabase<typeof schema> | null = null;
let _pool: Pool | null = null;

/**
 * 获取数据库连接字符串
 * 优先级：
 * 1. DATABASE_URL — 私有化部署直连串
 * 2. PGDATABASE_URL — Coze 云环境 Supabase 直连串
 * 3. 由 COZE_SUPABASE_URL 构建 — 兼容回退
 */
function resolveDatabaseUrl(): string {
  // 优先级 1：私有化部署
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // 优先级 2：Coze 云环境 PG 直连串
  if (process.env.PGDATABASE_URL) {
    return process.env.PGDATABASE_URL;
  }

  throw new Error(
    'DATABASE_URL 环境变量未配置。\n' +
    '私有化部署请在 .env 中设置 DATABASE_URL=postgresql://user:pass@host:5432/db\n' +
    '云部署环境请确认 PGDATABASE_URL 已注入'
  );
}

function getPool(): Pool {
  if (_pool) return _pool;

  const databaseUrl = resolveDatabaseUrl();

  _pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  _pool.on('error', (err) => {
    console.error('[DB] 连接池异常:', err.message);
  });

  return _pool;
}

/** Drizzle ORM 数据库实例（单例，懒初始化） */
export function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

/** 健康检查 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await getPool().query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch {
    return false;
  }
}

/** 优雅关闭 */
export async function closeDatabaseConnection(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}
