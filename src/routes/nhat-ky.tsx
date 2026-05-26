import { createFileRoute } from "@tanstack/react-router";
import { DataTable } from "@/components/DataTable";

export const Route = createFileRoute("/nhat-ky")({ component: Page });

const users = ["admin", "ketoan1", "ketoan2", "kinhdoanh1", "kho1"];
const actions = [
  ["Tạo", "Phiếu bán BAN000098"],
  ["Sửa", "Phiếu mua MUA000045"],
  ["Xóa", "Phiếu chi phí CP0000022"],
  ["Đăng nhập", "Hệ thống"],
  ["Xuất Excel", "Báo cáo doanh thu"],
  ["Import", "Danh mục khách hàng"],
  ["Tạo", "Khách hàng KH_BL"],
  ["Sửa", "Hóa đơn 0000123"],
];

const logs = Array.from({ length: 80 }, (_, i) => {
  const a = actions[i % actions.length];
  const d = new Date(2025, 9, 1 + (i % 30), 8 + (i % 10), (i * 7) % 60);
  return {
    id: i + 1,
    thoiGian: d.toLocaleString("vi-VN"),
    nguoiDung: users[i % users.length],
    hanhDong: a[0],
    doiTuong: a[1],
    ip: `192.168.1.${20 + (i % 50)}`,
  };
});

function Page() {
  return (
    <DataTable
      title="Nhật ký hoạt động"
      data={logs}
      searchKeys={["nguoiDung", "hanhDong", "doiTuong"]}
      columns={[
        { key: "thoiGian", label: "Thời gian", width: 160 },
        { key: "nguoiDung", label: "Người dùng", width: 130 },
        { key: "hanhDong", label: "Hành động", width: 110, render: (r) => <span className="px-1.5 py-0.5 text-[11px] rounded bg-accent">{r.hanhDong}</span> },
        { key: "doiTuong", label: "Đối tượng", width: 260 },
        { key: "ip", label: "IP", width: 130 },
      ]}
    />
  );
}
