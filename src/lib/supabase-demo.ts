const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

type DemoEnvelope<T> = {
  table_name: string;
  record_key: string;
  record: T;
};

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
  if (!isSupabaseConfigured) return [];
  const rows = await supabaseRequest<DemoEnvelope<T>[]>(
    `demo_records?table_name=eq.${encodeURIComponent(tableName)}&select=record&order=updated_at.desc`,
  );
  return rows.map((row) => row.record);
}

export async function saveDemoRecord<T>(tableName: string, recordKey: string, record: T) {
  if (!isSupabaseConfigured) return record;
  const payload = {
    table_name: tableName,
    record_key: recordKey,
    record,
    updated_at: new Date().toISOString(),
  };

  const rows = await supabaseRequest<DemoEnvelope<T>[]>(
    "demo_records?on_conflict=table_name,record_key",
    {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    },
  );

  return rows[0]?.record ?? record;
}

export function mergeDemoRows<T>(baseRows: T[], demoRows: T[], keyOf: (row: T) => string) {
  const seen = new Set(demoRows.map(keyOf));
  return [...demoRows, ...baseRows.filter((row) => !seen.has(keyOf(row)))];
}
