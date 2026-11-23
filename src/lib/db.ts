import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client/web";
import { seedDatabaseIfEmpty } from "./seed";
import type {
  CoreConcept,
  OptionItem,
  PitfallItem,
  QuestionRecord,
  TopicRecord,
  TraceStep,
} from "./types";

export type SqlArg = string | number | boolean | null;

export type StorageMode = "turso" | "local-sqlite" | "vercel-tmp-fallback";

export interface DbRunResult {
  lastInsertRowid: number;
  rowsAffected: number;
}

export interface DbClient {
  storageMode: StorageMode;
  queryOne<T = Record<string, unknown>>(sql: string, args?: SqlArg[]): Promise<T | undefined>;
  queryAll<T = Record<string, unknown>>(sql: string, args?: SqlArg[]): Promise<T[]>;
  run(sql: string, args?: SqlArg[]): Promise<DbRunResult>;
  execBatch(statements: Array<string | { sql: string; args?: SqlArg[] }>): Promise<void>;
}

declare global {
  // eslint-disable-next-line no-var
  var __apcsDbClient: DbClient | undefined;
  // eslint-disable-next-line no-var
  var __apcsDbInitPromise: Promise<DbClient> | undefined;
}

const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    join_code TEXT UNIQUE NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS class_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(class_id, student_id)
  )`,
  `CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    exam_weight TEXT NOT NULL DEFAULT '',
    study_minutes INTEGER NOT NULL DEFAULT 25,
    sort_order INTEGER NOT NULL DEFAULT 1,
    visualizer_type TEXT NOT NULL,
    core_concepts_json TEXT NOT NULL DEFAULT '[]',
    pitfalls_json TEXT NOT NULL DEFAULT '[]',
    is_published INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    official_ref TEXT,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    code TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK(question_type IN ('trace','fill','debug','counterexample','static','complexity')),
    difficulty TEXT NOT NULL CHECK(difficulty IN ('basic','medium','advanced')),
    options_json TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK(correct_option IN ('A','B','C','D')),
    explanation TEXT NOT NULL,
    trace_steps_json TEXT NOT NULL DEFAULT '[]',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    question_ids_json TEXT NOT NULL DEFAULT '[]',
    due_date TEXT,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
    selected_option TEXT NOT NULL CHECK(selected_option IN ('A','B','C','D')),
    is_correct INTEGER NOT NULL,
    duration_sec INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_class_members_student ON class_members(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id)`,
  `CREATE INDEX IF NOT EXISTS idx_questions_class ON questions(class_id)`,
  `CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id)`,
  `CREATE INDEX IF NOT EXISTS idx_attempts_assignment ON attempts(assignment_id)`,
];

function normalizeValue(val: unknown): unknown {
  if (typeof val === "bigint") return Number(val);
  return val;
}

function normalizeRow<T>(raw: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = normalizeValue(v);
  }
  return out as T;
}

function normalizeArgs(args?: SqlArg[]): Array<string | number | null> {
  if (!args) return [];
  return args.map((a) => (typeof a === "boolean" ? (a ? 1 : 0) : a));
}

function createTursoClient(url: string, authToken?: string): DbClient {
  const client = createClient({ url, authToken });

  return {
    storageMode: "turso",
    async queryOne<T = Record<string, unknown>>(sql: string, args?: SqlArg[]) {
      const res = await client.execute({ sql, args: normalizeArgs(args) });
      const row = res.rows[0];
      if (!row) return undefined;
      const obj: Record<string, unknown> = {};
      res.columns.forEach((col, idx) => {
        obj[col] = normalizeValue(row[idx]);
      });
      return obj as T;
    },
    async queryAll<T = Record<string, unknown>>(sql: string, args?: SqlArg[]) {
      const res = await client.execute({ sql, args: normalizeArgs(args) });
      return res.rows.map((row) => {
        const obj: Record<string, unknown> = {};
        res.columns.forEach((col, idx) => {
          obj[col] = normalizeValue(row[idx]);
        });
        return obj as T;
      });
    },
    async run(sql: string, args?: SqlArg[]) {
      const res = await client.execute({ sql, args: normalizeArgs(args) });
      return {
        lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : 0,
        rowsAffected: res.rowsAffected ?? 0,
      };
    },
    async execBatch(statements) {
      if (statements.length === 0) return;
      const mapped = statements.map((st) =>
        typeof st === "string"
          ? { sql: st, args: [] }
          : { sql: st.sql, args: normalizeArgs(st.args) }
      );
      await client.batch(mapped, "write");
    },
  };
}

function createLocalSqliteClient(dbPath: string, storageMode: StorageMode): DbClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sqlite = process.getBuiltinModule("node:sqlite") as
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { DatabaseSync: new (path: string) => any } | undefined;

  if (!sqlite?.DatabaseSync) {
    throw new Error(
      "Node built-in node:sqlite is unavailable and TURSO_DATABASE_URL is not configured."
    );
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const rawDb = new sqlite.DatabaseSync(dbPath);
  rawDb.exec("PRAGMA foreign_keys = ON;");
  rawDb.exec("PRAGMA journal_mode = WAL;");

  return {
    storageMode,
    async queryOne<T = Record<string, unknown>>(sql: string, args?: SqlArg[]) {
      const row = rawDb.prepare(sql).get(...normalizeArgs(args));
      if (row === undefined || row === null) return undefined;
      return normalizeRow<T>(Object.assign({}, row));
    },
    async queryAll<T = Record<string, unknown>>(sql: string, args?: SqlArg[]) {
      const rows = rawDb.prepare(sql).all(...normalizeArgs(args)) as unknown[];
      return rows.map((r) => normalizeRow<T>(Object.assign({}, r)));
    },
    async run(sql: string, args?: SqlArg[]) {
      const res = rawDb.prepare(sql).run(...normalizeArgs(args)) as {
        lastInsertRowid?: number | bigint;
        changes?: number | bigint;
      };
      return {
        lastInsertRowid: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : 0,
        rowsAffected: res.changes !== undefined ? Number(res.changes) : 0,
      };
    },
    async execBatch(statements) {
      if (statements.length === 0) return;
      rawDb.exec("BEGIN");
      try {
        for (const st of statements) {
          if (typeof st === "string") {
            rawDb.exec(st);
          } else {
            rawDb.prepare(st.sql).run(...normalizeArgs(st.args));
          }
        }
        rawDb.exec("COMMIT");
      } catch (err) {
        rawDb.exec("ROLLBACK");
        throw err;
      }
    },
  };
}

export function getStorageMode(): StorageMode {
  if (process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL) {
    return "turso";
  }
  if (process.env.VERCEL) {
    return "vercel-tmp-fallback";
  }
  return "local-sqlite";
}

export async function getDb(): Promise<DbClient> {
  if (globalThis.__apcsDbClient) {
    return globalThis.__apcsDbClient;
  }

  if (!globalThis.__apcsDbInitPromise) {
    globalThis.__apcsDbInitPromise = (async () => {
      const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
      const tursoToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;

      let client: DbClient;
      if (tursoUrl) {
        client = createTursoClient(tursoUrl, tursoToken);
      } else if (process.env.VERCEL) {
        console.warn(
          "[apcs-tracelab] TURSO_DATABASE_URL is not set on Vercel; falling back to ephemeral /tmp/apcs.db."
        );
        client = createLocalSqliteClient("/tmp/apcs.db", "vercel-tmp-fallback");
      } else {
        const dbPath = path.join(process.cwd(), "data", "apcs.db");
        client = createLocalSqliteClient(dbPath, "local-sqlite");
      }

      await client.execBatch(SCHEMA_STATEMENTS);
      await seedDatabaseIfEmpty(client);

      globalThis.__apcsDbClient = client;
      return client;
    })().catch((err) => {
      globalThis.__apcsDbInitPromise = undefined;
      throw err;
    });
  }

  return globalThis.__apcsDbInitPromise;
}

/**
 * Convert rows (or null-prototype objects) into plain JS objects
 * so Next.js Server -> Client serialization never throws.
 */
export function toPlain<T>(row: unknown): T {
  if (row === null || row === undefined) return row as T;
  return normalizeRow<T>(Object.assign({}, row));
}

export function toPlainAll<T>(rows: unknown[]): T[] {
  return rows.map((r) => normalizeRow<T>(Object.assign({}, r)));
}

export function parseJsonSafe<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function hydrateTopic(rawRow: Record<string, unknown>): TopicRecord {
  const row = toPlain<Record<string, unknown>>(rawRow);
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ""),
    summary: String(row.summary ?? ""),
    exam_weight: String(row.exam_weight ?? ""),
    study_minutes: Number(row.study_minutes ?? 25),
    sort_order: Number(row.sort_order ?? 1),
    visualizer_type: String(row.visualizer_type) as TopicRecord["visualizer_type"],
    core_concepts: parseJsonSafe<CoreConcept[]>(String(row.core_concepts_json ?? "[]"), []),
    pitfalls: parseJsonSafe<PitfallItem[]>(String(row.pitfalls_json ?? "[]"), []),
    is_published: Boolean(row.is_published),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function hydrateQuestion(rawRow: Record<string, unknown>): QuestionRecord {
  const row = toPlain<Record<string, unknown>>(rawRow);
  return {
    id: Number(row.id),
    topic_id: Number(row.topic_id),
    topic_slug: row.topic_slug ? String(row.topic_slug) : undefined,
    topic_title: row.topic_title ? String(row.topic_title) : undefined,
    official_ref: row.official_ref ? String(row.official_ref) : null,
    title: String(row.title),
    prompt: String(row.prompt),
    code: String(row.code),
    question_type: String(row.question_type) as QuestionRecord["question_type"],
    difficulty: String(row.difficulty) as QuestionRecord["difficulty"],
    options: parseJsonSafe<OptionItem[]>(String(row.options_json ?? "[]"), []),
    correct_option: String(row.correct_option) as QuestionRecord["correct_option"],
    explanation: String(row.explanation),
    trace_steps: parseJsonSafe<TraceStep[]>(String(row.trace_steps_json ?? "[]"), []),
    created_by:
      row.created_by !== null && row.created_by !== undefined ? Number(row.created_by) : null,
    class_id: row.class_id !== null && row.class_id !== undefined ? Number(row.class_id) : null,
    class_name: row.class_name ? String(row.class_name) : null,
    is_published: Boolean(row.is_published),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}
