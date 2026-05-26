import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { shippers } from "@/lib/mock-data";

export const Route = createFileRoute("/don-vi-vc")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Danh mục đơn vị vận chuyển"
      data={shippers}
      searchKeys={["MA_VC", "ten", "bienSo"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_VC", label: "MA_VC", width: 100 },
        { key: "ten", label: "Tên đơn vị", width: 220 },
        { key: "mst", label: "MST", width: 120 },
        { key: "nguoiLienHe", label: "Người liên hệ", width: 150 },
        { key: "dienThoai", label: "Điện thoại", width: 110 },
        { key: "bienSo", label: "Biển số xe", width: 110 },
        { key: "ghiChu", label: "Ghi chú", width: 200 },
      ]}
    />
  );
}
