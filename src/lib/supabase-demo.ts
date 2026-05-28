const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const storagePrefix = "an-nguyen-phat-demo";

type DemoEnvelope<T> = {
  table_name: string;
  record_key: string;
  record: T;
};

type SupabaseListResponse<T> = T[] | { value?: T[] };

function unwrapRows<T>(response: SupabaseListResponse<T> | null) {
  if (!response) return [];
  return Array.isArray(response) ? response : response.value ?? [];
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getStorageKey(tableName: string) {
  return `${storagePrefix}:${tableName}`;
}

function readLocalRecords<T>(tableName: string) {
  if (!canUseLocalStorage()) return [];
  const raw = window.localStorage.getItem(getStorageKey(tableName));
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as DemoEnvelope<T>[]).map((row) => row.record);
  } catch {
    return [];
  }
}

function writeLocalRecord<T>(tableName: string, recordKey: string, record: T) {
  if (!canUseLocalStorage()) return record;
  const key = getStorageKey(tableName);
  const raw = window.localStorage.getItem(key);
  const rows = raw ? (JSON.parse(raw) as DemoEnvelope<T>[]) : [];
  const nextRows = [
    { table_name: tableName, record_key: recordKey, record },
    ...rows.filter((row) => row.record_key !== recordKey),
  ];
  window.localStorage.setItem(key, JSON.stringify(nextRows));
  return record;
}

function deleteLocalRecord(tableName: string, recordKey: string) {
  if (!canUseLocalStorage()) return;
  const key = getStorageKey(tableName);
  const raw = window.localStorage.getItem(key);
  const rows = raw ? (JSON.parse(raw) as DemoEnvelope<unknown>[]) : [];
  window.localStorage.setItem(key, JSON.stringify(rows.filter((row) => row.record_key !== recordKey)));
}

function getRestUrl(path: string) {
  if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL");
  return `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
}

async function supabaseRequest<T>(path: string, init?: RequestInit) {
  if (!supabaseAnonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY");

  const response = await fetch(getRestUrl(path), {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      authorization: `Bearer ${supabaseAnonKey}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function listDemoRecords<T>(tableName: string) {
  if (!isSupabaseConfigured) return readLocalRecords<T>(tableName);
  const response = await supabaseRequest<SupabaseListResponse<DemoEnvelope<T>>>(
    `demo_records?table_name=eq.${encodeURIComponent(tableName)}&select=record&order=updated_at.desc`,
  );
  const rows = unwrapRows(response);
  return rows.map((row) => row.record);
}

export async function saveDemoRecord<T>(tableName: string, recordKey: string, record: T) {
  if (!isSupabaseConfigured) return writeLocalRecord(tableName, recordKey, record);
  const payload = {
    table_name: tableName,
    record_key: recordKey,
    record,
    updated_at: new Date().toISOString(),
  };

  const response = await supabaseRequest<SupabaseListResponse<DemoEnvelope<T>>>(
    "demo_records?on_conflict=table_name,record_key",
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    },
  );
  const rows = unwrapRows(response);

  return rows[0]?.record ?? record;
}

export async function listDeletedDemoKeys(tableName: string) {
  if (!isSupabaseConfigured) return [];
  const response = await supabaseRequest<SupabaseListResponse<DemoEnvelope<{ deleted: boolean }>>>(
    `demo_records?table_name=eq.${encodeURIComponent(`${tableName}:deleted`)}&select=record_key`,
  );
  return unwrapRows(response).map((row) => row.record_key);
}

export async function deleteDemoRecord(tableName: string, recordKey: string) {
  if (!isSupabaseConfigured) {
    writeLocalRecord(`${tableName}:deleted`, recordKey, { deleted: true });
    deleteLocalRecord(tableName, recordKey);
    return;
  }
  await saveDemoRecord(`${tableName}:deleted`, recordKey, { deleted: true });
  try {
    await supabaseRequest<null>(
      `demo_records?table_name=eq.${encodeURIComponent(tableName)}&record_key=eq.${encodeURIComponent(recordKey)}`,
      { method: "DELETE" },
    );
  } catch (error) {
    console.warn(error);
  }
}

export function mergeDemoRows<T>(baseRows: T[], demoRows: T[], keyOf: (row: T) => string) {
  const seen = new Set(demoRows.map(keyOf));
  return [...demoRows, ...baseRows.filter((row) => !seen.has(keyOf(row)))];
}

export async function listMergedDemoRows<T>(
  tableName: string,
  baseRows: T[],
  keyOf: (row: T) => string,
  withDefaults: (row: T, index: number) => T,
) {
  const [demoRows, deletedKeys] = await Promise.all([
    listDemoRecords<T>(tableName),
    listDeletedDemoKeys(tableName),
  ]);
  const safeRows = demoRows.map((record, index) => withDefaults(record, index));
  const deleted = new Set(deletedKeys);
  return mergeDemoRows(baseRows, safeRows, keyOf).filter((row) => !deleted.has(keyOf(row)));
}

export function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
