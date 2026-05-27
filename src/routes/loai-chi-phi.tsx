import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { DataTable } from "@/components/DataTable";
import { expenseTypes } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  mergeDemoRows,
  saveDemoRecord,
} from "@/lib/supabase-demo";

export const Route = createFileRoute("/loai-chi-phi")({ component: Page });

function Page() {
  const [rows, setRows] = useState(expenseTypes);

  const withDefaults = (record: (typeof expenseTypes)[number], index: number) => ({
    ...record,
    MA_LOAI_CP: record.MA_LOAI_CP || `CP_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Loai chi phi demo",
  });

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof expenseTypes)[number]>("expense_types"), listDeletedDemoKeys("expense_types")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(expenseTypes, safeRows, (row) => row.MA_LOAI_CP).filter((row) => !deleted.has(row.MA_LOAI_CP)));
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xoa loai chi phi ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_LOAI_CP !== recordKey));
    void deleteDemoRecord("expense_types", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Danh mục loại chi phí"
      data={rows}
      searchKeys={["ten"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("expense_types", next.MA_LOAI_CP, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_LOAI_CP !== next.MA_LOAI_CP)];
        });
      }}
      columns={[
        { key: "MA_LOAI_CP", label: "MA_LOAI_CP", width: 120 },
        { key: "ten", label: "Tên loại chi phí", width: 300 },
        {
          key: "actions",
          label: "Thao tác",
          width: 80,
          render: (row) => (
            <button
              type="button"
              onClick={() => handleDelete(row.MA_LOAI_CP)}
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
