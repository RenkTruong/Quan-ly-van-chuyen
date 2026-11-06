import { RoutePriceItem, PriceTarget, VehicleType, PricingModel, SurchargeConfig } from '../types';

/**
 * Tính phụ phí rớt điểm tự động:
 * Vd: Đi 6 điểm tính rớt 5 điểm (điều kiện cùng 1 mã lệnh/ngày, đi 6 điểm thì tính rớt 5 điểm), đơn giá 100.000 VNĐ.
 */
export function calculateDropPointFee(dropPoints: number, unitRate: number = 100000): number {
  if (dropPoints > 1) {
    return (dropPoints - 1) * unitRate;
  }
  return 0;
}

/**
 * Tra cứu bảng giá gần nhất có ngày áp dụng <= ngày vận chuyển
 * (VD: ngày vận chuyển là 02/11 thì giá được tính là có ngày áp dụng <= 02/11 gần nhất)
 */
export function findMatchingPriceItem(
  priceList: RoutePriceItem[],
  params: {
    target: PriceTarget;
    targetName?: string;
    appliedCustomerName?: string; // Khách hàng / Dự án áp dụng (Dành cho Vendor)
    routeCode?: string;
    province?: string;
    district?: string;
    vehicleType: VehicleType;
    pricingModel: PricingModel;
    shippingDate: string; // YYYY-MM-DD
  }
): RoutePriceItem | undefined {
  const eligible = priceList.filter((item) => {
    // Phải đúng loại đối tượng (Khách hàng hoặc Vendor)
    if (item.target !== params.target) return false;
    
    // Đúng loại xe
    if (item.vehicleType !== params.vehicleType) return false;
    
    // Đúng hình thức tính (Số khối, Chuyến, Tấn)
    if (item.pricingModel !== params.pricingModel) return false;
    
    // Ngày áp dụng phải <= ngày vận chuyển
    if (item.effectiveDate > params.shippingDate) return false;
    
    // Nếu có ngày hết hạn thì ngày vận chuyển phải <= ngày hết hạn
    if (item.expirationDate && item.expirationDate < params.shippingDate) return false;
    
    // Khớp mã tuyến hoặc khớp Tỉnh/Huyện
    const matchesRoute = params.routeCode && item.routeCode.toUpperCase() === params.routeCode.toUpperCase();
    const matchesGeo = 
      params.province && 
      params.district && 
      item.province.toLowerCase().includes(params.province.toLowerCase()) && 
      item.district.toLowerCase().includes(params.district.toLowerCase());
      
    if (!matchesRoute && !matchesGeo) return false;
    
    return true;
  });

  if (eligible.length === 0) return undefined;

  // Nếu tra cứu giá Vendor theo Dự án (Khách hàng)
  if (params.target === 'vendor' && params.targetName) {
    const vendorMatches = eligible.filter(
      (e) => e.targetName.toLowerCase() === params.targetName!.toLowerCase()
    );

    // Ưu tiên 1: Vendor khớp Tên NCC VÀ khớp đúng Dự án / Khách hàng cụ thể
    if (params.appliedCustomerName) {
      const projectMatches = vendorMatches.filter(
        (e) => e.appliedCustomerName && e.appliedCustomerName.toLowerCase() === params.appliedCustomerName!.toLowerCase()
      );
      if (projectMatches.length > 0) {
        projectMatches.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
        return projectMatches[0];
      }
    }

    // Ưu tiên 2: Vendor khớp Tên NCC áp dụng chung
    const generalVendorMatches = vendorMatches.filter(
      (e) => !e.appliedCustomerName || e.appliedCustomerName === 'Tất cả khách hàng (Chung)'
    );
    if (generalVendorMatches.length > 0) {
      generalVendorMatches.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
      return generalVendorMatches[0];
    }

    if (vendorMatches.length > 0) {
      vendorMatches.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
      return vendorMatches[0];
    }
  }

  // Tra cứu giá Khách hàng cụ thể
  if (params.target === 'customer' && params.targetName) {
    const specific = eligible.filter(
      (e) => e.targetName.toLowerCase() === params.targetName!.toLowerCase()
    );
    if (specific.length > 0) {
      specific.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
      return specific[0];
    }
  }

  // Fallback: Lấy bảng giá chung gần nhất
  eligible.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
  return eligible[0];
}

