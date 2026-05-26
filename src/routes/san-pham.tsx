import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/san-pham")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Danh mục sản phẩm"
      data={products}
      searchKeys={["MA_SP", "ten"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_SP", label: "MA_SP", width: 100 },
        { key: "ten", label: "Tên sản phẩm", width: 260 },
        { key: "dvt", label: "Đơn vị tính", width: 100 },
        { key: "vat", label: "VAT (%)", width: 80, numeric: true },
      ]}
    />
  );
}
