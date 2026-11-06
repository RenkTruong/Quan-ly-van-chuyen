import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RoutePriceItem,
  OperationOrder,
  SystemUser,
  LoginLog,
  AuditLog,
  PriceChangeNotification,
  SurchargeConfig,
  PriceTarget,
  VendorProfile,
  VehicleInfo,
  DriverInfo,
  AppPermissionModule,
} from '../types';
import {
  INITIAL_CUSTOMER_PRICES,
  INITIAL_VENDOR_PRICES,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_LOGIN_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SURCHARGES,
  INITIAL_VENDORS,
} from '../data/initialData';

export type ActiveTab =
  | 'dashboard'
  | 'customer_pricing'
  | 'vendor_pricing'
  | 'vendors'
  | 'operations'
  | 'reports'
  | 'users';

interface AppContextType {
  currentUser: SystemUser;
  users: SystemUser[];
  customerPrices: RoutePriceItem[];
  vendorPrices: RoutePriceItem[];
  orders: OperationOrder[];
  vendors: VendorProfile[];
  surcharges: SurchargeConfig[];
  loginLogs: LoginLog[];
  auditLogs: AuditLog[];
  notifications: PriceChangeNotification[];
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;

  // Quyền hạn cơ bản & ma trận theo danh mục
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  hasPermission: (module: AppPermissionModule, action: 'view' | 'edit' | 'add') => boolean;

  // Quyền bảo mật dữ liệu giá & xuất file
  canViewPrices: boolean;
  canExportPriceExcel: boolean;
  shouldReceiveAlerts: boolean;

  // Thao tác Bảng giá
  addPriceItem: (target: PriceTarget, item: Omit<RoutePriceItem, 'id' | 'updatedBy' | 'updatedAt' | 'status'>) => void;
  updatePriceItem: (target: PriceTarget, id: string, updates: Partial<RoutePriceItem>) => void;
  deletePriceItem: (target: PriceTarget, id: string) => boolean;
  importPriceItems: (target: PriceTarget, newItems: RoutePriceItem[]) => void;

  // Thao tác Quản lý Vendor, Xe & Tài xế
  addVendor: (vendor: Omit<VendorProfile, 'id' | 'createdAt'>) => void;
  updateVendor: (id: string, updates: Partial<VendorProfile>) => void;
  deleteVendor: (id: string) => boolean;
  addVehicleToVendor: (vendorId: string, vehicle: Omit<VehicleInfo, 'id'>) => void;
  deleteVehicleFromVendor: (vendorId: string, vehicleId: string) => void;
  addDriverToVendor: (vendorId: string, driver: Omit<DriverInfo, 'id'>) => void;
  deleteDriverFromVendor: (vendorId: string, driverId: string) => void;

