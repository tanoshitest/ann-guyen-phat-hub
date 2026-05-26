import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { sales, purchases, fmtVND, fmtDate } from "@/lib/mock-data";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/kho-hoa-don")({ component: Page });

function Page() {
  const rows = [
    ...sales.map((s) => ({ soHD: s.soHD, loai: "Đầu ra", doiTac: s.khachHang, ngay: s.ngayHD, giaTri: s.tongTT })),
    ...purchases.map((p) => ({ soHD: p.soHD, loai: "Đầu vào", doiTac: p.ncc, ngay: p.ngayHD, giaTri: p.giaTriMua })),
  ];
  return (
    <DataTable
      title="Kho hóa đơn"
      data={rows}
      searchKeys={["soHD", "doiTac"]}
      pageSize={100}
      columns={[
        { key: "soHD", label: "Số HĐ", width: 110 },
        { key: "loai", label: "Loại", width: 100, render: (r) => <span className={`px-1.5 py-0.5 text-[11px] rounded ${r.loai === "Đầu ra" ? "bg-info/15 text-info" : "bg-accent text-accent-foreground"}`}>{r.loai}</span> },
        { key: "doiTac", label: "Đối tác", width: 240 },
        { key: "ngay", label: "Ngày", width: 100, render: (r) => fmtDate(r.ngay) },
        { key: "giaTri", label: "Giá trị", width: 150, numeric: true, render: (r) => fmtVND(r.giaTri) },
        { key: "file", label: "File", width: 120, render: () => <span className="inline-flex gap-2 text-info"><FileText className="w-3.5 h-3.5"/><FileText className="w-3.5 h-3.5"/></span> },
      ]}
    />
  );
}
