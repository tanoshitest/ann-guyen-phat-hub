import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { customers, purchases, sales, shippers, shippings, suppliers, fmtVND } from "@/lib/mock-data";
import { listDemoRecords, saveDemoRecord } from "@/lib/supabase-demo";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/cong-no")({ component: Page });

type DebtKind = "Khách hàng" | "NCC" | "Vận chuyển";
type DebtStatus = "Đã thanh toán" | "Còn nợ" | "Quá hạn";
const debtStatuses: DebtStatus[] = ["Đã thanh toán", "Còn nợ", "Quá hạn"];

type DebtRow = {
  maThongKe: string;
  loai: DebtKind;
  doiTac: string;
  tongPhatSinh: number;
  daThanhToan: number;
  conNo: number;
  quaHan: number;
  trangThai: DebtStatus;
};
type DebtStatusRecord = { key: string; status: DebtStatus };

function KindTag({ kind }: { kind: DebtKind }) {
  const cls =
    kind === "Khách hàng"
      ? "bg-info/15 text-info"
      : kind === "NCC"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";

  return <span className={`px-1.5 py-0.5 text-[11px] rounded ${cls}`}>{kind}</span>;
}

function getStatus(conNo: number, quaHan: number): DebtStatus {
  if (quaHan > 0) return "Quá hạn";
  if (conNo > 0) return "Còn nợ";
  return "Đã thanh toán";
}

function debtKey(row: DebtRow) {
  return `${row.loai}-${row.maThongKe}-${row.doiTac}`;
}

function Page() {
  const [statusByDebt, setStatusByDebt] = useState<Record<string, DebtStatus>>({});

  useEffect(() => {
    listDemoRecords<DebtStatusRecord>("debt_statuses")
      .then((records) => {
        setStatusByDebt(Object.fromEntries(records.map((record) => [record.key, record.status])));
      })
      .catch(console.error);
  }, []);

  const customerRows = customers.map((c) => {
    const related = sales.filter((s) => s.MA_THONG_KE === c.MA_THONG_KE);
    const tongPhatSinh = related.reduce((sum, s) => sum + s.tongTT, 0);
    const daThanhToan = related
      .filter((s) => s.trangThai === "Đã thanh toán")
      .reduce((sum, s) => sum + s.tongTT, 0);
    const conNo = tongPhatSinh - daThanhToan;
    const quaHan = related
      .filter((s) => s.trangThai === "Quá hạn")
      .reduce((sum, s) => sum + s.tongTT, 0);

    return {
      maThongKe: c.MA_THONG_KE,
      loai: "Khách hàng" as const,
      doiTac: c.ten,
      tongPhatSinh,
      daThanhToan,
      conNo,
      quaHan,
      trangThai: getStatus(conNo, quaHan),
    };
  });

  const supplierMap: Record<string, DebtRow> = {};
  suppliers.forEach((s) => {
    supplierMap[s.ten] = {
      maThongKe: "",
      loai: "NCC",
      doiTac: s.ten,
      tongPhatSinh: 0,
      daThanhToan: 0,
      conNo: 0,
      quaHan: 0,
      trangThai: "Đã thanh toán",
    };
  });
  purchases.forEach((p, i) => {
    const row = supplierMap[p.ncc];
    if (!row) return;
    const paid = i % 3 !== 0 ? p.giaTriMua : Math.round(p.giaTriMua * 0.4);
    const debt = p.giaTriMua - paid;
    row.tongPhatSinh += p.giaTriMua;
    row.daThanhToan += paid;
    row.conNo += debt;
    if (i % 7 === 0) row.quaHan += debt * 0.5;
    row.trangThai = getStatus(row.conNo, row.quaHan);
  });

  const shippingMap: Record<string, DebtRow> = {};
  shippers.forEach((s) => {
    shippingMap[s.ten] = {
      maThongKe: "",
      loai: "Vận chuyển",
      doiTac: s.ten,
      tongPhatSinh: 0,
      daThanhToan: 0,
      conNo: 0,
      quaHan: 0,
      trangThai: "Đã thanh toán",
    };
  });
  shippings.forEach((s, i) => {
    const row = shippingMap[s.dvvc];
    if (!row) return;
    const paid = i % 4 !== 0 ? s.giaTriVC : Math.round(s.giaTriVC * 0.5);
    row.tongPhatSinh += s.giaTriVC;
    row.daThanhToan += paid;
    row.conNo += s.giaTriVC - paid;
    row.trangThai = getStatus(row.conNo, row.quaHan);
  });

  const rows = [...customerRows, ...Object.values(supplierMap), ...Object.values(shippingMap)]
    .sort((a, b) => b.conNo - a.conNo)
    .map((row) => ({ ...row, trangThai: statusByDebt[debtKey(row)] ?? row.trangThai }));

  return (
    <DataTable
      title="Công nợ"
      data={rows}
      searchKeys={["maThongKe", "doiTac", "loai", "trangThai"]}
      pageSize={100}
      columns={[
        { key: "loai", label: "Đầu mục", width: 120, render: (r) => <KindTag kind={r.loai} /> },
        { key: "maThongKe", label: "MA_THONG_KE", width: 120 },
        { key: "doiTac", label: "Đối tác", width: 260 },
        { key: "tongPhatSinh", label: "Tổng phát sinh", width: 150, numeric: true, render: (r) => fmtVND(r.tongPhatSinh) },
        { key: "daThanhToan", label: "Đã thanh toán", width: 150, numeric: true, render: (r) => fmtVND(r.daThanhToan) },
        { key: "conNo", label: "Còn nợ", width: 150, numeric: true, render: (r) => fmtVND(r.conNo) },
        { key: "quaHan", label: "Quá hạn", width: 150, numeric: true, render: (r) => fmtVND(r.quaHan) },
        {
          key: "trangThai",
          label: "Trạng thái",
          width: 150,
          render: (r) => (
            <select
              value={r.trangThai}
              onChange={(e) => {
                const key = debtKey(r);
                const status = e.target.value as DebtStatus;
                setStatusByDebt((current) => ({
                  ...current,
                  [key]: status,
                }));
                void saveDemoRecord("debt_statuses", key, { key, status }).catch(console.error);
              }}
              className="h-7 w-full rounded border bg-background px-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {debtStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ),
        },
      ]}
    />
  );
}
