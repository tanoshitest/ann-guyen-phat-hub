import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { sales, purchases, shippings, fmtVND, fmtDate } from "@/lib/mock-data";
import { FileText } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/hoa-don")({ component: Page });

type InvoiceKind = "Khách hàng" | "NCC" | "Vận chuyển";

type InvoiceRow = {
  soHD: string;
  loai: InvoiceKind;
  doiTac: string;
  chungTu: string;
  ngayHD: string;
  giaTri: number;
  trangThai: string;
};

const invoiceStatuses = ["Đã nhận", "Chưa nhận", "Đã thanh toán", "Còn nợ", "Quá hạn", "Đã hủy"];

function invoiceKey(row: InvoiceRow) {
  return `${row.loai}-${row.soHD}-${row.chungTu}`;
}

function KindTag({ kind }: { kind: InvoiceKind }) {
  const cls =
    kind === "Khách hàng"
      ? "bg-info/15 text-info"
      : kind === "NCC"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";

  return <span className={`px-1.5 py-0.5 text-[11px] rounded ${cls}`}>{kind}</span>;
}

function FileLink({ ext }: { ext: string }) {
  return (
    <a className="inline-flex items-center gap-1 text-info hover:underline">
      <FileText className="w-3.5 h-3.5" /> {ext}
    </a>
  );
}

function Page() {
  const [statusByInvoice, setStatusByInvoice] = useState<Record<string, string>>({});
  const baseRows: InvoiceRow[] = useMemo(
    () =>
      [
        ...sales.map((s) => ({
          soHD: s.soHD,
          loai: "Khách hàng" as const,
          doiTac: s.khachHang,
          chungTu: s.MA_CHUNG_TU,
          ngayHD: s.ngayHD,
          giaTri: s.tongTT,
          trangThai: s.trangThai,
        })),
        ...purchases.map((p) => ({
          soHD: p.soHD,
          loai: "NCC" as const,
          doiTac: p.ncc,
          chungTu: p.MA_CHUNG_TU,
          ngayHD: p.ngayHD,
          giaTri: p.giaTriMua,
          trangThai: "Đã nhận",
        })),
        ...shippings.map((s) => ({
          soHD: s.soHD,
          loai: "Vận chuyển" as const,
          doiTac: s.dvvc,
          chungTu: s.MA_CHUNG_TU,
          ngayHD: s.ngayHD,
          giaTri: s.giaTriVC,
          trangThai: "Đã nhận",
        })),
      ].sort((a, b) => b.ngayHD.localeCompare(a.ngayHD)),
    [],
  );
  const rows = baseRows.map((row) => ({
    ...row,
    trangThai: statusByInvoice[invoiceKey(row)] ?? row.trangThai,
  }));

  return (
    <DataTable
      title="Hóa đơn"
      data={rows}
      searchKeys={["soHD", "doiTac", "chungTu", "loai"]}
      pageSize={100}
      columns={[
        { key: "soHD", label: "Số hóa đơn", width: 110 },
        { key: "loai", label: "Đầu mục", width: 120, render: (r) => <KindTag kind={r.loai} /> },
        { key: "doiTac", label: "Đối tác", width: 240 },
        { key: "chungTu", label: "Mã chứng từ", width: 120 },
        { key: "ngayHD", label: "Ngày HĐ", width: 100, render: (r) => fmtDate(r.ngayHD) },
        { key: "giaTri", label: "Giá trị", width: 150, numeric: true, render: (r) => fmtVND(r.giaTri) },
        { key: "pdf", label: "PDF", width: 70, render: () => <FileLink ext="PDF" /> },
        { key: "xml", label: "XML", width: 70, render: () => <FileLink ext="XML" /> },
        {
          key: "trangThai",
          label: "Trạng thái",
          width: 150,
          render: (r) => (
            <select
              value={r.trangThai}
              onChange={(e) =>
                setStatusByInvoice((current) => ({
                  ...current,
                  [invoiceKey(r)]: e.target.value,
                }))
              }
              className="h-7 w-full rounded border bg-background px-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ),
        },
      ]}
    />
  );
}
