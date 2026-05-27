import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { customers, products, shippers, shippings, fmtVND, fmtDate } from "@/lib/mock-data";
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

export const Route = createFileRoute("/van-chuyen")({ component: Page });

function Page() {
  const [rows, setRows] = useState(shippings);
  const [customerRows, setCustomerRows] = useState(customers);
  const [shipperRows, setShipperRows] = useState(shippers);
  const [productRows, setProductRows] = useState(products);
  const shipperOptions = uniqueOptions(shipperRows.map((shipper) => shipper.ten));
  const plateOptions = uniqueOptions(shipperRows.map((shipper) => shipper.bienSo));
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
  const shipperWithDefaults = (record: (typeof shippers)[number], index: number) => ({
    ...record,
    MA_VC: record.MA_VC || `VC_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "Don vi van chuyen demo",
    mst: record.mst || "",
    nguoiLienHe: record.nguoiLienHe || "",
    dienThoai: record.dienThoai || "",
    bienSo: record.bienSo || "",
    ghiChu: record.ghiChu || "",
  });
  const productWithDefaults = (record: (typeof products)[number], index: number) => ({
    ...record,
    MA_SP: record.MA_SP || `SP_DEMO${String(index + 1).padStart(3, "0")}`,
    ten: record.ten || "San pham demo",
    dvt: record.dvt || "kg",
    vat: record.vat || 0,
  });
  const withDefaults = (record: (typeof shippings)[number], index: number) => {
    const soLuong = record.soLuong || 0;
    const donGia = record.donGia || 0;
    return {
      ...record,
      MA_CHUNG_TU: record.MA_CHUNG_TU || `VCDEMO${String(index + 1).padStart(4, "0")}`,
      ngay: record.ngay || today,
      soLuong,
      donGia,
      giaTriVC: record.giaTriVC || soLuong * donGia,
      vat: record.vat || 0,
      ghiChu: record.ghiChu || "",
      ngayHD: record.ngayHD || record.ngay || today,
      soHD: record.soHD || `DEMO${String(index + 1).padStart(6, "0")}`,
    };
  };

  useEffect(() => {
    Promise.all([listDemoRecords<(typeof shippings)[number]>("shippings"), listDeletedDemoKeys("shippings")])
      .then(([demoRows, deletedKeys]) => {
        const safeRows = demoRows.map((record, index) => withDefaults(record, index));
        const deleted = new Set(deletedKeys);
        setRows(mergeDemoRows(shippings, safeRows, (row) => row.MA_CHUNG_TU).filter((row) => !deleted.has(row.MA_CHUNG_TU)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([
      listMergedDemoRows("customers", customers, (row) => row.MA_KH, customerWithDefaults),
      listMergedDemoRows("shippers", shippers, (row) => row.MA_VC, shipperWithDefaults),
      listMergedDemoRows("products", products, (row) => row.MA_SP, productWithDefaults),
    ])
      .then(([nextCustomers, nextShippers, nextProducts]) => {
        setCustomerRows(nextCustomers);
        setShipperRows(nextShippers);
        setProductRows(nextProducts);
      })
      .catch(console.error);
  }, []);

  const handleDelete = (recordKey: string) => {
    if (!window.confirm(`Xóa chứng từ ${recordKey}?`)) return;
    setRows((current) => current.filter((row) => row.MA_CHUNG_TU !== recordKey));
    void deleteDemoRecord("shippings", recordKey).catch(console.error);
  };

  return (
    <DataTable
      title="Vận chuyển"
      data={rows}
      searchKeys={["MA_CHUNG_TU", "dvvc", "bienSo", "maSP", "soHD"]}
      onAdd={(record) => {
        setRows((prev) => {
          const next = withDefaults(record, prev.length);
          void saveDemoRecord("shippings", next.MA_CHUNG_TU, next).catch(console.error);
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
        { key: "dvvc", label: "Đơn vị VC", width: 200, options: shipperOptions },
        { key: "bienSo", label: "Biển số xe", width: 110, options: plateOptions },
        { key: "maSP", label: "Mã SP", width: 70, options: productOptions },
        { key: "soLuong", label: "SL", width: 80, numeric: true, render: (r) => fmtVND(r.soLuong) },
        { key: "donGia", label: "Đơn giá", width: 90, numeric: true, render: (r) => fmtVND(r.donGia) },
        { key: "giaTriVC", label: "Giá trị VC", width: 120, numeric: true, render: (r) => fmtVND(r.giaTriVC) },
        { key: "vat", label: "VAT%", width: 60, numeric: true },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
        { key: "ngayHD", label: "Ngày HĐ", width: 95, render: (r) => fmtDate(r.ngayHD) },
        { key: "soHD", label: "Số HĐ", width: 90 },
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
