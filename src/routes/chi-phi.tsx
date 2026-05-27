import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { listDemoRecords, mergeDemoRows, saveDemoRecord } from "@/lib/supabase-demo";
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
    listDemoRecords<(typeof expenses)[number]>("expenses")
      .then((demoRows) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        setRows(mergeDemoRows(expenses, safeRows, (row) => row.MA_CHI_PHI));
      })
      .catch(console.error);
  }, []);

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
      ]}
    />
  );
}
