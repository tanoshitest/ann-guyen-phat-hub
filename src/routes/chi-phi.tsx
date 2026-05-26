import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";
import { expenses, fmtVND, fmtDate } from "@/lib/mock-data";

export const Route = createFileRoute("/chi-phi")({ component: Page });

function Page() {
  return (
    <DataTable
      title="Chi phí"
      data={expenses}
      searchKeys={["MA_CHI_PHI", "loaiCP", "doiTuong", "MA_CHUNG_TU", "lyDo"]}
      onAdd={() => {}}
      columns={[
        { key: "MA_CHI_PHI", label: "MA_CHI_PHI", width: 110 },
        { key: "ngay", label: "Ngày CT", width: 95, render: (r) => fmtDate(r.ngay) },
        { key: "loaiCP", label: "Loại chi phí", width: 170 },
        { key: "doiTuong", label: "Đối tượng", width: 200 },
        { key: "MA_CHUNG_TU", label: "MA_CHUNG_TU", width: 110 },
        { key: "MA_THONG_KE", label: "MA_THONG_KE", width: 110 },
        { key: "lyDo", label: "Lý do chi", width: 200 },
        { key: "soTien", label: "Số tiền", width: 130, numeric: true, render: (r) => fmtVND(r.soTien) },
        { key: "ghiChu", label: "Ghi chú", width: 160 },
      ]}
    />
  );
}
