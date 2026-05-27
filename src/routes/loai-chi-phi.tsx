import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { expenseTypes } from "@/lib/mock-data";

export const Route = createFileRoute("/loai-chi-phi")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Danh mục loại chi phí"
      data={expenseTypes}
      searchKeys={["ten"]}
      onAdd={() => {}}
      columns={[
        { key: "ten", label: "Tên loại chi phí", width: 300 },
      ]}
    />
  );
}
