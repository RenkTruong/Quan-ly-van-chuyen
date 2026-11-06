import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SystemUser,
  UserRole,
  AppPermissionModule,
  ModulePermission,
  UserSecurityPermissions,
} from '../types';
import { createDefaultPermissions } from '../data/initialData';
import {
  Users2,
  Shield,
  KeyRound,
  History,
  Activity,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Eye,
  UserX,
  Laptop,
  Globe,
  Clock,
  Lock,
  X,
  BellRing,
  Download,
  DollarSign,
  Check,
  ShieldCheck,
} from 'lucide-react';

const MODULE_DEFINITIONS: { id: AppPermissionModule; name: string; description: string }[] = [
  { id: 'dashboard', name: 'Dashboard Kinh Doanh', description: 'Tổng quan doanh thu, chi phí, biên lợi nhuận & chỉ số P&L' },
  { id: 'price_customer', name: 'Bảng Giá Khách Hàng', description: 'Quản lý bảng giá bán theo khối, chuyến, tấn & đơn giá rớt điểm' },
  { id: 'price_vendor', name: 'Bảng Giá Vendor (NCC)', description: 'Quản lý bảng giá mua chi phí vận chuyển & dự án áp dụng' },
  { id: 'vendors', name: 'Quản Lý Vendor (NCC & Đội Xe)', description: 'Hồ sơ nhà xe, danh sách phương tiện biển số & danh sách tài xế' },
  { id: 'operations', name: 'Dữ Liệu Vận Hành Hàng Ngày', description: 'Cập nhật mã lệnh, điều phối xe, tài xế & phạt thỏa thuận' },
  { id: 'reports', name: 'Báo Cáo Doanh Thu & P&L', description: 'Tổng hợp doanh thu theo tuần/tháng trên từng khách hàng' },
  { id: 'users', name: 'Quản Trị Người Dùng & Phân Quyền', description: 'Tạo tài khoản, cấu hình ma trận quyền và phân bổ chức năng' },
  { id: 'audit', name: 'Nhật Ký Bảo Mật & Audit Trail', description: 'Theo dõi lịch sử đăng nhập IP và toàn bộ vết thao tác sửa đổi' },
];

