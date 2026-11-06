import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Tag,
  Truck,
  Building2,
  ClipboardList,
  BarChart3,
  Users2,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AppPermissionModule } from '../types';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, currentUser, orders, customerPrices, vendorPrices, vendors, hasPermission } = useApp();

  const navItems: {
    id: ActiveTab;
    moduleKey: AppPermissionModule;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      moduleKey: 'dashboard',
      label: 'Tổng Quan Kinh Doanh',
      sublabel: 'Doanh thu, Chi phí & Lợi nhuận',
      icon: LayoutDashboard,
    },
    {
      id: 'customer_pricing',
      moduleKey: 'price_customer',
      label: 'Bảng Giá Khách Hàng',
      sublabel: 'Khối, Chuyến, Tấn & Rớt điểm',
      icon: Tag,
      badge: customerPrices.length,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'vendor_pricing',
      moduleKey: 'price_vendor',
      label: 'Bảng Giá Cho Vendor',
      sublabel: 'Chi phí theo Dự án & Nhà xe',
      icon: Truck,
      badge: vendorPrices.length,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'vendors',
      moduleKey: 'vendors',
      label: 'Quản Lý Vendor (NCC)',
      sublabel: 'Hồ sơ NCC, Đội xe & Tài xế',
      icon: Building2,
      badge: vendors.length,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'operations',
      moduleKey: 'operations',
      label: 'Vận Hành Hàng Ngày',
      sublabel: 'Mã lệnh, Áp giá & Tính rớt điểm',
      icon: ClipboardList,
      badge: orders.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'reports',
      moduleKey: 'reports',
      label: 'Báo Cáo Doanh Thu',
      sublabel: 'Tổng hợp theo Tuần & Tháng',
      icon: BarChart3,
    },
    {
      id: 'users',
      moduleKey: 'users',
      label: 'Phân Quyền & Bảo Mật',
      sublabel: 'Ma trận quyền, Login & Audit log',
      icon: Users2,
    },
  ];

  // Filter items that user is not blocked from
  const visibleNavItems = navItems.filter((item) => {
    return hasPermission(item.moduleKey, 'view');
  });

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Phân Hệ Chức Năng
        </div>

        {visibleNavItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div className="truncate">
                  <div className="text-xs leading-none truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-1 truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-1.5 ${
                    item.badgeColor || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role permission info strip at bottom of sidebar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 m-3 rounded-xl border">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-800">
            Phân quyền: {currentUser.role === 'admin' ? 'Quản Trị Viên' : currentUser.fullName}
          </span>
        </div>
        <div className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
          <div className="flex items-center justify-between">
            <span>Bảo mật xem giá:</span>
            <span
              className={`font-semibold ${
                currentUser.security?.showPriceColumns ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {currentUser.security?.showPriceColumns ? 'Hiển thị giá' : 'Ẩn giá (***)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Xuất Excel giá:</span>
            <span
              className={`font-semibold ${
                currentUser.security?.allowExportPriceExcel ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {currentUser.security?.allowExportPriceExcel ? 'Được phép' : 'Khóa xuất'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
