import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { purchases, fmtVND, fmtDate } from "@/lib/mock-data";

export const Route = createFileRoute("/mua-hang")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Mua hàng"
      data={purchases}
      searchKeys={["MA_CHUNG_TU", "ncc", "maSP", "soHD"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 100 },
        { key: "ncc", label: "Nhà cung cấp", width: 200 },
        { key: "maSP", label: "Mã SP", width: 70 },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        { key: "donGia", label: "Đơn giá", width: 90, numeric: true, render: (r) => fmtVND(r.donGia) },
        { key: "giaTriMua", label: "Giá trị mua", width: 120, numeric: true, render: (r) => fmtVND(r.giaTriMua) },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        { key: "congJumbo", label: "Cộng Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.congJumbo) },
        { key: "truJumbo", label: "Trừ Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.truJumbo) },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
      ]}
    />
  );
}
