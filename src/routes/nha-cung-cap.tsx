import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { suppliers } from "@/lib/mock-data";

export const Route = createFileRoute("/nha-cung-cap")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Danh mục nhà cung cấp"
      data={suppliers}
      searchKeys={["MA_NCC", "ten", "mst"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_NCC", label: "MA_NCC", width: 110 },
        { key: "ten", label: "Tên NCC", width: 240 },
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
