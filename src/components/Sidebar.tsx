import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  Truck,
  Receipt,
  Wallet,
  FileText,
  BarChart3,
  Users,
  Building2,
  Box,
  Tag,
  Activity,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

type Item = { to: string; label: string; icon: ReactNode };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "",
    items: [{ to: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> }],
  },
  {
    label: "Nghiệp vụ",
    items: [
      { to: "/ban-hang", label: "Bán hàng", icon: <ShoppingCart className="w-4 h-4" /> },
      { to: "/mua-hang", label: "Mua hàng", icon: <PackagePlus className="w-4 h-4" /> },
      { to: "/van-chuyen", label: "Vận chuyển", icon: <Truck className="w-4 h-4" /> },
      { to: "/chi-phi", label: "Chi phí", icon: <Receipt className="w-4 h-4" /> },
    ],
  },
  {
    label: "Công nợ",
    items: [
      { to: "/cong-no-kh", label: "Công nợ khách hàng", icon: <Wallet className="w-4 h-4" /> },
      { to: "/cong-no-ncc", label: "Công nợ nhà cung cấp", icon: <Wallet className="w-4 h-4" /> },
      { to: "/cong-no-vc", label: "Công nợ vận chuyển", icon: <Wallet className="w-4 h-4" /> },
    ],
  },
  {
    label: "Hóa đơn",
    items: [
      { to: "/hd-dau-ra", label: "Hóa đơn đầu ra", icon: <FileText className="w-4 h-4" /> },
      { to: "/hd-dau-vao", label: "Hóa đơn đầu vào", icon: <FileText className="w-4 h-4" /> },
      { to: "/kho-hoa-don", label: "Kho hóa đơn", icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      { to: "/bc-loi-nhuan", label: "Báo cáo lợi nhuận", icon: <BarChart3 className="w-4 h-4" /> },
      { to: "/bc-doanh-thu", label: "Báo cáo doanh thu", icon: <BarChart3 className="w-4 h-4" /> },
      { to: "/bc-chi-phi", label: "Báo cáo chi phí", icon: <BarChart3 className="w-4 h-4" /> },
      { to: "/bc-cong-no", label: "Báo cáo công nợ", icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  {
    label: "Danh mục",
    items: [
      { to: "/khach-hang", label: "Khách hàng", icon: <Users className="w-4 h-4" /> },
      { to: "/nha-cung-cap", label: "Nhà cung cấp", icon: <Building2 className="w-4 h-4" /> },
      { to: "/don-vi-vc", label: "Đơn vị vận chuyển", icon: <Truck className="w-4 h-4" /> },
      { to: "/san-pham", label: "Sản phẩm", icon: <Box className="w-4 h-4" /> },
      { to: "/loai-chi-phi", label: "Loại chi phí", icon: <Tag className="w-4 h-4" /> },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { to: "/nhat-ky", label: "Nhật ký hoạt động", icon: <Activity className="w-4 h-4" /> },
      { to: "/cai-dat", label: "Cài đặt", icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="text-[15px] font-bold text-white leading-tight">AN NGUYEN PHAT</div>
        <div className="text-[11px] text-sidebar-foreground/70 tracking-wider">CRM • BUSINESS OPS</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((g, gi) => (
          <div key={gi} className="mb-1">
            {g.label && (
              <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
                {g.label}
              </div>
            )}
            {g.items.map((it) => {
              const active = pathname === it.to;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-sidebar-accent ${
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-white" : ""
                  }`}
                >
                  {it.icon}
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="px-3 py-2 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
        © 2025 An Nguyen Phat
      </div>
    </aside>
  );
}
