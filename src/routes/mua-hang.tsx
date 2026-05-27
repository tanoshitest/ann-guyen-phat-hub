import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { customers, products, purchases, suppliers, fmtVND, fmtDate } from "@/lib/mock-data";
import {
  deleteDemoRecord,
  listDeletedDemoKeys,
  listDemoRecords,
  listMergedDemoRows,
  mergeDemoRows,
  saveDemoRecord,
  uniqueOptions,
} from "@/lib/supabase-demo";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/mua-hang")({ component: Page });

function Page() {
  const [rows, setRows] = useState(purchases);
  const [customerRows, setCustomerRows] = useState(customers);
  const [supplierRows, setSupplierRows] = useState(suppliers);
  const [productRows, setProductRows] = useState(products);
  const supplierOptions = uniqueOptions(supplierRows.map((supplier) => supplier.ten));
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
  const supplierWithDefaults = (record: (typeof suppliers)[number], index: number) => ({
    ...record,
    MA_NCC: record.MA_NCC || `NCC_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Nha cung cap demo",
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
  const withDefaults = (record: (typeof purchases)[number], index: number) => {
    const soLuong = record.soLuong || 0;
    const donGia = record.donGia || 0;
    return {
      ...record,
      MA_CHUNG_TU: record.MA_CHUNG_TU || `MUADEMO${String(index + 1).padStart(4, "0")}`,
      ngay: record.ngay || today,
      soLuong,
      donGia,
      giaTriMua: record.giaTriMua || soLuong * donGia,
      vat: record.vat || 0,
      congJumbo: record.congJumbo || 0,
      truJumbo: record.truJumbo || 0,
      ghiChu: record.ghiChu || "",
      ngayHD: record.ngayHD || record.ngay || today,
      soHD: record.soHD || `DEMO${String(index + 1).padStart(6, "0")}`,
    };
  };

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof purchases)[number]>("purchases"), listDeletedDemoKeys("purchases")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(purchases, safeRows, (row) => row.MA_CHUNG_TU).filter((row) => !deleted.has(row.MA_CHUNG_TU)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([
      listMergedDemoRows("customers", customers, (row) => row.MA_KH, customerWithDefaults),
      listMergedDemoRows("suppliers", suppliers, (row) => row.MA_NCC, supplierWithDefaults),
      listMergedDemoRows("products", products, (row) => row.MA_SP, productWithDefaults),
    ])
      .then(([nextCustomers, nextSuppliers, nextProducts]) => {
        setCustomerRows(nextCustomers);
        setSupplierRows(nextSuppliers);
        setProductRows(nextProducts);
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xóa chứng từ ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_CHUNG_TU !== recordKey));
    void deleteDemoRecord("purchases", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Mua hàng"
      data={rows}
      searchKeys={["MA_CHUNG_TU", "ncc", "maSP", "soHD"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("purchases", next.MA_CHUNG_TU, next).catch(console.error);
          return [
            next,
            ...prev.filter((row) => row.MA_CHUNG_TU !== next.MA_CHUNG_TU),
          ];
        });
      }}
      columns={[
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 100, options: statisticOptions },
        { key: "ncc", label: "Nhà cung cấp", width: 200, options: supplierOptions },
        { key: "maSP", label: "Mã SP", width: 70, options: productOptions },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        { key: "donGia", label: "Đơn giá", width: 90, numeric: true, render: (r) => fmtVND(r.donGia) },
        { key: "giaTriMua", label: "Giá trị mua", width: 120, numeric: true, render: (r) => fmtVND(r.giaTriMua) },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        { key: "congJumbo", label: "Cộng Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.congJumbo) },
        { key: "truJumbo", label: "Trừ Jumbo", width: 100, numeric: true, render: (r) => fmtVND(r.truJumbo) },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
        {
          key: "actions",
          label: "Thao tÃ¡c",
          width: 80,
          render: (row) => (
            <button
              type="button"
              onClick={() => handleDelete(row.MA_CHUNG_TU)}
              className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-destructive"
              aria-label="Xóa"
              title="Xóa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ),
        },
      ]}
    />
  );
}
