import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { customers } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  mergeDemoRows,
  saveDemoRecord,
} from "@/lib/supabase-demo";

export const Route = createFileRoute("/khach-hang")({ component: Page });

function Page() {
  const [rows, setRows] = useState(customers);

  const withDefaults = (record: (typeof customers)[number], index: number) => ({
    ...record,
    MA_KH: record.MA_KH || `KH_DEMO${String(index + 1).padStart(3, "0")}`,
    MA_THONG_KE: record.MA_THONG_KE || `TK_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Khach hang demo",
    mst: record.mst || "",
    diaChi: record.diaChi || "",
    nguoiLienHe: record.nguoiLienHe || "",
    dienThoai: record.dienThoai || "",
    email: record.email || "",
    ghiChu: record.ghiChu || "",
  });

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof customers)[number]>("customers"), listDeletedDemoKeys("customers")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(customers, safeRows, (row) => row.MA_KH).filter((row) => !deleted.has(row.MA_KH)));
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xoa khach hang ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_KH !== recordKey));
    void deleteDemoRecord("customers", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Danh mục khách hàng"
      data={rows}
      searchKeys={["MA_KH", "ten", "mst", "nguoiLienHe", "dienThoai"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("customers", next.MA_KH, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_KH !== next.MA_KH)];
        });
      }}
      columns={[
        { key: "MA_KH", label: "MA_KH", width: 90 },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 110 },
        { key: "ten", label: "Tên khách hàng", width: 240 },
        { key: "mst", label: "Mã số thuế", width: 120 },
        { key: "diaChi", label: "Địa chỉ", width: 240 },
        { key: "nguoiLienHe", label: "Người liên hệ", width: 150 },
        { key: "dienThoai", label: "Điện thoại", width: 110 },
        { key: "email", label: "Email", width: 180 },
        { key: "ghiChu", label: "Ghi chú", width: 140 },
        {
          key: "actions",
          label: "Thao tác",
          width: 80,
          render: (row) => (
            <button
              type="button"
              onClick={() => handleDelete(row.MA_KH)}
              className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-destructive"
              aria-label="Xóa"
              title="Xóa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ),
        },
      ]}
    />
  );
}
