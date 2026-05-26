import { createFileRoute } from "@tanstack/react-router";
import { sales, purchases, shippings, expenses, fmtVND, customers, suppliers } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Truck,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function kpi(value: number) {
  return fmtVND(value) + " ₫";
}

function Dashboard() {
  const doanhThu = sales.reduce((s, x) => s + x.tongTT, 0);
  const giaTriMua = purchases.reduce((s, x) => s + x.giaTriMua, 0);
  const chiPhiVC = shippings.reduce((s, x) => s + x.giaTriVC, 0);
  const chiPhiKhac = expenses.reduce((s, x) => s + x.soTien, 0);
  const phaiThu = sales.filter((s) => s.trangThai !== "Đã thanh toán").reduce((s, x) => s + x.tongTT, 0);
  const phaiTra = giaTriMua * 0.35;
  const loiNhuan = doanhThu - giaTriMua - chiPhiVC - chiPhiKhac;

  // monthly aggregation
  const monthly: Record<string, { thang: string; dt: number; cp: number }> = {};
  for (let i = 1; i <= 12; i++) {
    const k = `T${i}`;
    monthly[k] = { thang: k, dt: 0, cp: 0 };
  }
  sales.forEach((s) => {
    const m = parseInt(s.ngay.slice(5, 7));
    monthly[`T${m}`].dt += s.tongTT;
  });
  expenses.forEach((e) => {
    const m = parseInt(e.ngay.slice(5, 7));
    monthly[`T${m}`].cp += e.soTien;
  });
  shippings.forEach((e) => {
    const m = parseInt(e.ngay.slice(5, 7));
    monthly[`T${m}`].cp += e.giaTriVC;
  });
  const chartData = Object.values(monthly);

  // top customers
  const cusMap: Record<string, number> = {};
  sales.forEach((s) => (cusMap[s.khachHang] = (cusMap[s.khachHang] || 0) + s.tongTT));
  const topCus = Object.entries(cusMap)
    .map(([ten, v]) => ({ ten, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const supMap: Record<string, number> = {};
  purchases.forEach((s) => (supMap[s.ncc] = (supMap[s.ncc] || 0) + s.giaTriMua));
  const topSup = Object.entries(supMap)
    .map(([ten, v]) => ({ ten, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const activities = [
    ...sales.slice(-5).map((s) => ({ ngay: s.ngay, loai: "Bán hàng", noiDung: `${s.MA_CHUNG_TU} - ${s.khachHang}`, tien: s.tongTT })),
    ...purchases.slice(-5).map((s) => ({ ngay: s.ngay, loai: "Mua hàng", noiDung: `${s.MA_CHUNG_TU} - ${s.ncc}`, tien: s.giaTriMua })),
    ...expenses.slice(-3).map((s) => ({ ngay: s.ngay, loai: "Chi phí", noiDung: `${s.MA_CHI_PHI} - ${s.lyDo}`, tien: s.soTien })),
  ]
    .sort((a, b) => b.ngay.localeCompare(a.ngay))
    .slice(0, 12);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Dashboard</h1>
        <div className="text-[12px] text-muted-foreground">
          Cập nhật: {new Date().toLocaleString("vi-VN")}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-7 gap-2">
          <KpiCard label="Doanh thu tháng" value={kpi(doanhThu)} trend="+12.4%" up icon={<TrendingUp className="w-4 h-4" />} />
          <KpiCard label="Giá trị mua tháng" value={kpi(giaTriMua)} trend="+8.1%" up icon={<TrendingDown className="w-4 h-4" />} />
          <KpiCard label="Chi phí vận chuyển" value={kpi(chiPhiVC)} trend="-3.2%" icon={<Truck className="w-4 h-4" />} />
          <KpiCard label="Chi phí khác" value={kpi(chiPhiKhac)} trend="+2.5%" up icon={<Receipt className="w-4 h-4" />} />
          <KpiCard label="Công nợ phải thu" value={kpi(phaiThu)} trend="+5.0%" up icon={<Wallet className="w-4 h-4" />} warn />
          <KpiCard label="Công nợ phải trả" value={kpi(phaiTra)} trend="-1.2%" icon={<Wallet className="w-4 h-4" />} />
          <KpiCard label="Lợi nhuận tháng" value={kpi(loiNhuan)} trend="+15.7%" up icon={<TrendingUp className="w-4 h-4" />} highlight />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-3">
          <Card title="Doanh thu theo tháng">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="thang" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
                <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
                <Line type="monotone" dataKey="dt" stroke="oklch(0.45 0.15 250)" strokeWidth={2} name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Chi phí theo tháng">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="thang" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
                <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
                <Bar dataKey="cp" fill="oklch(0.7 0.16 60)" name="Chi phí" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Top khách hàng">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topCus} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
                <YAxis dataKey="ten" type="category" fontSize={11} width={120} />
                <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
                <Bar dataKey="v" fill="oklch(0.55 0.15 150)" name="Doanh số" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Top nhà cung cấp">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topSup} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e9)}B`} />
                <YAxis dataKey="ten" type="category" fontSize={11} width={120} />
                <Tooltip formatter={(v: number) => fmtVND(v) + " ₫"} />
                <Bar dataKey="v" fill="oklch(0.6 0.15 230)" name="Giá trị mua" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent activity */}
        <Card title="Hoạt động gần đây">
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Nội dung</th>
                <th className="num">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i}>
                  <td>{a.ngay}</td>
                  <td>
                    <span className="px-1.5 py-0.5 text-[11px] rounded bg-muted">{a.loai}</span>
                  </td>
                  <td>{a.noiDung}</td>
                  <td className="num">{fmtVND(a.tien)} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="text-[11px] text-muted-foreground">
          Tổng số: {customers.length} khách hàng • {suppliers.length} nhà cung cấp • {sales.length} đơn bán • {purchases.length} đơn mua
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  trend,
  up,
  warn,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  up?: boolean;
  warn?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`border rounded p-2.5 bg-card ${highlight ? "border-primary/40 bg-primary/5" : ""}`}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
        <span className={warn ? "text-warning" : ""}>{icon}</span>
      </div>
      <div className="mt-1 text-[15px] font-semibold tabular-nums">{value}</div>
      {trend && (
        <div
          className={`mt-0.5 inline-flex items-center gap-0.5 text-[11px] ${
            up ? "text-success" : "text-destructive"
          }`}
        >
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded bg-card">
      <div className="px-3 py-1.5 border-b text-[12px] font-semibold">{title}</div>
      <div className="p-2">{children}</div>
    </div>
  );
}
