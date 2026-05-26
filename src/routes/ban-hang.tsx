import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { sales, fmtVND, fmtDate } from "@/lib/mock-data";
import { Eye, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ban-hang")({ component: Page });

function StatusBadge({ s }: { s: string }) {
  const cls =
    s === "Đã thanh toán"
      ? "bg-success/15 text-success"
      : s === "Còn nợ"
        ? "bg-warning/15 text-warning"
        : "bg-destructive/15 text-destructive";
  return <span className={`px-1.5 py-0.5 text-[11px] rounded ${cls}`}>{s}</span>;
}

function Page() {
  return (
    <DataTable
      title="Bán hàng"
      data={sales}
      searchKeys={["MA_CHUNG_TU", "khachHang", "maSP", "soHD", "MA_THONG_KE"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 100 },
        { key: "khachHang", label: "Khách hàng", width: 200 },
        { key: "maSP", label: "Mã SP", width: 70 },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        { key: "donGia", label: "Đơn giá", width: 90, numeric: true, render: (r) => fmtVND(r.donGia) },
        { key: "giaTriBan", label: "Giá trị bán", width: 120, numeric: true, render: (r) => fmtVND(r.giaTriBan) },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        { key: "tienVat", label: "Tiền VAT", width: 100, numeric: true, render: (r) => fmtVND(r.tienVat) },
        { key: "tongTT", label: "Tổng TT", width: 120, numeric: true, render: (r) => fmtVND(r.tongTT) },
        { key: "congJumbo", label: "Cộng Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.congJumbo) },
        { key: "truJumbo", label: "Trừ Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.truJumbo) },
        { key: "hoaHong", label: "Hoa hồng", width: 100, numeric: true, render: (r) => fmtVND(r.hoaHong) },
        { key: "dienGiai", label: "Diễn giải", width: 240 },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
        { key: "trangThai", label: "Trạng thái", width: 120, render: (r) => <StatusBadge s={r.trangThai} /> },
        {
          key: "actions",
          label: "Thao tác",
          width: 90,
          render: () => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" />
              <Pencil className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" />
              <Trash2 className="w-3.5 h-3.5 cursor-pointer hover:text-destructive" />
            </div>
          ),
        },
      ]}
    />
  );
}
