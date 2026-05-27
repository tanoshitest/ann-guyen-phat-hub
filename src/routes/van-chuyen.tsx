import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { customers, products, shippers, shippings, fmtVND, fmtDate } from "@/lib/mock-data";

export const Route = createFileRoute("/van-chuyen")({ component: Page });

function Page() {
  const shipperOptions = shippers.map((shipper) => shipper.ten);
  const plateOptions = shippers.map((shipper) => shipper.bienSo);
  const statisticOptions = customers.map((customer) => customer.MA_THONG_KE);
  const productOptions = products.map((product) => product.MA_SP);

  return (
    <DataTable
      title="Vận chuyển"
      data={shippings}
      searchKeys={["MA_CHUNG_TU", "dvvc", "bienSo", "maSP", "soHD"]}
      onAdd={() => {}}
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
      ]}
    />
  );
}
