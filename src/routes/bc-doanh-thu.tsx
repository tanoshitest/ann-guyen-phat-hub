import { createFileRoute } from "@tanstack/react-router";
import { sales, fmtVND } from "@/lib/mock-data";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/bc-doanh-thu")({ component: Page });

function Page() {
  const monthly: Record<string, { thang: string; dt: number; sl: number }> = {};
  for (let i = 1; i <= 12; i++) monthly[`T${i}`] = { thang: `T${i}`, dt: 0, sl: 0 };
  sales.forEach((s) => {
    const m = parseInt(s.ngay.slice(5, 7));
    monthly[`T${m}`].dt += s.tongTT;
    monthly[`T${m}`].sl += 1;
  });
  const rows = Object.values(monthly);
  const total = rows.reduce((s, r) => s + r.dt, 0);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Báo cáo doanh thu</h1>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="border rounded bg-card p-2">
          <div className="text-[12px] font-semibold mb-2 px-2">Doanh thu theo tháng (Tổng: {fmtVND(total)} ₫)</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="thang" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
              <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
              <Bar dataKey="dt" fill="oklch(0.45 0.15 250)" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border rounded bg-card overflow-auto">
          <table className="sheet-table">
            <thead><tr><th>Tháng</th><th className="num">Số đơn</th><th className="num">Doanh thu</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.thang}><td>{r.thang}</td><td className="num">{r.sl}</td><td className="num">{fmtVND(r.dt)}</td></tr>
              ))}
              <tr className="font-semibold bg-muted"><td>TỔNG</td><td className="num">{sales.length}</td><td className="num">{fmtVND(total)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