export const UserManagementView: React.FC = () => {
  const {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    loginLogs,
    auditLogs,
    isAdmin,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'login_logs' | 'audit_logs'>('users');

  // Modal Create User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [newDepartment, setNewDepartment] = useState('Phòng Điều Hành Vận Tải');

  // Modal Configure Granular Permissions
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<SystemUser | null>(null);
  const [tempPermissions, setTempPermissions] = useState<Record<AppPermissionModule, ModulePermission> | null>(null);
  const [tempSecurity, setTempSecurity] = useState<UserSecurityPermissions | null>(null);
  const [tempRole, setTempRole] = useState<UserRole>('editor');

  const handleOpenPermsModal = (user: SystemUser) => {
    setSelectedUserForPerms(user);
    setTempRole(user.role);
    setTempPermissions(
      user.permissions || createDefaultPermissions(user.role === 'custom' ? 'editor' : user.role)
    );
    setTempSecurity(
      user.security || {
        showPriceColumns: user.role !== 'viewer' && user.role !== 'blocked',
        allowExportPriceExcel: user.role === 'admin' || user.role === 'editor',
        receivePriceAlerts: user.role === 'admin',
      }
    );
  };

  const handleApplyPreset = (presetRole: 'admin' | 'editor' | 'viewer' | 'blocked') => {
    setTempRole(presetRole);
    setTempPermissions(createDefaultPermissions(presetRole));
    if (presetRole === 'admin') {
      setTempSecurity({ showPriceColumns: true, allowExportPriceExcel: true, receivePriceAlerts: true });
    } else if (presetRole === 'editor') {
      setTempSecurity({ showPriceColumns: true, allowExportPriceExcel: true, receivePriceAlerts: false });
    } else if (presetRole === 'viewer') {
      setTempSecurity({ showPriceColumns: false, allowExportPriceExcel: false, receivePriceAlerts: false });
    } else {
      setTempSecurity({ showPriceColumns: false, allowExportPriceExcel: false, receivePriceAlerts: false });
    }
  };

  const handleToggleModulePerm = (module: AppPermissionModule, field: 'blocked' | 'view' | 'edit' | 'add') => {
    if (!tempPermissions) return;
    setTempRole('custom');

    setTempPermissions((prev) => {
      if (!prev) return null;
      const current = prev[module];

      if (field === 'blocked') {
        const nextBlocked = !current.blocked;
        return {
          ...prev,
          [module]: {
            blocked: nextBlocked,
            view: nextBlocked ? false : true,
            edit: false,
            add: false,
          },
        };
      }

      if (field === 'view') {
        const nextView = !current.view;
        return {
          ...prev,
          [module]: {
            ...current,
            blocked: !nextView,
            view: nextView,
            edit: nextView ? current.edit : false,
            add: nextView ? current.add : false,
          },
        };
      }

      if (field === 'edit' || field === 'add') {
        const nextVal = !current[field];
        return {
          ...prev,
          [module]: {
            ...current,
            blocked: false,
            view: true,
            [field]: nextVal,
          },
        };
      }

      return prev;
    });
  };

  const handleSavePerms = () => {
    if (!selectedUserForPerms || !tempPermissions || !tempSecurity) return;
    updateUser(selectedUserForPerms.id, {
      role: tempRole,
      permissions: tempPermissions,
      security: tempSecurity,
      status: tempRole === 'blocked' ? 'inactive' : 'active',
    });
    setSelectedUserForPerms(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const initialPerms = createDefaultPermissions(newRole === 'custom' ? 'editor' : newRole);
    const initialSec: UserSecurityPermissions = {
      showPriceColumns: newRole === 'admin' || newRole === 'editor',
      allowExportPriceExcel: newRole === 'admin' || newRole === 'editor',
      receivePriceAlerts: newRole === 'admin',
    };

    addUser({
      username: newUsername.trim().toLowerCase(),
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDepartment,
      status: newRole === 'blocked' ? 'inactive' : 'active',
      permissions: initialPerms,
      security: initialSec,
    });

    setShowAddUserModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    setNewRole('editor');
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Quản trị viên (Admin)',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'editor':
        return {
          title: 'Cho phép xem / sửa',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'viewer':
        return {
          title: 'Cho phép xem (Viewer)',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'custom':
        return {
          title: 'Phân quyền theo danh mục',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'blocked':
        return {
          title: 'Khóa (Không truy cập)',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Quản Trị Người Dùng, Phân Quyền Danh Mục & Bảo Mật Dữ Liệu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình ma trận tích chọn (Khóa | Xem | Sửa | Thêm), bảo mật cột giá (Hiện | Ẩn), xuất Excel & thông báo đổi giá
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo Tài Khoản Mới</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Tài Khoản & Phân Quyền Danh Mục ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('login_logs')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'login_logs'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Lịch Sử Đăng Nhập ({loginLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit_logs')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'audit_logs'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Nhật Ký Thao Tác (Audit Trail) ({auditLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: TÀI KHOẢN & MA TRẬN PHÂN QUYỀN */}
      {activeSubTab === 'users' && (
        <div className="space-y-5">
          {/* Information Strip */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Cơ Chế Phân Quyền Dạng Tích Chọn Theo Danh Mục & Bảo Mật Dữ Liệu Giá</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tài khoản cấp <strong>Quản trị (Admin)</strong> được toàn quyền tạo và cấu hình phân quyền cho từng tài khoản theo nhu cầu công việc với ma trận: 
              <span className="font-semibold text-slate-900"> Danh mục | Khóa | Xem | Sửa | Thêm</span>.
              Phần dữ liệu Giá được bảo mật riêng biệt với tùy chọn <strong>Hiện | Ẩn cột giá</strong>, <strong>Cho phép tải file Excel bảng giá</strong> và <strong>Nhận thông báo khi có giá mới</strong>.
            </p>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Danh Sách Tài Khoản & Cấu Hình Quyền Hạn
              </h3>
              {!isAdmin && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  (Đăng nhập quyền {currentUser.role} - Chỉ Admin mới được thay đổi phân quyền)
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3.5">Họ và Tên / Tài Khoản</th>
                    <th className="py-3 px-3.5">Phòng Ban</th>
                    <th className="py-3 px-3.5">Vai Trò Tổng Thể</th>
                    <th className="py-3 px-3.5">Bảo Mật Giá</th>
                    <th className="py-3 px-3.5">Tải Excel Giá</th>
                    <th className="py-3 px-3.5">Nhận Báo Giá Mới</th>
                    <th className="py-3 px-3.5 text-center">Phân Quyền Danh Mục</th>
                    <th className="py-3 px-3.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const roleInfo = getRoleLabel(u.role);
                    const isSelf = u.id === currentUser.id;
                    const canSeePrice = u.role === 'admin' || (u.security?.showPriceColumns ?? true);
                    const canExport = u.role === 'admin' || (u.security?.allowExportPriceExcel ?? false);
                    const getAlerts = u.role === 'admin' || (u.security?.receivePriceAlerts ?? false);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                              {u.username.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isSelf && <span className="text-[10px] text-blue-600 font-normal">(Bạn)</span>}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">@{u.username} &bull; {u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3.5 text-slate-700">{u.department}</td>

                        {/* Vai trò */}
                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleInfo.badge}`}>
                            {roleInfo.title}
                          </span>
                        </td>

                        {/* Bảo mật giá: Hiện / Ẩn */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              canSeePrice
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {canSeePrice ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Hiện Cột Giá</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-rose-600" />
                                <span>Ẩn Cột Giá (***)</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Tải Excel Giá */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              canExport ? 'text-blue-700 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            <Download className="w-3 h-3" />
                            <span>{canExport ? 'Cho phép' : 'Chặn tải'}</span>
                          </span>
                        </td>

                        {/* Nhận Thông Báo Đổi Giá */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              getAlerts ? 'text-amber-700 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            <BellRing className="w-3 h-3" />
                            <span>{getAlerts ? 'Có nhận' : 'Không'}</span>
                          </span>
                        </td>

                        {/* Nút Xem / Sửa Ma Trận Phân Quyền */}
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => handleOpenPermsModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Shield className="w-3 h-3" />
                            <span>Ma Trận Quyền</span>
                          </button>
                        </td>

                        {/* Thao tác xóa */}
                        <td className="py-3 px-3.5 text-center">
                          {isAdmin && !isSelf ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa tài khoản người dùng @${u.username}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LỊCH SỬ ĐĂNG NHẬP */}
      {activeSubTab === 'login_logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Nhật Ký Đăng Nhập & Địa Chỉ IP Truy Cập
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">Thời Gian</th>
                  <th className="py-3 px-3.5">Tài Khoản</th>
                  <th className="py-3 px-3.5">Địa Chỉ IP</th>
                  <th className="py-3 px-3.5">Vị Trí Ước Tính</th>
                  <th className="py-3 px-3.5">Trình Duyệt & Thiết Bị</th>
                  <th className="py-3 px-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {loginLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 text-slate-700">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      @{log.username} ({log.fullName})
                    </td>
                    <td className="py-2.5 px-3.5 text-blue-700">{log.ipAddress}</td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-sans">{log.location || 'N/A'}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 truncate max-w-xs">{log.userAgent}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.status === 'success' ? 'Thành công' : 'Bị từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUDIT TRAIL */}
      {activeSubTab === 'audit_logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Nhật Ký Thao Tác Hệ Thống (Audit Trail)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">Thời Gian</th>
                  <th className="py-3 px-3.5">Người Thao Tác</th>
                  <th className="py-3 px-3.5">Phân Hệ</th>
                  <th className="py-3 px-3.5">Hành Động</th>
                  <th className="py-3 px-3.5">Nội Dung Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono">
                      {log.fullName} (@{log.username})
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 font-mono">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-50 text-blue-700'
                            : log.action === 'DELETE'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 max-w-md">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CẤU HÌNH MA TRẬN PHÂN QUYỀN & BẢO MẬT DỮ LIỆU GIÁ */}
      {selectedUserForPerms && tempPermissions && tempSecurity && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Phân Quyền Danh Mục & Bảo Mật Dữ Liệu: {selectedUserForPerms.fullName}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tài khoản: @{selectedUserForPerms.username} &bull; {selectedUserForPerms.department}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              {/* Preset buttons */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Áp dụng mẫu cấu hình nhanh theo vai trò công việc:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('admin')}
                    className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 cursor-pointer transition-colors"
                  >
                    1. Quản Trị Viên (Admin Full)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('editor')}
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    2. Điều Hành (Xem & Sửa)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('viewer')}
                    className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    3. Giám Sát (Chỉ Xem)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('blocked')}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 cursor-pointer transition-colors"
                  >
                    4. Khóa Toàn Bộ Quyền
                  </button>
                </div>
              </div>

              {/* BẢNG MA TRẬN PHÂN QUYỀN THEO DANH MỤC */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Bảng Tích Chọn Phân Quyền Theo Từng Danh Mục
                  </span>
                  <span className="text-[10px] text-slate-500">
                    * Khóa = Chặn truy cập danh mục hoàn toàn
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Danh Mục Chức Năng</th>
                      <th className="py-2.5 px-3 text-center text-rose-700">Khóa</th>
                      <th className="py-2.5 px-3 text-center text-blue-700">Xem</th>
                      <th className="py-2.5 px-3 text-center text-emerald-700">Sửa</th>
                      <th className="py-2.5 px-3 text-center text-purple-700">Thêm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODULE_DEFINITIONS.map((mod) => {
                      const perm = tempPermissions[mod.id] || { blocked: false, view: true, edit: false, add: false };

                      return (
                        <tr key={mod.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{mod.name}</div>
                            <div className="text-[10px] text-slate-500">{mod.description}</div>
                          </td>

                          {/* Khóa */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.blocked}
                              disabled={!isAdmin}
                              onChange={() => handleToggleModulePerm(mod.id, 'blocked')}
                              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                              title="Khóa không cho xem/truy cập danh mục này"
                            />
                          </td>

                          {/* Xem */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.view && !perm.blocked}
                              disabled={!isAdmin || perm.blocked}
                              onChange={() => handleToggleModulePerm(mod.id, 'view')}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer disabled:opacity-30"
                              title="Cho phép xem dữ liệu"
                            />
                          </td>

                          {/* Sửa */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.edit && !perm.blocked}
                              disabled={!isAdmin || perm.blocked}
                              onChange={() => handleToggleModulePerm(mod.id, 'edit')}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer disabled:opacity-30"
                              title="Cho phép xem và sửa (không xóa)"
                            />
                          </td>

                          {/* Thêm */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={perm.add && !perm.blocked}
                              disabled={!isAdmin || perm.blocked}
                              onChange={() => handleToggleModulePerm(mod.id, 'add')}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer disabled:opacity-30"
                              title="Cho phép tạo mới bản ghi"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* KHU VỰC BẢO MẬT DỮ LIỆU GIÁ & THÔNG BÁO */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Bảo Mật Dữ Liệu Giá, Xuất File Excel & Thông Báo Quản Trị</span>
                </div>

                <div className="space-y-3">
                  {/* Hiện / Ẩn cột giá */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempSecurity.showPriceColumns}
                      disabled={!isAdmin}
                      onChange={(e) =>
                        setTempSecurity({ ...tempSecurity, showPriceColumns: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hiển thị cột giá (Giá Khách Hàng | Giá Vendor)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Nếu <strong>bỏ chọn</strong>: Tài khoản này sẽ bị ẩn toàn bộ đơn giá, tiền cước và lợi nhuận trên toàn bộ hệ thống (chuyển sang hiển thị dạng <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">***.***đ</code> để bảo mật tài chính).
                      </p>
                    </div>
                  </label>

                  {/* Cho phép Xuất Excel bảng giá */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempSecurity.allowExportPriceExcel}
                      disabled={!isAdmin}
                      onChange={(e) =>
                        setTempSecurity({ ...tempSecurity, allowExportPriceExcel: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Cho phép Xuất Excel Bảng Giá về máy tính</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Chức năng bảo mật: Kiểm soát tài khoản được phép tải file Excel bảng giá bán và giá mua về máy.
                      </p>
                    </div>
                  </label>

                  {/* Nhận thông báo khi có thay đổi giá mới */}
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempSecurity.receivePriceAlerts}
                      disabled={!isAdmin}
                      onChange={(e) =>
                        setTempSecurity({ ...tempSecurity, receivePriceAlerts: e.target.checked })
                      }
                      className="w-4 h-4 mt-0.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tự động nhận thông báo khi có thay đổi giá mới</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hệ thống sẽ gửi thông báo chuông và thông báo quản trị viên cho tài khoản này mỗi khi có bảng giá khách hàng hoặc vendor được thêm mới / chỉnh sửa.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPerms(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Đóng
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleSavePerms}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Cấu Hình Phân Quyền</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO TÀI KHOẢN MỚI */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-blue-600" />
                <span>Tạo Tài Khoản Người Dùng Mới</span>
              </h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên đăng nhập (*):</label>
                <input
                  type="text"
                  required
                  placeholder="vd: operator_nam..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Họ và tên (*):</label>
                <input
                  type="text"
                  required
                  placeholder="vd: Nguyễn Hoàng Nam..."
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email công việc (*):</label>
                <input
                  type="email"
                  required
                  placeholder="nam.nguyen@logistms.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phòng ban:</label>
                <input
                  type="text"
                  required
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mẫu phân quyền ban đầu:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                >
                  <option value="editor">Điều hành: Cho phép xem / sửa (Không xóa)</option>
                  <option value="viewer">Giám sát: Cho phép xem (Ẩn giá, không sửa/xóa)</option>
                  <option value="admin">Quản trị viên: Toàn quyền hệ thống</option>
                  <option value="blocked">Khóa: Không được truy cập</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sau khi tạo, Quản trị viên có thể bấm "Ma Trận Quyền" để tùy biến chi tiết từng danh mục.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
