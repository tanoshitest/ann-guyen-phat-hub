import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { sales, fmtVND, fmtDate } from "@/lib/mock-data";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/hd-dau-ra")({ component: Page });

function FileLink({ ext }: { ext: string }) {
  return (
    <a className="inline-flex items-center gap-1 text-info hover:underline">
      <FileText className="w-3.5 h-3.5" /> {ext}
    </a>
  );
}

function Page() {
  const rows = sales.map((s) => ({
    soHD: s.soHD,
    khachHang: s.khachHang,
    ngayHD: s.ngayHD,
    giaTri: s.tongTT,
    trangThai: s.trangThai,
  }));
  return (
    <DataTable
      title="Hóa đơn đầu ra"
      data={rows}
      searchKeys={["soHD", "khachHang"]}
      columns={[
        { key: "soHD", label: "Số hóa đơn", width: 110 },
        { key: "khachHang", label: "Khách hàng", width: 240 },
        { key: "ngayHD", label: "Ngày HĐ", width: 100, render: (r) => fmtDate(r.ngayHD) },
        { key: "giaTri", label: "Giá trị", width: 140, numeric: true, render: (r) => fmtVND(r.giaTri) },
        { key: "pdf", label: "PDF", width: 60, render: () => <FileLink ext="PDF" /> },
        { key: "xml", label: "XML", width: 60, render: () => <FileLink ext="XML" /> },
        {
          key: "trangThai",
          label: "Trạng thái",
          width: 130,
          render: (r) => {
            const cls =
              r.trangThai === "Đã thanh toán"
                ? "bg-success/15 text-success"
                : r.trangThai === "Còn nợ"
                  ? "bg-warning/15 text-warning"
                  : "bg-destructive/15 text-destructive";
            return <span className={`px-1.5 py-0.5 text-[11px] rounded ${cls}`}>{r.trangThai}</span>;
          },
        },
      ]}
    />
  );
}