/**
 * Tính toán đầy đủ chi phí và doanh thu cho một đơn hàng
 */
export function calculateOrderFinancials(params: {
  pricingModel: PricingModel;
  vehicleType: VehicleType;
  quantity: number; // m3 khối, hoặc 1 chuyến, hoặc số tấn
  dropPoints: number; // Tổng số điểm giao
  customerUnitPrice: number;
  customerCustomDropRate?: number; // Đơn giá rớt điểm khách (mặc định 100k)
  customerOtherFees?: number;
  vendorUnitPrice: number;
  vendorCustomDropRate?: number; // Đơn giá rớt điểm vendor (có thể thay đổi theo từng vendor)
  vendorExtraFees?: number;
  penaltyType?: 'none' | 'percentage' | 'fixed'; // Phạt thỏa thuận
  penaltyValue?: number; // % hoặc mức khoán
}) {
  // 1. Phụ phí rớt điểm độc lập giữa Khách hàng và Vendor
  const customerDropRate = params.customerCustomDropRate !== undefined ? params.customerCustomDropRate : 100000;
  const vendorDropRate = params.vendorCustomDropRate !== undefined ? params.vendorCustomDropRate : 100000;
  
  const customerDropFee = calculateDropPointFee(params.dropPoints, customerDropRate);
  const vendorDropFee = calculateDropPointFee(params.dropPoints, vendorDropRate);

  // 2. Tiền cước vận chuyển cơ sở
  let customerFreight = 0;
  let vendorFreight = 0;

  if (params.pricingModel === 'trip') {
    // Chuyến: Giá trọn gói chuyến
    customerFreight = params.customerUnitPrice * (params.quantity > 0 ? params.quantity : 1);
    vendorFreight = params.vendorUnitPrice * (params.quantity > 0 ? params.quantity : 1);
  } else {
    // Khối (m3) hoặc Tấn (ton)
    customerFreight = params.customerUnitPrice * params.quantity;
    vendorFreight = params.vendorUnitPrice * params.quantity;
  }

  // 3. Phạt thỏa thuận với Vendor (theo % cước hoặc mức khoán)
  let penaltyAmount = 0;
  if (params.penaltyType === 'percentage' && params.penaltyValue && params.penaltyValue > 0) {
    penaltyAmount = Math.round(vendorFreight * (params.penaltyValue / 100));
  } else if (params.penaltyType === 'fixed' && params.penaltyValue && params.penaltyValue > 0) {
    penaltyAmount = Math.round(params.penaltyValue);
  }

  // 4. Doanh thu khách hàng
  const customerOtherFees = params.customerOtherFees || 0;
  const customerTotalAmount = customerFreight + customerDropFee + customerOtherFees;

  // 5. Chi phí Vendor (thực tế trả vendor: Cước + phụ phí phát sinh + phí rớt điểm vendor - Phạt thỏa thuận)
  const vendorExtra = (params.vendorExtraFees || 0) + vendorDropFee;
  const vendorTotalCost = Math.max(0, vendorFreight + vendorExtra - penaltyAmount);

  // 6. Lợi nhuận gộp & tỷ suất
  const grossProfit = customerTotalAmount - vendorTotalCost;
  const profitMarginPercent = customerTotalAmount > 0 
    ? (grossProfit / customerTotalAmount) * 100 
    : 0;

  return {
    dropFee: customerDropFee, // backward compatibility
    customerDropFee,
    customerDropRate,
    vendorDropFee,
    vendorDropRate,
    customerFreight,
    customerTotalAmount,
    vendorFreight,
    penaltyAmount,
    vendorTotalCost,
    grossProfit,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
  };
}

/**
 * Format tiền tệ VNĐ
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format số gọn (1.200.000 -> 1,2 tr hoặc giữ nguyên định dạng)
 */
export function formatNumber(val: number): string {
  return new Intl.NumberFormat('vi-VN').format(val || 0);
}
