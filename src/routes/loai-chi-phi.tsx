import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { expenseTypes } from "@/lib/mock-data";

export const Route = createFileRoute("/loai-chi-phi")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Danh mục loại chi phí"
      data={expenseTypes}
      searchKeys={["MA_LOAI_CP", "ten"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_LOAI_CP", label: "MA_LOAI_CP", width: 140 },
        { key: "ten", label: "Tên loại chi phí", width: 300 },
      ]}
    />
  );
}
