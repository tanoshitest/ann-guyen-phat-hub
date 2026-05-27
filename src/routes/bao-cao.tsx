import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  customers,
  expenses,
  purchases,
  sales,
  shippers,
  shippings,
  suppliers,
  fmtDate,
  fmtVND,
} from "@/lib/mock-data";

export const Route = createFileRoute("/bao-cao")({ component: Page });

type PayableRow = { ma: string; ten: string; tong: number; daTra: number; conNo: number };
type ReceivableRow = { ma: string; ten: string; tong: number; daThu: number; conNo: number; quaHan: number };
type ReportTab = "cash" | "profit" | "payable" | "receivable" | "weekly";

const reportTabs: { id: ReportTab; label: string }[] = [
  { id: "cash", label: "Quỹ tiền" },
  { id: "profit", label: "Doanh thu / Lợi nhuận" },
  { id: "payable", label: "Công nợ phải trả" },
  { id: "receivable", label: "Công nợ phải thu" },
  { id: "weekly", label: "Khách hàng tuần này" },
];

function inRange(date: string, from: string, to: string) {
  return (!from || date >= from) && (!to || date <= to);
}

function money(n: number) {
  return fmtVND(Math.round(n));
}

function Page() {
  const [activeTab, setActiveTab] = useState<ReportTab>("cash");
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");
  const [maThongKe, setMaThongKe] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [customerCode, setCustomerCode] = useState("");

  const supplierRows = useMemo(() => buildSupplierPayables(), []);
  const shipperRows = useMemo(() => buildShipperPayables(), []);
  const payableRows = useMemo(() => [...supplierRows, ...shipperRows].filter((r) => r.conNo > 0), [supplierRows, shipperRows]);
  const receivableRows = useMemo(() => buildReceivables(), []);

  const filteredSales = sales.filter(
    (s) => inRange(s.ngay, fromDate, toDate) && (!maThongKe || s.MA_THONG_KE === maThongKe),
  );
  const filteredPurchases = purchases.filter(
    (p) => inRange(p.ngay, fromDate, toDate) && (!maThongKe || p.MA_THONG_KE === maThongKe),
  );
  const filteredShippings = shippings.filter(
    (s) => inRange(s.ngay, fromDate, toDate) && (!maThongKe || s.MA_THONG_KE === maThongKe),
  );
  const filteredExpenses = expenses.filter(
    (e) => inRange(e.ngay, fromDate, toDate) && (!maThongKe || e.MA_THONG_KE === maThongKe),
  );

  const revenue = filteredSales.reduce((sum, row) => sum + row.tongTT, 0);
  const purchaseCost = filteredPurchases.reduce((sum, row) => sum + row.giaTriMua, 0);
  const shippingCost = filteredShippings.reduce((sum, row) => sum + row.giaTriVC, 0);
  const otherCost = filteredExpenses.reduce((sum, row) => sum + row.soTien, 0);
  const profit = revenue - purchaseCost - shippingCost - otherCost;

  const paidSales = sales.filter((s) => s.trangThai === "Đã thanh toán").reduce((sum, row) => sum + row.tongTT, 0);
  const totalPayables = payableRows.reduce((sum, row) => sum + row.conNo, 0);
  const totalReceivables = receivableRows.reduce((sum, row) => sum + row.conNo, 0);
  const cash = paidSales - totalPayables - expenses.reduce((sum, row) => sum + row.soTien, 0);
  const cashless = Math.round(totalReceivables * 0.12) - Math.round(totalPayables * 0.08);

  const selectedPayables = supplierCode
    ? payableRows.filter((row) => row.ma === supplierCode)
    : payableRows;
  const selectedReceivables = customerCode
    ? receivableRows.filter((row) => row.ma === customerCode)
    : receivableRows;
  const weeklyCustomers = buildWeeklyCustomers();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Báo cáo</h1>
      </div>
      <div className="border-b bg-card px-4 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-8 shrink-0 border border-b-0 px-3 text-[13px] font-medium ${
                activeTab === tab.id
                  ? "bg-background text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-background p-4">
        <div className="min-w-[760px]">
          {activeTab === "cash" && (
            <Section title="Quỹ tiền">
              <tbody>
                <ReportRow label="Tiền cash" value={money(cash)} />
                <ReportRow label="Tiền cashless" value={money(cashless)} />
                <ReportRow label="Tổng quỹ tiền" value={money(cash + cashless)} strong />
                <ReportRow label="Phải thu" value={money(totalReceivables)} />
                <ReportRow label="Phải trả NCC" value={money(supplierRows.reduce((sum, row) => sum + row.conNo, 0))} />
                <ReportRow label="Phải trả khác" value={money(shipperRows.reduce((sum, row) => sum + row.conNo, 0))} />
              </tbody>
            </Section>
          )}

          {activeTab === "profit" && (
            <Section title="Doanh thu / Lợi nhuận">
              <tbody>
                <tr>
                  <Cell>Từ ngày</Cell>
                  <Cell>
                    <input className="report-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </Cell>
                  <Cell>Đến ngày</Cell>
                  <Cell>
                    <input className="report-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </Cell>
                </tr>
                <tr>
                  <Cell>Mã thống kê</Cell>
                  <Cell colSpan={3}>
                    <select className="report-input" value={maThongKe} onChange={(e) => setMaThongKe(e.target.value)}>
                      <option value="">Tất cả</option>
                      {customers.map((customer) => (
                        <option key={customer.MA_THONG_KE} value={customer.MA_THONG_KE}>
                          {customer.MA_THONG_KE} - {customer.ten}
                        </option>
                      ))}
                    </select>
                  </Cell>
                </tr>
                <ReportRow label="Doanh thu" value={money(revenue)} />
                <ReportRow label="Chi phí mua" value={money(purchaseCost)} />
                <ReportRow label="Chi phí VC" value={money(shippingCost)} />
                <ReportRow label="Chi phí khác" value={money(otherCost)} />
                <ReportRow label="Lợi nhuận" value={money(profit)} strong />
              </tbody>
            </Section>
          )}

          {activeTab === "payable" && (
            <Section title="Công nợ phải trả">
              <tbody>
                <tr>
                  <Cell strong>Tổng phải trả</Cell>
                  <Cell strong>{money(totalPayables)}</Cell>
                  <Cell>Đối tượng</Cell>
                  <Cell>
                    <select className="report-input" value={supplierCode} onChange={(e) => setSupplierCode(e.target.value)}>
                      <option value="">Tất cả</option>
                      {payableRows.map((row) => (
                        <option key={row.ma} value={row.ma}>
                          {row.ma} - {row.ten}
                        </option>
                      ))}
                    </select>
                  </Cell>
                </tr>
                <tr>
                  <Cell strong>Mã</Cell>
                  <Cell strong>Đối tượng</Cell>
                  <Cell strong>Đã trả</Cell>
                  <Cell strong>Còn nợ</Cell>
                </tr>
                {selectedPayables.map((row) => (
                  <tr key={row.ma}>
                    <Cell>{row.ma}</Cell>
                    <Cell>{row.ten}</Cell>
                    <Cell numeric>{money(row.daTra)}</Cell>
                    <Cell numeric>{money(row.conNo)}</Cell>
                  </tr>
                ))}
              </tbody>
            </Section>
          )}

          {activeTab === "receivable" && (
            <Section title="Công nợ phải thu">
              <tbody>
                <tr>
                  <Cell strong>Tổng phải thu</Cell>
                  <Cell strong>{money(totalReceivables)}</Cell>
                  <Cell>MA_KH</Cell>
                  <Cell>
                    <select className="report-input" value={customerCode} onChange={(e) => setCustomerCode(e.target.value)}>
                      <option value="">Tất cả</option>
                      {receivableRows.map((row) => (
                        <option key={row.ma} value={row.ma}>
                          {row.ma} - {row.ten}
                        </option>
                      ))}
                    </select>
                  </Cell>
                </tr>
                <tr>
                  <Cell strong>MA_KH</Cell>
                  <Cell strong>Khách hàng</Cell>
                  <Cell strong>Quá hạn</Cell>
                  <Cell strong>Còn nợ</Cell>
                </tr>
                {selectedReceivables.map((row) => (
                  <tr key={row.ma}>
                    <Cell>{row.ma}</Cell>
                    <Cell>{row.ten}</Cell>
                    <Cell numeric>{money(row.quaHan)}</Cell>
                    <Cell numeric>{money(row.conNo)}</Cell>
                  </tr>
                ))}
              </tbody>
            </Section>
          )}

          {activeTab === "weekly" && (
            <Section title="Khách hàng tuần này">
              <tbody>
                <tr>
                  <Cell>Tuần này</Cell>
                  <Cell>{fmtDate(weeklyCustomers.from)}</Cell>
                  <Cell>{fmtDate(weeklyCustomers.to)}</Cell>
                  <Cell />
                </tr>
                <tr>
                  <Cell strong>MA_KH</Cell>
                  <Cell strong>Số lượng</Cell>
                  <Cell strong>Đơn giá TB</Cell>
                  <Cell strong>Doanh thu</Cell>
                </tr>
                {weeklyCustomers.rows.map((row) => (
                  <tr key={row.ma}>
                    <Cell>{row.ma}</Cell>
                    <Cell numeric>{fmtVND(row.soLuong)}</Cell>
                    <Cell numeric>{money(row.donGia)}</Cell>
                    <Cell numeric>{money(row.doanhThu)}</Cell>
                  </tr>
                ))}
              </tbody>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function buildSupplierPayables(): PayableRow[] {
  const map: Record<string, PayableRow> = {};
  suppliers.forEach((supplier) => {
    map[supplier.ten] = { ma: supplier.MA_NCC, ten: supplier.ten, tong: 0, daTra: 0, conNo: 0 };
  });

  purchases.forEach((purchase, index) => {
    const row = map[purchase.ncc];
    if (!row) return;
    const paid = index % 3 !== 0 ? purchase.giaTriMua : Math.round(purchase.giaTriMua * 0.4);
    row.tong += purchase.giaTriMua;
    row.daTra += paid;
    row.conNo += purchase.giaTriMua - paid;
  });

  return Object.values(map);
}

function buildShipperPayables(): PayableRow[] {
  const map: Record<string, PayableRow> = {};
  shippers.forEach((shipper) => {
    map[shipper.ten] = { ma: shipper.MA_VC, ten: shipper.ten, tong: 0, daTra: 0, conNo: 0 };
  });

  shippings.forEach((shipping, index) => {
    const row = map[shipping.dvvc];
    if (!row) return;
    const paid = index % 4 !== 0 ? shipping.giaTriVC : Math.round(shipping.giaTriVC * 0.5);
    row.tong += shipping.giaTriVC;
    row.daTra += paid;
    row.conNo += shipping.giaTriVC - paid;
  });

  return Object.values(map).map((row) => ({ ...row, ma: `VC_${row.ma}` }));
}

function buildReceivables(): ReceivableRow[] {
  return customers
    .map((customer) => {
      const related = sales.filter((sale) => sale.MA_THONG_KE === customer.MA_THONG_KE);
      const tong = related.reduce((sum, sale) => sum + sale.tongTT, 0);
      const daThu = related
        .filter((sale) => sale.trangThai === "Đã thanh toán")
        .reduce((sum, sale) => sum + sale.tongTT, 0);
      const quaHan = related
        .filter((sale) => sale.trangThai === "Quá hạn")
        .reduce((sum, sale) => sum + sale.tongTT, 0);

      return { ma: customer.MA_KH, ten: customer.ten, tong, daThu, conNo: tong - daThu, quaHan };
    })
    .filter((row) => row.conNo > 0);
}

function buildWeeklyCustomers() {
  const sortedDates = sales.map((sale) => sale.ngay).sort();
  const to = sortedDates[sortedDates.length - 1] ?? "2025-01-01";
  const fromDate = new Date(`${to}T00:00:00`);
  fromDate.setDate(fromDate.getDate() - 7);
  const from = fromDate.toISOString().slice(0, 10);

  const map: Record<string, { ma: string; soLuong: number; doanhThu: number }> = {};
  sales
    .filter((sale) => inRange(sale.ngay, from, to))
    .forEach((sale) => {
      const customer = customers.find((item) => item.MA_THONG_KE === sale.MA_THONG_KE);
      const ma = customer?.MA_KH ?? sale.MA_THONG_KE;
      map[ma] ??= { ma, soLuong: 0, doanhThu: 0 };
      map[ma].soLuong += sale.soLuong;
      map[ma].doanhThu += sale.tongTT;
    });

  return {
    from,
    to,
    rows: Object.values(map).map((row) => ({
      ...row,
      donGia: row.soLuong > 0 ? row.doanhThu / row.soLuong : 0,
    })),
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          <th colSpan={4} className="border border-border bg-yellow-300 px-2 py-1 text-left font-semibold uppercase">
            {title}
          </th>
        </tr>
      </thead>
      {children}
    </table>
  );
}

function ReportRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr>
      <Cell strong={strong}>{label}</Cell>
      <Cell numeric strong={strong} colSpan={3}>
        {value}
      </Cell>
    </tr>
  );
}

function Cell({
  children,
  colSpan,
  numeric,
  strong,
}: {
  children?: React.ReactNode;
  colSpan?: number;
  numeric?: boolean;
  strong?: boolean;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`h-6 border border-border px-2 py-1 align-middle ${numeric ? "text-right tabular-nums" : ""} ${
        strong ? "font-semibold" : ""
      }`}
    >
      {children}
    </td>
  );
}
