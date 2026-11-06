import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Bell,
  CheckCircle2,
  Shield,
  UserCheck,
  Eye,
  UserX,
  ChevronDown,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { formatVND } from '../utils/pricingEngine';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
    setCurrentTab,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Quản trị viên',
          icon: Shield,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        };
      case 'editor':
        return {
          label: 'Xem / Sửa',
          icon: UserCheck,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'viewer':
        return {
          label: 'Chỉ xem',
          icon: Eye,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
        };
      case 'blocked':
        return {
          label: 'Không được truy cập',
          icon: UserX,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
        };
      default:
        return {
          label: role,
          icon: Shield,
          color: 'text-slate-700 bg-slate-50 border-slate-200',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xs">
      {/* Zone 1: Brand wordmark & System Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              LogisTMS
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-blue-700 bg-blue-50 border border-blue-200 uppercase tracking-wider">
              Bản Demo Vận Tải
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Quản Lý Bảng Giá & Điều Hành Vận Chuyển Đa Hình Thức
          </p>
        </div>
      </div>

      {/* Zone 2: Fast navigation indicator & Clarification shortcut */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => setCurrentTab('clarifications')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-medium">Điểm Thảo Luận Nghiệp Vụ & Hỏi Đáp</span>
        </button>
      </div>

      {/* Zone 3: Actions, Quick Switcher, Notification Bell & Current Profile */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu?')) {
              resetAllData();
            }
          }}
          title="Khôi phục dữ liệu demo ban đầu"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Demo</span>
        </button>

        {/* Price Change Notifications Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Thông báo thay đổi giá"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Thông Báo Đổi Bảng Giá
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Chưa có thông báo thay đổi giá nào.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        notif.read
                          ? 'bg-slate-50 text-slate-600'
                          : 'bg-blue-50/70 border border-blue-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(notif.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Switcher Dropdown (Giả lập phân quyền nhanh) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentUser.username.substring(0, 2)}
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                {currentUser.fullName}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className={`px-1.5 py-0.2 rounded border ${roleInfo.color} text-[10px]`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Chuyển vai trò thử nghiệm (Demo RBAC)
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bấm để kiểm tra quyền hạn thực tế của từng tài khoản:
                </p>
              </div>

              <div className="space-y-1">
                {users.map((u) => {
                  const uRole = getRoleBadge(u.role);
                  const isCurrent = u.id === currentUser.id;
                  const UIcon = uRole.icon;

                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] ${uRole.color}`}>
                        {uRole.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>Admin: Toàn quyền, được xóa & tạo user</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Xem/Sửa: Sửa được bảng giá, KHÔNG xóa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Chỉ xem: Không được sửa hoặc xóa</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
