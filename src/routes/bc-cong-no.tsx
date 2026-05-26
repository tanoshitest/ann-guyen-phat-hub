import { createFileRoute } from "@tanstack/react-router";
import { sales, purchases, shippings, customers, suppliers, shippers, fmtVND } from "@/lib/mock-data";

export const Route = createFileRoute("/bc-cong-no")({ component: Page });

function Page() {
  const cnKH = customers.map((c) => {
    const tong = sales.filter((s) => s.MA_THONG_KE === c.MA_THONG_KE).reduce((s, x) => s + x.tongTT, 0);
    const no = sales.filter((s) => s.MA_THONG_KE === c.MA_THONG_KE && s.trangThai !== "Đã thanh toán").reduce((s, x) => s + x.tongTT, 0);
    return { ten: c.ten, tong, no };
  });
  const cnNCC = suppliers.map((s) => {
    const tong = purchases.filter((p) => p.ncc === s.ten).reduce((a, x) => a + x.giaTriMua, 0);
    return { ten: s.ten, tong, no: Math.round(tong * 0.3) };
  });
  const cnVC = shippers.map((s) => {
    const tong = shippings.filter((p) => p.dvvc === s.ten).reduce((a, x) => a + x.giaTriVC, 0);
    return { ten: s.ten, tong, no: Math.round(tong * 0.25) };
  });

  const tongPhaiThu = cnKH.reduce((s, r) => s + r.no, 0);
  const tongPhaiTraNCC = cnNCC.reduce((s, r) => s + r.no, 0);
  const tongPhaiTraVC = cnVC.reduce((s, r) => s + r.no, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Báo cáo công nợ</h1>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Card label="Phải thu khách hàng" v={fmtVND(tongPhaiThu) + " ₫"} color="text-warning" />
          <Card label="Phải trả nhà cung cấp" v={fmtVND(tongPhaiTraNCC) + " ₫"} color="text-info" />
          <Card label="Phải trả vận chuyển" v={fmtVND(tongPhaiTraVC) + " ₫"} color="text-destructive" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Section title="Công nợ khách hàng" rows={cnKH} />
          <Section title="Công nợ nhà cung cấp" rows={cnNCC} />
          <Section title="Công nợ vận chuyển" rows={cnVC} />
        </div>
      </div>
    </div>
  );
}

function Card({ label, v, color }: { label: string; v: string; color: string }) {
  return (
    <div className="border rounded p-3 bg-card">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-[18px] font-semibold tabular-nums ${color}`}>{v}</div>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: { ten: string; tong: number; no: number }[] }) {
  return (
    <div className="border rounded bg-card">
      <div className="px-3 py-1.5 border-b text-[12px] font-semibold">{title}</div>
      <div className="max-h-[420px] overflow-auto">
        <table className="sheet-table">
          <thead><tr><th>Đối tượng</th><th className="num">Tổng</th><th className="num">Còn nợ</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ten}>
                <td>{r.ten}</td>
                <td className="num">{fmtVND(r.tong)}</td>
                <td className={`num ${r.no > 0 ? "text-warning font-semibold" : "text-success"}`}>{fmtVND(r.no)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
