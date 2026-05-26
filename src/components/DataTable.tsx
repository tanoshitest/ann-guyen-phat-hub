import { useMemo, useState, type ReactNode } from "react";
import { ChevronUp, ChevronDown, Search, Download, Upload, Plus } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  width?: number;
  numeric?: boolean;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => string | number;
};

type Props<T> = {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  onAdd?: () => void;
  toolbar?: ReactNode;
  pageSize?: number;
};

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchKeys,
  onAdd,
  toolbar,
  pageSize = 50,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (q && searchKeys?.length) {
      const lc = q.toLowerCase();
      rows = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(lc)),
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [data, q, sortKey, sortDir, searchKeys]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(page, totalPages);
  const pageRows = filtered.slice((cur - 1) * pageSize, cur * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm..."
              className="h-7 pl-7 pr-2 text-[13px] border rounded bg-background w-56 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {toolbar}
          <button className="h-7 px-2 inline-flex items-center gap-1 text-[12px] border rounded hover:bg-muted">
            <Upload className="w-3.5 h-3.5" /> Import Excel
          </button>
          <button className="h-7 px-2 inline-flex items-center gap-1 text-[12px] border rounded hover:bg-muted">
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
          {onAdd && (
            <button
              onClick={onAdd}
              className="h-7 px-2 inline-flex items-center gap-1 text-[12px] rounded bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm mới
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="sheet-table">
          <thead>
            <tr>
              <th style={{ width: 40 }} className="num">#</th>
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  style={c.width ? { width: c.width } : undefined}
                  className={c.numeric ? "num cursor-pointer select-none" : "cursor-pointer select-none"}
                  onClick={() => toggleSort(String(c.key))}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sortKey === c.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i}>
                <td className="num text-muted-foreground">{(cur - 1) * pageSize + i + 1}</td>
                {columns.map((c) => {
                  const v = c.render ? c.render(row) : (row as any)[c.key];
                  return (
                    <td key={String(c.key)} className={c.numeric ? "num" : ""}>
                      {v as ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 border-t bg-card text-[12px]">
        <span className="text-muted-foreground">
          Tổng: <strong className="text-foreground">{total}</strong> dòng
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={cur <= 1}
            onClick={() => setPage(cur - 1)}
            className="h-6 px-2 border rounded disabled:opacity-40 hover:bg-muted"
          >
            ‹ Trước
          </button>
          <span className="px-2">
            Trang {cur} / {totalPages}
          </span>
          <button
            disabled={cur >= totalPages}
            onClick={() => setPage(cur + 1)}
            className="h-6 px-2 border rounded disabled:opacity-40 hover:bg-muted"
          >
            Sau ›
          </button>
        </div>
      </div>
    </div>
  );
}
