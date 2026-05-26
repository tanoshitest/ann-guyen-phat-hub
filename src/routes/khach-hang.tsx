import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { customers } from "@/lib/mock-data";

export const Route = createFileRoute("/khach-hang")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Danh mục khách hàng"
      data={customers}
      searchKeys={["MA_KH", "ten", "mst", "nguoiLienHe", "dienThoai"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_KH", label: "MA_KH", width: 90 },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 110 },
        { key: "ten", label: "Tên khách hàng", width: 240 },
        { key: "mst", label: "Mã số thuế", width: 120 },
        { key: "diaChi", label: "Địa chỉ", width: 240 },
        { key: "nguoiLienHe", label: "Người liên hệ", width: 150 },
        { key: "dienThoai", label: "Điện thoại", width: 110 },
        { key: "email", label: "Email", width: 180 },
        { key: "ghiChu", label: "Ghi chú", width: 140 },
      ]}
    />
  );
}
