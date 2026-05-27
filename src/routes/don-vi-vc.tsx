import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { shippers } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  mergeDemoRows,
  saveDemoRecord,
} from "@/lib/supabase-demo";

export const Route = createFileRoute("/don-vi-vc")({ component: Page });

function Page() {
  const [rows, setRows] = useState(shippers);

  const withDefaults = (record: (typeof shippers)[number], index: number) => ({
    ...record,
    MA_VC: record.MA_VC || `VC_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Don vi van chuyen demo",
    mst: record.mst || "",
    nguoiLienHe: record.nguoiLienHe || "",
    dienThoai: record.dienThoai || "",
    bienSo: record.bienSo || "",
    ghiChu: record.ghiChu || "",
  });

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof shippers)[number]>("shippers"), listDeletedDemoKeys("shippers")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(shippers, safeRows, (row) => row.MA_VC).filter((row) => !deleted.has(row.MA_VC)));
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xoa don vi van chuyen ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_VC !== recordKey));
    void deleteDemoRecord("shippers", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Danh mục đơn vị vận chuyển"
      data={rows}
      searchKeys={["MA_VC", "ten", "bienSo"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("shippers", next.MA_VC, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_VC !== next.MA_VC)];
        });
      }}
      columns={[
        { key: "MA_VC", label: "MA_VC", width: 100 },
        { key: "ten", label: "Tên đơn vị", width: 220 },
        { key: "mst", label: "MST", width: 120 },
        { key: "nguoiLienHe", label: "Người liên hệ", width: 150 },
        { key: "dienThoai", label: "Điện thoại", width: 110 },
        { key: "bienSo", label: "Biển số xe", width: 110 },
        { key: "ghiChu", label: "Ghi chú", width: 200 },
        {
          key: "actions",
          label: "Thao tác",
          width: 80,
          render: (row) => (
            <button
              type="button"
              onClick={() => handleDelete(row.MA_VC)}
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
