import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  ShoppingCart,
  PackagePlus,
  Truck,
  Receipt,
  Wallet,
  FileText,
  ClipboardList,
  Users,
  Building2,
  Box,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type Item = { to: string; label: string; icon: ReactNode };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "",
    items: [{ to: "/bao-cao", label: "Báo cáo", icon: <BarChart3 className="w-4 h-4" /> }],
  },
  {
    label: "Nghiệp vụ",
    items: [
      { to: "/nghiep-vu", label: "Form Nhập", icon: <ClipboardList className="w-4 h-4" /> },
      { to: "/ban-hang", label: "Bán hàng", icon: <ShoppingCart className="w-4 h-4" /> },
      { to: "/mua-hang", label: "Mua hàng", icon: <PackagePlus className="w-4 h-4" /> },
      { to: "/van-chuyen", label: "Vận chuyển", icon: <Truck className="w-4 h-4" /> },
      { to: "/chi-phi", label: "Chi phí", icon: <Receipt className="w-4 h-4" /> },
    ],
  },
  {
    label: "Công nợ",
    items: [
      { to: "/cong-no", label: "Công nợ", icon: <Wallet className="w-4 h-4" /> },
    ],
  },
  {
    label: "Hóa đơn",
    items: [
      { to: "/hoa-don", label: "Hóa đơn", icon: <FileText className="w-4 h-4" /> },
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
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen sticky top-0 transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      <div className={`border-b border-sidebar-border ${collapsed ? "px-2 py-2" : "px-3 py-3"}`}>
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-white leading-tight">AN NGUYEN PHAT</div>
              <div className="text-[11px] text-sidebar-foreground/70 tracking-wider">CRM • BUSINESS OPS</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded hover:bg-sidebar-accent text-sidebar-foreground"
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((g, gi) => (
          <div key={gi} className="mb-1">
            {g.label && !collapsed && (
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
                  title={collapsed ? it.label : undefined}
                  className={`flex items-center gap-2 py-1.5 text-[13px] hover:bg-sidebar-accent ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-white" : ""
                  }`}
                >
                  {it.icon}
                  {!collapsed && <span>{it.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="px-3 py-2 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
          © 2025 An Nguyen Phat
        </div>
      )}
    </aside>
  );
}
