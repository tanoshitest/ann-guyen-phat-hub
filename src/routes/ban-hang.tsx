import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { customers, products, operationDemoSales as sales, fmtVND, fmtDate } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  listMergedDemoRows,
  mergeDemoRows,
  saveDemoRecord,
  uniqueOptions,
} from "@/lib/supabase-demo";
import { Eye, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/ban-hang")({ component: Page });

function StatusBadge({ s }: { s: string }) {
  const cls =
    s === "Đã thanh toán"
      ? "bg-success/15 text-success"
      : s === "Còn nợ"
        ? "bg-warning/15 text-warning"
        : "bg-destructive/15 text-destructive";
  return <span className={`px-1.5 py-0.5 text-[11px] rounded ${cls}`}>{s}</span>;
}

function Page() {
  const [rows, setRows] = useState(sales);
  const [customerRows, setCustomerRows] = useState(customers);
  const [productRows, setProductRows] = useState(products);
  const customerOptions = uniqueOptions(customerRows.map((customer) => customer.ten));
  const statisticOptions = uniqueOptions(customerRows.map((customer) => customer.MA_THONG_KE));
  const productOptions = uniqueOptions(productRows.map((product) => product.MA_SP));
  const today = new Date().toISOString().slice(0, 10);
  const customerWithDefaults = (record: (typeof customers)[number], index: number) => ({
    ...record,
    MA_KH: record.MA_KH || `KH_DEMO${String(index + 1).padStart(3, "0")}`,
    MA_THONG_KE: record.MA_THONG_KE || `TK_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Khach hang demo",
    mst: record.mst || "",
    diaChi: record.diaChi || "",
    nguoiLienHe: record.nguoiLienHe || "",
    dienThoai: record.dienThoai || "",
    email: record.email || "",
    ghiChu: record.ghiChu || "",
  });
  const productWithDefaults = (record: (typeof products)[number], index: number) => ({
    ...record,
    MA_SP: record.MA_SP || `SP_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "San pham demo",
    dvt: record.dvt || "kg",
    vat: record.vat || 0,
  });
  const withDefaults = (record: (typeof sales)[number], index: number) => {
    const soLuong = record.soLuong || 0;
    const donGia = record.donGia || 0;
    const vat = record.vat || 0;
    const congJumbo = record.congJumbo || 0;
    const truJumbo = record.truJumbo || 0;
    const giaTriBan = record.giaTriBan || soLuong * donGia;
    const tienVat = record.tienVat || Math.round((giaTriBan * vat) / 100);
    return {
      ...record,
      MA_CHUNG_TU: record.MA_CHUNG_TU || `BANDEMO${String(index + 1).padStart(4, "0")}`,
      ngay: record.ngay || today,
      soLuong,
      donGia,
      giaTriBan,
      vat,
      tienVat,
      tongTT: record.tongTT || giaTriBan + tienVat + congJumbo - truJumbo,
      congJumbo,
      truJumbo,
      hoaHong: record.hoaHong || 0,
      dienGiai: record.dienGiai || "",
      ngayHD: record.ngayHD || record.ngay || today,
      soHD: record.soHD || `DEMO${String(index + 1).padStart(6, "0")}`,
      trangThai: record.trangThai || "Còn nợ",
    };
  };

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof sales)[number]>("sales"), listDeletedDemoKeys("sales")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(
          mergeDemoRows(sales, safeRows, (row) => row.MA_CHUNG_TU).filter(
            (row) => !deleted.has(row.MA_CHUNG_TU),
          ),
        );
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([
      listMergedDemoRows("customers", customers, (row) => row.MA_KH, customerWithDefaults),
      listMergedDemoRows("products", products, (row) => row.MA_SP, productWithDefaults),
    ])
      .then(([nextCustomers, nextProducts]) => {
        setCustomerRows(nextCustomers);
        setProductRows(nextProducts);
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xóa chứng từ ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_CHUNG_TU !== recordKey));
    void deleteDemoRecord("sales", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Bán hàng"
      data={rows}
      searchKeys={["MA_CHUNG_TU", "khachHang", "maSP", "soHD", "MA_THONG_KE"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("sales", next.MA_CHUNG_TU, next).catch(console.error);
          return [next, ...prev.filter((row) => row.MA_CHUNG_TU !== next.MA_CHUNG_TU)];
        });
      }}
      columns={[
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 100, options: statisticOptions },
        { key: "khachHang", label: "Khách hàng", width: 200, options: customerOptions },
        { key: "maSP", label: "Mã SP", width: 70, options: productOptions },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        {
          key: "donGia",
          label: "Đơn giá",
          width: 90,
          numeric: true,
          render: (r) => fmtVND(r.donGia),
        },
        {
          key: "giaTriBan",
          label: "Giá trị bán",
          width: 120,
          numeric: true,
          render: (r) => fmtVND(r.giaTriBan),
        },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        {
          key: "tienVat",
          label: "Tiền VAT",
          width: 100,
          numeric: true,
          render: (r) => fmtVND(r.tienVat),
        },
        {
          key: "tongTT",
          label: "Tổng TT",
          width: 120,
          numeric: true,
          render: (r) => fmtVND(r.tongTT),
        },
        {
          key: "congJumbo",
          label: "Cộng Jumbo",
          width: 100,
          numeric: true,
          render: (r) => fmtVND(r.congJumbo),
        },
        {
          key: "truJumbo",
          label: "Trừ Jumbo",
          width: 100,
          numeric: true,
          render: (r) => fmtVND(r.truJumbo),
        },
        {
          key: "hoaHong",
          label: "Hoa hồng",
          width: 100,
          numeric: true,
          render: (r) => fmtVND(r.hoaHong),
        },
        { key: "dienGiai", label: "Diễn giải", width: 240 },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
        {
          key: "trangThai",
          label: "Trạng thái",
          width: 120,
          render: (r) => <StatusBadge s={r.trangThai} />,
        },
        {
          key: "actions",
          label: "Thao tác",
          width: 90,
          render: (row) => (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" />
              <Pencil className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" />
              <button
                type="button"
                onClick={() => handleDelete(row.MA_CHUNG_TU)}
                className="inline-flex h-5 w-5 items-center justify-center hover:text-destructive"
                aria-label="Xóa"
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ),
        },
      ]}
    />
  );
}
