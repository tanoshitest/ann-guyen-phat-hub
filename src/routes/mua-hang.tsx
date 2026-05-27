import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { customers, products, purchases, suppliers, fmtVND, fmtDate } from "@/lib/mock-data";

export const Route = createFileRoute("/mua-hang")({ component: Page });

function Page() {
  const [rows, setRows] = useState(purchases);
  const supplierOptions = suppliers.map((supplier) => supplier.ten);
  const statisticOptions = customers.map((customer) => customer.MA_THONG_KE);
  const productOptions = products.map((product) => product.MA_SP);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <DataTable
      title="Mua hàng"
      data={rows}
      searchKeys={["MA_CHUNG_TU", "ncc", "maSP", "soHD"]}
      onAdd={(record) => {
        setRows((prev) => {
          const giaTriMua = record.giaTriMua || record.soLuong * record.donGia;
          return [
            {
              ...record,
              MA_CHUNG_TU: record.MA_CHUNG_TU || `MUADEMO${String(prev.length + 1).padStart(4, "0")}`,
              ngay: record.ngay || today,
              giaTriMua,
              ngayHD: record.ngayHD || record.ngay || today,
              soHD: record.soHD || `DEMO${String(prev.length + 1).padStart(6, "0")}`,
            },
            ...prev,
          ];
        });
      }}
      columns={[
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 100, options: statisticOptions },
        { key: "ncc", label: "Nhà cung cấp", width: 200, options: supplierOptions },
        { key: "maSP", label: "Mã SP", width: 70, options: productOptions },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        { key: "donGia", label: "Đơn giá", width: 90, numeric: true, render: (r) => fmtVND(r.donGia) },
        { key: "giaTriMua", label: "Giá trị mua", width: 120, numeric: true, render: (r) => fmtVND(r.giaTriMua) },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        { key: "congJumbo", label: "Cộng Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.congJumbo) },
        { key: "truJumbo", label: "Trừ Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.truJumbo) },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
      ]}
    />
  );
}
