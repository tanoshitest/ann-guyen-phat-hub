import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { sales, customers, fmtVND } from "@/lib/mock-data";

export const Route = createFileRoute("/cong-no-kh")({ component: Page });

type Row = {
  MA_THONG_KE: string;
  khachHang: string;
  tongBan: number;
  daThu: number;
  conNo: number;
  quaHan: number;
  trangThai: "Đã thanh toán" | "Còn nợ" | "Quá hạn";
};

function Page() {
  const map: Record<string, Row> = {};
  customers.forEach((c) => {
    map[c.MA_THONG_KE] = {
      MA_THONG_KE: c.MA_THONG_KE,
      khachHang: c.ten,
      tongBan: 0,
      daThu: 0,
      conNo: 0,
      quaHan: 0,
      trangThai: "Đã thanh toán",
    };
  });
  sales.forEach((s) => {
    const r = map[s.MA_THONG_KE];
    if (!r) return;
    r.tongBan += s.tongTT;
    if (s.trangThai === "Đã thanh toán") r.daThu += s.tongTT;
    else r.conNo += s.tongTT;
    if (s.trangThai === "Quá hạn") r.quaHan += s.tongTT;
  });
  const rows = Object.values(map).map((r) => ({
    ...r,
    trangThai: r.quaHan > 0 ? "Quá hạn" : r.conNo > 0 ? "Còn nợ" : "Đã thanh toán",
  })) as Row[];

  return (
    <DataTable
      title="Công nợ khách hàng"
      data={rows}
      searchKeys={["MA_THONG_KE", "khachHang"]}
      columns={[
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 120 },
        { key: "khachHang", label: "Khách hàng", width: 240 },
        { key: "tongBan", label: "Tổng bán", width: 140, numeric: true, render: (r) => fmtVND(r.tongBan) },
        { key: "daThu", label: "Đã thu", width: 140, numeric: true, render: (r) => fmtVND(r.daThu) },
        { key: "conNo", label: "Còn nợ", width: 140, numeric: true, render: (r) => fmtVND(r.conNo) },
        { key: "quaHan", label: "Quá hạn", width: 140, numeric: true, render: (r) => fmtVND(r.quaHan) },
        {
          key: "trangThai",
          label: "Trạng thái",
          width: 140,
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
