import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { shippings, shippers, fmtVND } from "@/lib/mock-data";

export const Route = createFileRoute("/cong-no-vc")({ component: Page });

function Page() {
  const map: Record<string, { dvvc: string; tongPhi: number; daTra: number; conNo: number }> = {};
  shippers.forEach((s) => (map[s.ten] = { dvvc: s.ten, tongPhi: 0, daTra: 0, conNo: 0 }));
  shippings.forEach((p, i) => {
    const r = map[p.dvvc];
    if (!r) return;
    r.tongPhi += p.giaTriVC;
    const paid = i % 4 !== 0 ? p.giaTriVC : Math.round(p.giaTriVC * 0.5);
    r.daTra += paid;
    r.conNo += p.giaTriVC - paid;
  });
  const rows = Object.values(map);
  return (
    <DataTable
      title="Công nợ vận chuyển"
      data={rows}
      searchKeys={["dvvc"]}
      columns={[
        { key: "dvvc", label: "Đơn vị vận chuyển", width: 260 },
        { key: "tongPhi", label: "Tổng phí", width: 150, numeric: true, render: (r) => fmtVND(r.tongPhi) },
        { key: "daTra", label: "Đã trả", width: 150, numeric: true, render: (r) => fmtVND(r.daTra) },
        { key: "conNo", label: "Còn nợ", width: 150, numeric: true, render: (r) => fmtVND(r.conNo) },
      ]}
    />
  );
}