  // Thao tác Vận hành hàng ngày
  addOrder: (order: Omit<OperationOrder, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateOrder: (id: string, updates: Partial<OperationOrder>) => void;
  deleteOrder: (id: string) => boolean;

  // Thao tác Người dùng & Đăng nhập
  switchUser: (userId: string) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => boolean;

  // Phụ phí
  updateSurchargeRate: (id: string, newRate: number) => void;

  // Thông báo
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Reset dữ liệu về ban đầu
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('logistms_users_v2');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('logistms_current_user_v2') || 'usr-admin';
  });

  const [customerPrices, setCustomerPrices] = useState<RoutePriceItem[]>(() => {
    const saved = localStorage.getItem('logistms_customer_prices_v2');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_PRICES;
  });

  const [vendorPrices, setVendorPrices] = useState<RoutePriceItem[]>(() => {
    const saved = localStorage.getItem('logistms_vendor_prices_v2');
    return saved ? JSON.parse(saved) : INITIAL_VENDOR_PRICES;
  });

  const [orders, setOrders] = useState<OperationOrder[]>(() => {
    const saved = localStorage.getItem('logistms_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem('logistms_vendors_v2');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [surcharges, setSurcharges] = useState<SurchargeConfig[]>(() => {
    const saved = localStorage.getItem('logistms_surcharges');
    return saved ? JSON.parse(saved) : INITIAL_SURCHARGES;
  });

  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(() => {
    const saved = localStorage.getItem('logistms_login_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGIN_LOGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('logistms_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<PriceChangeNotification[]>(() => {
    const saved = localStorage.getItem('logistms_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  // Lưu trữ LocalStorage
  useEffect(() => {
    localStorage.setItem('logistms_users_v2', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('logistms_customer_prices_v2', JSON.stringify(customerPrices));
  }, [customerPrices]);
  useEffect(() => {
    localStorage.setItem('logistms_vendor_prices_v2', JSON.stringify(vendorPrices));
  }, [vendorPrices]);
  useEffect(() => {
    localStorage.setItem('logistms_orders_v2', JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem('logistms_vendors_v2', JSON.stringify(vendors));
  }, [vendors]);
  useEffect(() => {
    localStorage.setItem('logistms_surcharges', JSON.stringify(surcharges));
  }, [surcharges]);
  useEffect(() => {
    localStorage.setItem('logistms_login_logs', JSON.stringify(loginLogs));
  }, [loginLogs]);
  useEffect(() => {
    localStorage.setItem('logistms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('logistms_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('logistms_current_user_v2', currentUserId);
  }, [currentUserId]);

  const currentUser: SystemUser = users.find((u) => u.id === currentUserId) || users[0];

  // Logic phân quyền & Kiểm tra ma trận phân quyền
  const isAdmin = currentUser.role === 'admin';
  const canView = currentUser.role !== 'blocked';
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'editor';
  const canDelete = currentUser.role === 'admin';

  const hasPermission = (module: AppPermissionModule, action: 'view' | 'edit' | 'add'): boolean => {
    if (isAdmin) return true;
    if (currentUser.role === 'blocked') return false;
    const modPerm = currentUser.permissions?.[module];
    if (!modPerm) return false;
    if (modPerm.blocked) return false;
    return Boolean(modPerm[action]);
  };

  // Bảo mật dữ liệu Giá & Xuất Excel
  const canViewPrices = isAdmin || (currentUser.security?.showPriceColumns ?? true);
  const canExportPriceExcel = isAdmin || (currentUser.security?.allowExportPriceExcel ?? false);
  const shouldReceiveAlerts = isAdmin || (currentUser.security?.receivePriceAlerts ?? false);

  // Helper ghi nhận Audit Log
  const recordAudit = (
    action: AuditLog['action'],
    module: AuditLog['module'],
    description: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `adt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      action,
      module,
      description,
      timestamp: new Date().toISOString(),
      previousValue,
      newValue,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper gửi thông báo khi có thay đổi giá mới (chỉ gửi cho tài khoản được phân quyền nhận)
  const notifyPriceChange = (target: PriceTarget, routeCode: string, details: string) => {
    const targetLabel = target === 'customer' ? 'Bảng giá Khách hàng' : 'Bảng giá Vendor';
    const alertRecipients = users.filter((u) => u.role === 'admin' || u.security?.receivePriceAlerts);
    
    if (alertRecipients.length === 0) return;

    const newNotif: PriceChangeNotification = {
      id: `notif-${Date.now()}`,
      title: `${targetLabel} vừa được thay đổi`,
      message: `Tài khoản ${currentUser.fullName} (${currentUser.username}) đã thay đổi: ${details}`,
      timestamp: new Date().toISOString(),
      target,
      routeCode,
      updatedBy: `${currentUser.fullName} (${currentUser.username})`,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // --- THAO TÁC BẢNG GIÁ ---
  const addPriceItem = (
    target: PriceTarget,
    item: Omit<RoutePriceItem, 'id' | 'updatedBy' | 'updatedAt' | 'status'>
  ) => {
    const mod = target === 'customer' ? 'price_customer' : 'price_vendor';
    if (!hasPermission(mod, 'add')) return;

    const now = new Date().toISOString();
    const newItem: RoutePriceItem = {
      ...item,
      id: `pr-${Date.now()}`,
      target,
      status: 'active',
      updatedBy: `${currentUser.fullName} (${currentUser.username})`,
      updatedAt: now,
    };

    if (target === 'customer') {
      setCustomerPrices((prev) => [newItem, ...prev]);
      recordAudit(
        'CREATE',
        'PRICE_CUSTOMER',
        `Tạo mới giá khách hàng tuyến ${newItem.routeCode} (${newItem.vehicleType}) - ${newItem.unitPrice.toLocaleString('vi-VN')} đ`
      );
    } else {
      setVendorPrices((prev) => [newItem, ...prev]);
      recordAudit(
        'CREATE',
        'PRICE_VENDOR',
        `Tạo mới giá vendor (${newItem.targetName}) tuyến ${newItem.routeCode} [Dự án: ${newItem.appliedCustomerName || 'Chung'}] - ${newItem.unitPrice.toLocaleString('vi-VN')} đ`
      );
    }

    notifyPriceChange(target, newItem.routeCode, `Tuyến ${newItem.routeCode} (${newItem.vehicleType}) - Đơn giá: ${newItem.unitPrice.toLocaleString('vi-VN')} đ`);
  };

  const updatePriceItem = (target: PriceTarget, id: string, updates: Partial<RoutePriceItem>) => {
    const mod = target === 'customer' ? 'price_customer' : 'price_vendor';
    if (!hasPermission(mod, 'edit')) return;

    const now = new Date().toISOString();
    const updater = `${currentUser.fullName} (${currentUser.username})`;

    if (target === 'customer') {
      const prev = customerPrices.find((p) => p.id === id);
      setCustomerPrices((list) =>
        list.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedBy: updater, updatedAt: now }
            : item
        )
      );
      recordAudit(
        'UPDATE',
        'PRICE_CUSTOMER',
        `Chỉnh sửa bảng giá khách hàng tuyến ${prev?.routeCode || id}`,
        prev ? `${prev.unitPrice.toLocaleString('vi-VN')} đ` : undefined,
        updates.unitPrice ? `${updates.unitPrice.toLocaleString('vi-VN')} đ` : undefined
      );
      if (prev) {
        notifyPriceChange(target, prev.routeCode, `Cập nhật tuyến ${prev.routeCode} thành công`);
      }
    } else {
      const prev = vendorPrices.find((p) => p.id === id);
      setVendorPrices((list) =>
        list.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedBy: updater, updatedAt: now }
            : item
        )
      );
      recordAudit(
        'UPDATE',
        'PRICE_VENDOR',
        `Chỉnh sửa bảng giá vendor tuyến ${prev?.routeCode || id}`,
        prev ? `${prev.unitPrice.toLocaleString('vi-VN')} đ` : undefined,
        updates.unitPrice ? `${updates.unitPrice.toLocaleString('vi-VN')} đ` : undefined
      );
      if (prev) {
        notifyPriceChange(target, prev.routeCode, `Cập nhật tuyến ${prev.routeCode} thành công`);
      }
    }
  };

  const deletePriceItem = (target: PriceTarget, id: string): boolean => {
    if (!isAdmin) return false;
    if (target === 'customer') {
      const prev = customerPrices.find((p) => p.id === id);
      setCustomerPrices((list) => list.filter((item) => item.id !== id));
      recordAudit('DELETE', 'PRICE_CUSTOMER', `Xóa bảng giá khách hàng tuyến ${prev?.routeCode || id}`);
    } else {
      const prev = vendorPrices.find((p) => p.id === id);
      setVendorPrices((list) => list.filter((item) => item.id !== id));
      recordAudit('DELETE', 'PRICE_VENDOR', `Xóa bảng giá vendor tuyến ${prev?.routeCode || id}`);
    }
    return true;
  };

  const importPriceItems = (target: PriceTarget, newItems: RoutePriceItem[]) => {
    const mod = target === 'customer' ? 'price_customer' : 'price_vendor';
    if (!hasPermission(mod, 'add')) return;

    if (target === 'customer') {
      setCustomerPrices((prev) => [...newItems, ...prev]);
      recordAudit('IMPORT', 'PRICE_CUSTOMER', `Import thành công ${newItems.length} bảng giá khách hàng từ file Excel`);
    } else {
      setVendorPrices((prev) => [...newItems, ...prev]);
      recordAudit('IMPORT', 'PRICE_VENDOR', `Import thành công ${newItems.length} bảng giá vendor từ file Excel`);
    }
    notifyPriceChange(target, 'EXCEL_BATCH', `Nhập ${newItems.length} dòng giá mới từ tệp Excel`);
  };

  // --- THAO TÁC QUẢN LÝ VENDOR, XE & TÀI XẾ ---
  const addVendor = (vendor: Omit<VendorProfile, 'id' | 'createdAt'>) => {
    if (!hasPermission('vendors', 'add')) return;
    const newVendor: VendorProfile = {
      ...vendor,
      id: `vend-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setVendors((prev) => [newVendor, ...prev]);
    recordAudit('CREATE', 'VENDORS', `Tạo hồ sơ Vendor mới: ${newVendor.name} (${newVendor.code})`);
  };

  const updateVendor = (id: string, updates: Partial<VendorProfile>) => {
    if (!hasPermission('vendors', 'edit')) return;
    setVendors((list) =>
      list.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
    recordAudit('UPDATE', 'VENDORS', `Cập nhật thông tin Vendor ${id}`);
  };

  const deleteVendor = (id: string): boolean => {
    if (!isAdmin) return false;
    const prev = vendors.find((v) => v.id === id);
    setVendors((list) => list.filter((v) => v.id !== id));
    recordAudit('DELETE', 'VENDORS', `Xóa hồ sơ Vendor ${prev?.name || id}`);
    return true;
  };

  const addVehicleToVendor = (vendorId: string, vehicle: Omit<VehicleInfo, 'id'>) => {
    if (!hasPermission('vendors', 'edit')) return;
    const newVeh: VehicleInfo = {
      ...vehicle,
      id: `veh-${Date.now()}`,
    };
    setVendors((list) =>
      list.map((v) =>
        v.id === vendorId
          ? { ...v, vehicles: [newVeh, ...v.vehicles], updatedAt: new Date().toISOString() }
          : v
      )
    );
    recordAudit('CREATE', 'VENDORS', `Thêm xe ${newVeh.licensePlate} (${newVeh.vehicleType}) cho Vendor ${vendorId}`);
  };

  const deleteVehicleFromVendor = (vendorId: string, vehicleId: string) => {
    if (!hasPermission('vendors', 'edit')) return;
    setVendors((list) =>
      list.map((v) =>
        v.id === vendorId
          ? { ...v, vehicles: v.vehicles.filter((veh) => veh.id !== vehicleId), updatedAt: new Date().toISOString() }
          : v
      )
    );
    recordAudit('DELETE', 'VENDORS', `Xóa xe ${vehicleId} khỏi Vendor ${vendorId}`);
  };

  const addDriverToVendor = (vendorId: string, driver: Omit<DriverInfo, 'id'>) => {
    if (!hasPermission('vendors', 'edit')) return;
    const newDrv: DriverInfo = {
      ...driver,
      id: `drv-${Date.now()}`,
    };
    setVendors((list) =>
      list.map((v) =>
        v.id === vendorId
          ? { ...v, drivers: [newDrv, ...v.drivers], updatedAt: new Date().toISOString() }
          : v
      )
    );
    recordAudit('CREATE', 'VENDORS', `Thêm tài xế ${newDrv.fullName} cho Vendor ${vendorId}`);
  };

  const deleteDriverFromVendor = (vendorId: string, driverId: string) => {
    if (!hasPermission('vendors', 'edit')) return;
    setVendors((list) =>
      list.map((v) =>
        v.id === vendorId
          ? { ...v, drivers: v.drivers.filter((d) => d.id !== driverId), updatedAt: new Date().toISOString() }
          : v
      )
    );
    recordAudit('DELETE', 'VENDORS', `Xóa tài xế ${driverId} khỏi Vendor ${vendorId}`);
  };

  // --- THAO TÁC ĐƠN VẬN HÀNH ---
  const addOrder = (order: Omit<OperationOrder, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!hasPermission('operations', 'add')) return;
    const now = new Date().toISOString();
    const newOrd: OperationOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      createdBy: `${currentUser.fullName} (${currentUser.username})`,
      createdAt: now,
    };
    setOrders((prev) => [newOrd, ...prev]);
    recordAudit(
      'CREATE',
      'OPERATIONS',
      `Tạo lệnh vận chuyển ${newOrd.orderCode} (KH: ${newOrd.customerName}, Vendor: ${newOrd.vendorName}, Xe: ${newOrd.licensePlate || 'N/A'})`
    );
  };

  const updateOrder = (id: string, updates: Partial<OperationOrder>) => {
    if (!hasPermission('operations', 'edit')) return;
    const now = new Date().toISOString();
    const updater = `${currentUser.fullName} (${currentUser.username})`;
    setOrders((list) =>
      list.map((o) =>
        o.id === id ? { ...o, ...updates, updatedBy: updater, updatedAt: now } : o
      )
    );
    recordAudit('UPDATE', 'OPERATIONS', `Cập nhật thông tin lệnh vận chuyển ${updates.orderCode || id}`);
  };

  const deleteOrder = (id: string): boolean => {
    if (!isAdmin) return false;
    const prev = orders.find((o) => o.id === id);
    setOrders((list) => list.filter((o) => o.id !== id));
    recordAudit('DELETE', 'OPERATIONS', `Xóa lệnh vận chuyển ${prev?.orderCode || id}`);
    return true;
  };

  // --- THAO TÁC NGƯỜI DÙNG & ĐĂNG NHẬP ---
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setCurrentUserId(userId);

    const isSuccess = target.role !== 'blocked';
    const newLogin: LoginLog = {
      id: `log-${Date.now()}`,
      userId: target.id,
      username: target.username,
      fullName: target.fullName,
      timestamp: new Date().toISOString(),
      ipAddress: '113.161.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10),
      userAgent: navigator.userAgent.substring(0, 70),
      status: isSuccess ? 'success' : 'failed',
      location: isSuccess ? 'TP. Hồ Chí Minh, Việt Nam' : 'Bị chặn (Không có quyền)',
    };
    setLoginLogs((prev) => [newLogin, ...prev]);

    if (isSuccess) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, lastLoginAt: newLogin.timestamp } : u))
      );
    }
  };

  const addUser = (user: Omit<SystemUser, 'id' | 'createdAt'>) => {
    if (!isAdmin) return;
    const newUser: SystemUser = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    recordAudit('CREATE', 'USER_MANAGEMENT', `Tạo tài khoản mới: ${newUser.username} (${newUser.fullName})`);
  };

  const updateUser = (id: string, updates: Partial<SystemUser>) => {
    if (!isAdmin) return;
    const prev = users.find((u) => u.id === id);
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    recordAudit('UPDATE', 'USER_MANAGEMENT', `Cập nhật phân quyền / bảo mật tài khoản ${prev?.username || id}`);
  };

  const deleteUser = (id: string): boolean => {
    if (!isAdmin) return false;
    const prev = users.find((u) => u.id === id);
    setUsers((list) => list.filter((u) => u.id !== id));
    recordAudit('DELETE', 'USER_MANAGEMENT', `Xóa tài khoản người dùng ${prev?.username || id}`);
    return true;
  };

  // Cập nhật đơn giá phụ phí
  const updateSurchargeRate = (id: string, newRate: number) => {
    if (!canEdit) return;
    setSurcharges((list) =>
      list.map((s) => (s.id === id ? { ...s, rate: newRate } : s))
    );
    recordAudit('UPDATE', 'SYSTEM_SETTINGS', `Thay đổi đơn giá phụ phí ${id} thành ${newRate.toLocaleString('vi-VN')} đ`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-admin');
    setCustomerPrices(INITIAL_CUSTOMER_PRICES);
    setVendorPrices(INITIAL_VENDOR_PRICES);
    setOrders(INITIAL_ORDERS);
    setVendors(INITIAL_VENDORS);
    setSurcharges(INITIAL_SURCHARGES);
    setLoginLogs(INITIAL_LOGIN_LOGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        customerPrices,
        vendorPrices,
        orders,
        vendors,
        surcharges,
        loginLogs,
        auditLogs,
        notifications,
        currentTab,
        setCurrentTab,
        canView,
        canEdit,
        canDelete,
        isAdmin,
        hasPermission,
        canViewPrices,
        canExportPriceExcel,
        shouldReceiveAlerts,
        addPriceItem,
        updatePriceItem,
        deletePriceItem,
        importPriceItems,
        addVendor,
        updateVendor,
        deleteVendor,
        addVehicleToVendor,
        deleteVehicleFromVendor,
        addDriverToVendor,
        deleteDriverFromVendor,
        addOrder,
        updateOrder,
        deleteOrder,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        updateSurchargeRate,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
