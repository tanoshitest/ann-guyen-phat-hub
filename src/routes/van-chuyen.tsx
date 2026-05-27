import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { customers, products, shippers, shippings, fmtVND, fmtDate } from "@/lib/mock-data";
import { listDemoRecords, mergeDemoRows, saveDemoRecord } from "@/lib/supabase-demo";

export const Route = createFileRoute("/van-chuyen")({ component: Page });

function Page() {
  const [rows, setRows] = useState(shippings);
  const shipperOptions = shippers.map((shipper) => shipper.ten);
  const plateOptions = shippers.map((shipper) => shipper.bienSo);
  const statisticOptions = customers.map((customer) => customer.MA_THONG_KE);
  const productOptions = products.map((product) => product.MA_SP);
  const today = new Date().toISOString().slice(0, 10);
  const withDefaults = (record: (typeof shippings)[number], index: number) => {
    const soLuong = record.soLuong || 0;
    const donGia = record.donGia || 0;
    return {
      ...record,
      MA_CHUNG_TU: record.MA_CHUNG_TU || `VCDEMO${String(index + 1).padStart(4, "0")}`,
      ngay: record.ngay || today,
      soLuong,
      donGia,
      giaTriVC: record.giaTriVC || soLuong * donGia,
      vat: record.vat || 0,
      ghiChu: record.ghiChu || "",
      ngayHD: record.ngayHD || record.ngay || today,
      soHD: record.soHD || `DEMO${String(index + 1).padStart(6, "0")}`,
    };
  };

  useEffect(() => {
    listDemoRecords<(typeof shippings)[number]>("shippings")
      .then((demoRows) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        setRows(mergeDemoRows(shippings, safeRows, (row) => row.MA_CHUNG_TU));
      })
      .catch(console.error);
  }, []);

  return (
    <DataTable
      title="Vận chuyển"
      data={rows}
      searchKeys={["MA_CHUNG_TU", "dvvc", "bienSo", "maSP", "soHD"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("shippings", next.MA_CHUNG_TU, next).catch(console.error);
          return [
            next,
            ...prev.filter((row) => row.MA_CHUNG_TU !== next.MA_CHUNG_TU),
          ];
        });
      }}
      columns={[
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 100, options: statisticOptions },
        { key: "dvvc", label: "Đơn vị VC", width: 200, options: shipperOptions },
        { key: "bienSo", label: "Biển số xe", width: 110, options: plateOptions },
        { key: "maSP", label: "Mã SP", width: 70, options: productOptions },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        { key: "donGia", label: "Đơn giá", width: 90, numeric: true, render: (r) => fmtVND(r.donGia) },
        { key: "giaTriVC", label: "Giá trị VC", width: 120, numeric: true, render: (r) => fmtVND(r.giaTriVC) },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
      ]}
    />
  );
}
