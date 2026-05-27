import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { deleteDemoRecord, listDeletedDemoKeys, listDemoRecords, mergeDemoRows, saveDemoRecord } from "@/lib/supabase-demo";
import { Trash2 } from "lucide-react";
import {
  customers,
  expenses,
  expenseTypes,
  purchases,
  sales,
  shippers,
  shippings,
  suppliers,
  fmtVND,
  fmtDate,
} from "@/lib/mock-data";

export const Route = createFileRoute("/chi-phi")({ component: Page });

function Page() {
  const [rows, setRows] = useState(expenses);
  const statisticOptions = customers.map((customer) => customer.MA_THONG_KE);
  const objectOptions = [
    ...customers.map((customer) => customer.ten),
    ...suppliers.map((supplier) => supplier.ten),
    ...shippers.map((shipper) => shipper.ten),
  ];
  const documentOptions = [
    ...sales.map((sale) => sale.MA_CHUNG_TU),
    ...purchases.map((purchase) => purchase.MA_CHUNG_TU),
    ...shippings.map((shipping) => shipping.MA_CHUNG_TU),
  ];
  const today = new Date().toISOString().slice(0, 10);
  const withDefaults = (record: (typeof expenses)[number], index: number) => ({
    ...record,
    MA_CHI_PHI: record.MA_CHI_PHI || `CPDEMO${String(index + 1).padStart(4, "0")}`,
    ngay: record.ngay || today,
    lyDo: record.lyDo || "",
    soTien: record.soTien || 0,
    ghiChu: record.ghiChu || "",
  });

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof expenses)[number]>("expenses"), listDeletedDemoKeys("expenses")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(expenses, safeRows, (row) => row.MA_CHI_PHI).filter((row) => !deleted.has(row.MA_CHI_PHI)));
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xóa chi phí ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_CHI_PHI !== recordKey));
    void deleteDemoRecord("expenses", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Chi phí"
      data={rows}
      searchKeys={["MA_CHI_PHI", "loaiCP", "doiTuong", "MA_CHUNG_TU", "lyDo"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("expenses", next.MA_CHI_PHI, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_CHI_PHI !== next.MA_CHI_PHI)];
        });
      }}
      columns={[
        { key: "MA_CHI_PHI", label: "MA_CHI_PHI", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "loaiCP", label: "Loại chi phí", width: 170, options: expenseTypes.map((type) => type.ten) },
        { key: "doiTuong", label: "Đối tượng", width: 200, options: objectOptions },
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110, options: documentOptions },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 110, options: statisticOptions },
        { key: "lyDo", label: "Lý do chi", width: 200 },
        { key: "soTien", label: "Số tiền", width: 130, numeric: true, render: (r) => fmtVND(r.soTien) },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
        {
          key: "actions",
          label: "Thao tÃ¡c",
          width: 80,
          render: (row) => (
            <button
              type="button"
              onClick={() => handleDelete(row.MA_CHI_PHI)}
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
