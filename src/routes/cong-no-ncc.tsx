import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { purchases, suppliers, fmtVND } from "@/lib/mock-data";

export const Route = createFileRoute("/cong-no-ncc")({ component: Page });

function Page() {
  const map: Record<string, { ncc: string; tongMua: number; daTra: number; conNo: number; quaHan: number }> = {};
  suppliers.forEach((s) => (map[s.ten] = { ncc: s.ten, tongMua: 0, daTra: 0, conNo: 0, quaHan: 0 }));
  purchases.forEach((p, i) => {
    const r = map[p.ncc];
    if (!r) return;
    r.tongMua += p.giaTriMua;
    const paid = i % 3 !== 0 ? p.giaTriMua : Math.round(p.giaTriMua * 0.4);
    r.daTra += paid;
    r.conNo += p.giaTriMua - paid;
    if (i % 7 === 0) r.quaHan += (p.giaTriMua - paid) * 0.5;
  });
  const rows = Object.values(map);
  return (
    <DataTable
      title="Công nợ nhà cung cấp"
      data={rows}
      searchKeys={["ncc"]}
      columns={[
        { key: "ncc", label: "Nhà cung cấp", width: 260 },
        { key: "tongMua", label: "Tổng mua", width: 150, numeric: true, render: (r) => fmtVND(r.tongMua) },
        { key: "daTra", label: "Đã trả", width: 150, numeric: true, render: (r) => fmtVND(r.daTra) },
        { key: "conNo", label: "Còn nợ", width: 150, numeric: true, render: (r) => fmtVND(r.conNo) },
        { key: "quaHan", label: "Quá hạn", width: 150, numeric: true, render: (r) => fmtVND(r.quaHan) },
      ]}
    />
  );
}
