import { useMemo, useState, type ReactNode } from "react";
import { ChevronUp, ChevronDown, Search, Download, Upload, Plus, X } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  width?: number;
  numeric?: boolean;
  options?: string[];
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
  const [addOpen, setAddOpen] = useState(false);

  const formColumns = useMemo(
    () => columns.filter((c) => String(c.key) !== "actions"),
    [columns],
  );

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
              onClick={() => {
                onAdd();
                setAddOpen(true);
              }}
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
      {addOpen && <AddRecordDialog title={title} columns={formColumns} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddRecordDialog<T extends Record<string, any>>({
  title,
  columns,
  onClose,
}: {
  title: string;
  columns: Column<T>[];
  onClose: () => void;
}) {
  const [jumboType, setJumboType] = useState<"cong" | "tru" | null>(null);
  const [congJumbo, setCongJumbo] = useState("");
  const [truJumbo, setTruJumbo] = useState("");
  const hasJumbo = columns.some((column) => ["congJumbo", "truJumbo"].includes(String(column.key)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <form
        className="w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-md border bg-card shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Thêm mới {title.toLowerCase()}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted"
            aria-label="Đóng"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[calc(88vh-112px)] overflow-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {columns.map((column) => {
              const key = String(column.key);
              if (key === "truJumbo") return null;
              if (key === "congJumbo" && hasJumbo) {
                return (
                  <JumboField
                    key="jumbo"
                    jumboType={jumboType}
                    congJumbo={congJumbo}
                    truJumbo={truJumbo}
                    onTypeChange={(type) => {
                      setJumboType(type);
                      if (type === "cong") setTruJumbo("");
                      if (type === "tru") setCongJumbo("");
                    }}
                    onCongChange={setCongJumbo}
                    onTruChange={setTruJumbo}
                  />
                );
              }
              return <FormField key={key} column={column} />;
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button type="button" onClick={onClose} className="h-8 px-3 text-[13px] border rounded hover:bg-muted">
            Hủy
          </button>
          <button type="submit" className="h-8 px-3 text-[13px] rounded bg-primary text-primary-foreground hover:opacity-90">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}

function JumboField({
  jumboType,
  congJumbo,
  truJumbo,
  onTypeChange,
  onCongChange,
  onTruChange,
}: {
  jumboType: "cong" | "tru" | null;
  congJumbo: string;
  truJumbo: string;
  onTypeChange: (type: "cong" | "tru" | null) => void;
  onCongChange: (value: string) => void;
  onTruChange: (value: string) => void;
}) {
  const choose = (type: "cong" | "tru") => {
    onTypeChange(jumboType === type ? null : type);
  };

  return (
    <fieldset className="col-span-2 rounded border p-3">
      <legend className="px-1 text-[12px] font-medium text-muted-foreground">Jumbo</legend>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={jumboType === "cong"}
            onChange={() => choose("cong")}
            className="h-4 w-4"
          />
          <span className="w-24 text-[13px] font-medium">Cộng Jumbo</span>
          <input
            name="congJumbo"
            type="number"
            value={congJumbo}
            disabled={jumboType !== "cong"}
            onChange={(e) => onCongChange(e.target.value)}
            className="h-8 min-w-0 flex-1 rounded border bg-background px-2 text-[13px] disabled:bg-muted disabled:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={jumboType === "tru"}
            onChange={() => choose("tru")}
            className="h-4 w-4"
          />
          <span className="w-24 text-[13px] font-medium">Trừ Jumbo</span>
          <input
            name="truJumbo"
            type="number"
            value={truJumbo}
            disabled={jumboType !== "tru"}
            onChange={(e) => onTruChange(e.target.value)}
            className="h-8 min-w-0 flex-1 rounded border bg-background px-2 text-[13px] disabled:bg-muted disabled:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
      </div>
    </fieldset>
  );
}

function FormField<T extends Record<string, any>>({ column }: { column: Column<T> }) {
  const key = String(column.key);
  const label = column.label;
  const lower = `${key} ${label}`.toLowerCase();
  const isDate = lower.includes("ngày") || lower.includes("ngay");
  const isLongText = lower.includes("ghi chú") || lower.includes("diễn giải") || lower.includes("lý do");

  return (
    <label className={isLongText ? "col-span-2" : ""}>
      <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{label}</span>
      {column.options?.length ? (
        <select
          name={key}
          defaultValue=""
          className="h-8 w-full rounded border bg-background px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="" disabled>
            Chọn {label.toLowerCase()}
          </option>
          {column.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : isLongText ? (
        <textarea
          name={key}
          rows={3}
          className="w-full rounded border bg-background px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <input
          name={key}
          type={isDate ? "date" : column.numeric ? "number" : "text"}
          className="h-8 w-full rounded border bg-background px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}
    </label>
  );
}
