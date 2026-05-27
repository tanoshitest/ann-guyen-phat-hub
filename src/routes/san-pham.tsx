import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { products } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  mergeDemoRows,
  saveDemoRecord,
} from "@/lib/supabase-demo";

export const Route = createFileRoute("/san-pham")({ component: Page });

function Page() {
  const [rows, setRows] = useState(products);

  const withDefaults = (record: (typeof products)[number], index: number) => ({
    ...record,
    MA_SP: record.MA_SP || `SP_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "San pham demo",
    dvt: record.dvt || "kg",
    vat: record.vat || 0,
  });

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof products)[number]>("products"), listDeletedDemoKeys("products")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(products, safeRows, (row) => row.MA_SP).filter((row) => !deleted.has(row.MA_SP)));
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xoa san pham ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_SP !== recordKey));
    void deleteDemoRecord("products", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Danh mục sản phẩm"
      data={rows}
      searchKeys={["MA_SP", "ten"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("products", next.MA_SP, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_SP !== next.MA_SP)];
        });
      }}
      columns={[
        { key: "MA_SP", label: "MA_SP", width: 100 },
        { key: "ten", label: "Tên sản phẩm", width: 260 },
        { key: "dvt", label: "Đơn vị tính", width: 100 },
        { key: "vat", label: "VAT (%)", width: 80, numeric: true },
        {
          key: "actions",
          label: "Thao tác",
          width: 80,
          render: (row) => (
            <button
              type="button"
              onClick={() => handleDelete(row.MA_SP)}
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
