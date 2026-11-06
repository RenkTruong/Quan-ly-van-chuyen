export type PricingModel = 'volume' | 'trip' | 'ton'; // 'volume' = Số khối (m³), 'trip' = Chuyến, 'ton' = Giá tấn

export type VehicleType = '1.5T' | '2T' | '5T' | '8T' | '15T';

export const VEHICLE_TYPES: VehicleType[] = ['1.5T', '2T', '5T', '8T', '15T'];

export type PriceTarget = 'customer' | 'vendor';

export interface SurchargeConfig {
  id: string;
  name: string; // Tên phụ phí (vd: Phí rớt điểm, Phí bốc xếp, Phí chờ xe)
  calculationType: 'drop_points' | 'fixed' | 'per_unit' | 'percentage';
  rate: number; // Đơn giá (vd: 100000)
  unit: string; // Đơn vị tính (vd: 'điểm', 'chuyến', 'giờ', '%')
  description: string;
  isDefault: boolean;
}

export type VendorPenaltyType = 'none' | 'percentage' | 'fixed'; // 'percentage' = % giá cước, 'fixed' = Mức khoán

// --- QUẢN LÝ VENDOR & ĐỘI XE, TÀI XẾ ---
export interface VehicleInfo {
  id: string;
  licensePlate: string; // Biển số xe (VD: 51D-892.45)
  vehicleType: VehicleType; // Loại xe (1.5T, 2T, 5T, 8T, 15T)
  payloadCapacity?: string; // Tải trọng đăng ký (VD: 1.95 tấn)
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export interface DriverInfo {
  id: string;
  fullName: string; // Họ tên tài xế
  phoneNumber: string; // Số điện thoại
  licenseNumber?: string; // Số bằng lái (GPLX)
  licenseGrade?: string; // Hạng bằng (B2, C, D, FC)
  status: 'active' | 'inactive';
  notes?: string;
}

export interface VendorProfile {
  id: string;
  code: string; // Mã NCC (VD: VEND-001)
  name: string; // Tên NCC (VD: Đội Xe Vận Tải Sài Gòn Logistics)
  taxCode?: string; // Mã số thuế
  contactPerson: string; // Người liên hệ
  phone: string; // Số điện thoại
  email?: string;
  address?: string;
  defaultDropRate?: number; // Đơn giá rớt điểm riêng của Vendor (VD: 80.000đ, 100.000đ...)
  vehicles: VehicleInfo[]; // Danh sách xe đăng ký
  drivers: DriverInfo[]; // Danh sách tài xế đăng ký
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RoutePriceItem {
  id: string;
  target: PriceTarget; // 'customer' | 'vendor'
  targetName: string; // Tên khách hàng cụ thể hoặc 'Áp dụng chung', hoặc Tên Vendor (Tên NCC)
  
  // Bảng giá vendor theo Dự án (Khách hàng)
  appliedCustomerName?: string; // Ví dụ: 'Tập Đoàn Bán Lẻ WinCommerce' hoặc 'Tất cả khách hàng (Chung)'
  
  pricingModel: PricingModel; // 'volume' | 'trip' | 'ton'
  
  province: string; // Tỉnh / Thành phố
  district: string; // Quận / Huyện
  routeCode: string; // Mã tuyến: 6 chữ (3 Quận/Huyện + 3 Tỉnh/Thành) + 6 số tự động
  
  vehicleType: VehicleType; // Loại xe (1.5T, 2T, 5T, 8T, 15T)
  unitPrice: number; // Đơn giá theo khối / chuyến / tấn (VNĐ)
  
  dropPointRate?: number; // Đơn giá phụ phí rớt điểm riêng (Khách hàng mặc định 100k, Vendor có thể thay đổi đơn giá)
  
  effectiveDate: string; // Ngày áp dụng (YYYY-MM-DD)
  expirationDate?: string; // Ngày hết hạn (YYYY-MM-DD, tuỳ chỉnh hoặc để trống là vô thời hạn)
  
  surcharges: SurchargeConfig[]; // Danh mục phụ phí đi kèm
  
  // Điều khoản phạt thỏa thuận chuẩn của vendor (nếu là target vendor)
  defaultPenaltyType?: VendorPenaltyType;
  defaultPenaltyValue?: number; // % cước hoặc mức khoán VNĐ
  
  status: 'active' | 'upcoming' | 'expired';
  notes?: string;
  
  updatedBy: string; // Tài khoản update bảng giá
  updatedAt: string; // Thời gian chỉnh sửa mới nhất (ISO format)
}

export type OrderStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'delayed';

export interface OperationOrder {
  id: string;
  orderCode: string; // Mã lệnh (vd: ORD-20261102-001)
  planDate: string; // Ngày kế hoạch (YYYY-MM-DD)
  shippingDate: string; // Ngày vận chuyển (YYYY-MM-DD)
  
  routeCode: string; // Mã tuyến (liên kết bảng giá)
  province: string;
  district: string;
  
  customerName: string; // Khách hàng
  
  // Thông tin Vendor (Nhà cung cấp) bổ sung
  vendorName: string; // Tên vendor (Tên NCC)
  licensePlate: string; // Biển số xe (vd: 51D-892.45)
  driverName: string; // Tên tài xế
  driverPhone: string; // Sđt tài xế
  
