import { createFileRoute } from "@tanstack/react-router";
import { expenses, shippings, fmtVND, expenseTypes } from "@/lib/mock-data";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/bc-chi-phi")({ component: Page });

function Page() {
  const byType: Record<string, number> = {};
  expenseTypes.forEach((t) => (byType[t.ten] = 0));
  expenses.forEach((e) => (byType[e.loaiCP] = (byType[e.loaiCP] || 0) + e.soTien));
  byType["Chi phí vận chuyển"] = (byType["Chi phí vận chuyển"] || 0) + shippings.reduce((s, x) => s + x.giaTriVC, 0);
  const rows = Object.entries(byType).map(([loai, sum]) => ({ loai, sum }));
  const total = rows.reduce((s, r) => s + r.sum, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Báo cáo chi phí</h1>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="border rounded bg-card p-2">
          <div className="text-[12px] font-semibold mb-2 px-2">Chi phí theo loại (Tổng: {fmtVND(total)} ₫)</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rows} layout="vertical" margin={{ left: 140 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
              <YAxis dataKey="loai" type="category" fontSize={11} width={180} />
              <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
              <Bar dataKey="sum" fill="oklch(0.7 0.16 60)" name="Chi phí" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border rounded bg-card overflow-auto">
          <table className="sheet-table">
            <thead><tr><th>Loại chi phí</th><th className="num">Tổng</th><th className="num">Tỷ trọng</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.loai}>
                  <td>{r.loai}</td>
                  <td className="num">{fmtVND(r.sum)}</td>
                  <td className="num">{((r.sum / total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-semibold bg-muted"><td>TỔNG</td><td className="num">{fmtVND(total)}</td><td className="num">100%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
