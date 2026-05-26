import { createFileRoute } from "@tanstack/react-router";
import { sales, purchases, shippings, expenses, customers, fmtVND } from "@/lib/mock-data";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/bc-loi-nhuan")({ component: Page });

type Row = {
  MA_THONG_KE: string;
  khachHang: string;
  doanhThu: number;
  giaVon: number;
  cpVC: number;
  cpKhac: number;
  loiNhuan: number;
  tySuat: number;
};

function Page() {
  const rows: Row[] = customers.map((c) => {
    const dt = sales.filter((s) => s.MA_THONG_KE === c.MA_THONG_KE).reduce((s, x) => s + x.tongTT, 0);
    const gv = purchases.filter((p) => p.MA_THONG_KE === c.MA_THONG_KE).reduce((s, x) => s + x.giaTriMua, 0);
    const vc = shippings.filter((p) => p.MA_THONG_KE === c.MA_THONG_KE).reduce((s, x) => s + x.giaTriVC, 0);
    const khac = expenses.filter((e) => e.MA_THONG_KE === c.MA_THONG_KE).reduce((s, x) => s + x.soTien, 0);
    const ln = dt - gv - vc - khac;
    return {
      MA_THONG_KE: c.MA_THONG_KE,
      khachHang: c.ten,
      doanhThu: dt,
      giaVon: gv,
      cpVC: vc,
      cpKhac: khac,
      loiNhuan: ln,
      tySuat: dt > 0 ? (ln / dt) * 100 : 0,
    };
  });

  const totalDT = rows.reduce((s, r) => s + r.doanhThu, 0);
  const totalGV = rows.reduce((s, r) => s + r.giaVon, 0);
  const totalLN = rows.reduce((s, r) => s + r.loiNhuan, 0);

  const chartData = rows
    .filter((r) => r.doanhThu > 0)
    .sort((a, b) => b.loiNhuan - a.loiNhuan)
    .slice(0, 10);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Báo cáo lợi nhuận</h1>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          <SumCard label="Tổng doanh thu" value={fmtVND(totalDT) + " ₫"} />
          <SumCard label="Tổng giá vốn" value={fmtVND(totalGV) + " ₫"} />
          <SumCard label="Tổng lợi nhuận" value={fmtVND(totalLN) + " ₫"} highlight />
          <SumCard label="Tỷ suất LN" value={((totalLN / totalDT) * 100).toFixed(1) + "%"} />
        </div>

        <div className="border rounded bg-card">
          <div className="px-3 py-1.5 border-b text-[12px] font-semibold">Top 10 khách hàng theo lợi nhuận</div>
          <div className="p-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="khachHang" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
                <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
                <Legend />
                <Bar dataKey="doanhThu" fill="oklch(0.45 0.15 250)" name="Doanh thu" />
                <Bar dataKey="loiNhuan" fill="oklch(0.55 0.15 150)" name="Lợi nhuận" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border rounded bg-card overflow-auto">
          <table className="sheet-table">
            <thead>
              <tr>
                <th>MA_THONG_KE</th>
                <th>Khách hàng</th>
                <th className="num">Doanh thu</th>
                <th className="num">Giá vốn</th>
                <th className="num">CP vận chuyển</th>
                <th className="num">CP khác</th>
                <th className="num">Lợi nhuận</th>
                <th className="num">Tỷ suất %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.MA_THONG_KE}>
                  <td>{r.MA_THONG_KE}</td>
                  <td>{r.khachHang}</td>
                  <td className="num">{fmtVND(r.doanhThu)}</td>
                  <td className="num">{fmtVND(r.giaVon)}</td>
                  <td className="num">{fmtVND(r.cpVC)}</td>
                  <td className="num">{fmtVND(r.cpKhac)}</td>
                  <td className={`num font-semibold ${r.loiNhuan >= 0 ? "text-success" : "text-destructive"}`}>{fmtVND(r.loiNhuan)}</td>
                  <td className="num">{r.tySuat.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-semibold bg-muted">
                <td colSpan={2}>TỔNG CỘNG</td>
                <td className="num">{fmtVND(totalDT)}</td>
                <td className="num">{fmtVND(totalGV)}</td>
                <td className="num">{fmtVND(rows.reduce((s, r) => s + r.cpVC, 0))}</td>
                <td className="num">{fmtVND(rows.reduce((s, r) => s + r.cpKhac, 0))}</td>
                <td className="num text-success">{fmtVND(totalLN)}</td>
                <td className="num">{((totalLN / totalDT) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SumCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border rounded p-2.5 bg-card ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-[15px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}
