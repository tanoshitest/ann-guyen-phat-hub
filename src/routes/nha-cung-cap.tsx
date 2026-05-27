import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { suppliers } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  mergeDemoRows,
  saveDemoRecord,
} from "@/lib/supabase-demo";

export const Route = createFileRoute("/nha-cung-cap")({ component: Page });

function Page() {
  const [rows, setRows] = useState(suppliers);

  const withDefaults = (record: (typeof suppliers)[number], index: number) => ({
    ...record,
    MA_NCC: record.MA_NCC || `NCC_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Nha cung cap demo",
    mst: record.mst || "",
    diaChi: record.diaChi || "",
    nguoiLienHe: record.nguoiLienHe || "",
    dienThoai: record.dienThoai || "",
    email: record.email || "",
    ghiChu: record.ghiChu || "",
  });

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof suppliers)[number]>("suppliers"), listDeletedDemoKeys("suppliers")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(suppliers, safeRows, (row) => row.MA_NCC).filter((row) => !deleted.has(row.MA_NCC)));
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xoa nha cung cap ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_NCC !== recordKey));
    void deleteDemoRecord("suppliers", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Danh mục nhà cung cấp"
      data={rows}
      searchKeys={["MA_NCC", "ten", "mst"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("suppliers", next.MA_NCC, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_NCC !== next.MA_NCC)];
        });
      }}
      columns={[
        { key: "MA_NCC", label: "MA_NCC", width: 110 },
        { key: "ten", label: "Tên NCC", width: 240 },
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
              onClick={() => handleDelete(row.MA_NCC)}
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