  deliveryAddress: string; // Địa chỉ
  phoneNumber: string; // Số điện thoại người nhận
  
  vehicleType: VehicleType; // Loại xe
  pricingModel: PricingModel; // Hình thức tính
  quantity: number; // Số khối (m³), hoặc 1 (nếu theo chuyến), hoặc số tấn
  
  dropPoints: number; // Tổng số điểm giao (Vd: đi 6 điểm)
  customerDropRate: number; // Đơn giá rớt điểm tính cho khách (mặc định 100.000đ)
  customerDropFee: number; // Phụ phí rớt điểm khách = (dropPoints - 1) * customerDropRate
  vendorDropRate: number; // Đơn giá rớt điểm vendor (có thể thay đổi theo từng vendor)
  vendorDropFee: number; // Phụ phí rớt điểm vendor = (dropPoints - 1) * vendorDropRate
  dropFeeApplied: number; // Tương thích ngược: phí rớt điểm chung
  
  customerUnitPrice: number; // Đơn giá khách hàng (tra cứu bảng giá khách <= ngày vận chuyển)
  customerFreight: number; // Tiền vận chuyển khách hàng = quantity * customerUnitPrice
  customerOtherFees: number; // Phụ phí khác của khách
  customerTotalAmount: number; // Tổng doanh thu khách hàng = freight + dropFee + otherFees
  
  vendorUnitPrice: number; // Đơn giá vendor (tra cứu bảng giá vendor <= ngày vận chuyển)
  vendorFreight: number; // Tiền vận chuyển vendor = quantity * vendorUnitPrice
  vendorExtraFees: number; // Chi phí phát sinh thực tế (gồm phí rớt điểm vendor + phát sinh)
  
  // Phạt thỏa thuận với Vendor
  penaltyType: VendorPenaltyType; // 'none' | 'percentage' | 'fixed' (% giá cước hoặc mức khoán)
  penaltyValue: number; // Tỷ lệ % (vd: 10) hoặc số tiền khoán (vd: 200,000)
  penaltyReason?: string; // Lý do phạt theo thỏa thuận (trễ giờ, giao thiếu, vi phạm an toàn...)
  penaltyAmount: number; // Số tiền phạt thực tế (VNĐ) được trừ vào chi phí thực tế trả Vendor
  
  vendorTotalCost: number; // Tổng cộng chi phí thực tế của từng đơn = vendorFreight + vendorExtraFees - penaltyAmount
  
  grossProfit: number; // Lợi nhuận = customerTotalAmount - vendorTotalCost
  profitMarginPercent: number; // % Lợi nhuận
  
  status: OrderStatus;
  notes?: string;
  
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

// --- MA TRẬN PHÂN QUYỀN THEO DANH MỤC ---
export type AppPermissionModule =
  | 'dashboard'          // Dashboard kinh doanh
  | 'price_customer'     // Bảng giá Khách hàng
  | 'price_vendor'       // Bảng giá Vendor
  | 'vendors'            // Quản lý Vendor & Xe / Tài xế
  | 'operations'         // Dữ liệu vận hành hàng ngày
  | 'reports'            // Báo cáo doanh thu & P&L
  | 'users'              // Phân quyền & Quản lý tài khoản
  | 'audit';             // Nhật ký bảo mật & Audit log

export interface ModulePermission {
  blocked: boolean; // Khóa: không được truy cập danh mục này
  view: boolean;    // Xem: cho phép xem dữ liệu
  edit: boolean;    // Sửa: cho phép xem/sửa không xóa
  add: boolean;     // Thêm: cho phép tạo mới bản ghi
}

export interface UserSecurityPermissions {
  showPriceColumns: boolean;      // Hiện | Ẩn cột giá (giá Khách & Vendor)
  allowExportPriceExcel: boolean; // Cho phép Xuất Excel bảng giá về
  receivePriceAlerts: boolean;    // Nhận thông báo khi có thay đổi giá mới
}

export type UserRole = 
  | 'viewer'    // Cho phép xem: Không được sửa
  | 'editor'    // Cho phép xem/ sửa: Cho phép xem/ sửa, không xóa
  | 'admin'     // Quản trị viên: Toàn quyền, chỉ admin được xóa, phân quyền & tạo tài khoản mới
  | 'custom'    // Phân quyền tùy biến theo danh mục
  | 'blocked';  // Không được truy cập: Không cho xem

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  
  // Phân quyền ma trận theo danh mục:
  permissions: Record<AppPermissionModule, ModulePermission>;
  // Cấu hình bảo mật giá & thông báo:
  security: UserSecurityPermissions;
}

export interface LoginLog {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  location?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT' | 'ROLE_CHANGE';
  module: 'PRICE_CUSTOMER' | 'PRICE_VENDOR' | 'VENDORS' | 'OPERATIONS' | 'USER_MANAGEMENT' | 'SYSTEM_SETTINGS';
  description: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface PriceChangeNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  target: PriceTarget;
  routeCode: string;
  updatedBy: string;
  read: boolean;
}
