import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { customers, products, sales, fmtVND, fmtDate } from "@/lib/mock-data";
import { listDemoRecords, mergeDemoRows, saveDemoRecord } from "@/lib/supabase-demo";
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
  const [rows, setRows] = useState(sales);
  const customerOptions = customers.map((customer) => customer.ten);
  const statisticOptions = customers.map((customer) => customer.MA_THONG_KE);
  const productOptions = products.map((product) => product.MA_SP);
  const today = new Date().toISOString().slice(0, 10);
  const withDefaults = (record: (typeof sales)[number], index: number) => {
    const soLuong = record.soLuong || 0;
    const donGia = record.donGia || 0;
    const vat = record.vat || 0;
    const congJumbo = record.congJumbo || 0;
    const truJumbo = record.truJumbo || 0;
    const giaTriBan = record.giaTriBan || soLuong * donGia;
    const tienVat = record.tienVat || Math.round((giaTriBan * vat) / 100);
    return {
      ...record,
      MA_CHUNG_TU: record.MA_CHUNG_TU || `BANDEMO${String(index + 1).padStart(4, "0")}`,
      ngay: record.ngay || today,
      soLuong,
      donGia,
      giaTriBan,
      vat,
      tienVat,
      tongTT: record.tongTT || giaTriBan + tienVat + congJumbo - truJumbo,
      congJumbo,
      truJumbo,
      hoaHong: record.hoaHong || 0,
      dienGiai: record.dienGiai || "",
      ngayHD: record.ngayHD || record.ngay || today,
      soHD: record.soHD || `DEMO${String(index + 1).padStart(6, "0")}`,
      trangThai: record.trangThai || "Còn nợ",
    };
  };

  useEffect(() => {
    listDemoRecords<(typeof sales)[number]>("sales")
      .then((demoRows) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        setRows(mergeDemoRows(sales, safeRows, (row) => row.MA_CHUNG_TU));
      })
      .catch(console.error);
  }, []);

  return (
    <DataTable
      title="Bán hàng"
      data={rows}
      searchKeys={["MA_CHUNG_TU", "khachHang", "maSP", "soHD", "MA_THONG_KE"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("sales", next.MA_CHUNG_TU, next).catch(console.error);
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
        { key: "khachHang", label: "Khách hàng", width: 200, options: customerOptions },
        { key: "maSP", label: "Mã SP", width: 70, options: productOptions },
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
