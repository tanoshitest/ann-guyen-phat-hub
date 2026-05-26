import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { purchases, fmtVND, fmtDate } from "@/lib/mock-data";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/hd-dau-vao")({ component: Page });

function Page() {
  const rows = purchases.map((s) => ({
    soHD: s.soHD,
    ncc: s.ncc,
    ngayHD: s.ngayHD,
    giaTri: s.giaTriMua,
    trangThai: "Đã nhận",
  }));
  return (
    <DataTable
      title="Hóa đơn đầu vào"
      data={rows}
      searchKeys={["soHD", "ncc"]}
      columns={[
        { key: "soHD", label: "Số hóa đơn", width: 110 },
        { key: "ncc", label: "NCC", width: 240 },
        { key: "ngayHD", label: "Ngày HĐ", width: 100, render: (r) => fmtDate(r.ngayHD) },
        { key: "giaTri", label: "Giá trị", width: 140, numeric: true, render: (r) => fmtVND(r.giaTri) },
        { key: "pdf", label: "PDF", width: 60, render: () => <a className="inline-flex items-center gap-1 text-info hover:underline"><FileText className="w-3.5 h-3.5"/>PDF</a> },
        { key: "xml", label: "XML", width: 60, render: () => <a className="inline-flex items-center gap-1 text-info hover:underline"><FileText className="w-3.5 h-3.5"/>XML</a> },
        { key: "trangThai", label: "Trạng thái", width: 110, render: () => <span className="px-1.5 py-0.5 text-[11px] rounded bg-success/15 text-success">Đã nhận</span> },
      ]}
    />
  );
}
