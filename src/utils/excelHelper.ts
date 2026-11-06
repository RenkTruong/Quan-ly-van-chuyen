import * as XLSX from 'xlsx';
import { RoutePriceItem, PriceTarget, VehicleType, PricingModel, OperationOrder } from '../types';
import { getOrGenerateRouteCode } from '../data/vietnamGeo';

/**
 * Tải file Excel mẫu chuẩn cho Bảng báo giá (Khách hàng hoặc Vendor)
 */
export function downloadPriceTemplate(target: PriceTarget) {
  const targetLabel = target === 'customer' ? 'Khách hàng' : 'Vendor';
  const headers = target === 'customer' ? [
    {
      'Loại bảng giá': targetLabel,
      'Tên khách hàng': 'Tập Đoàn Bán Lẻ WinCommerce',
      'Hình thức tính': 'Số khối', // 'Số khối' | 'Chuyến' | 'Giá tấn'
      'Tỉnh / Thành phố': 'Thành phố Hồ Chí Minh',
      'Quận / Huyện': 'Huyện Bình Chánh',
      'Mã tuyến (Hệ thống tự động sinh theo chuẩn)': '(Tự động sinh)',
      'Loại xe': '2T', // 1.5T | 2T | 5T | 8T | 15T
      'Đơn giá (VNĐ)': 160000,
      'Đơn giá rớt điểm (VNĐ)': 100000,
      'Ngày áp dụng (YYYY-MM-DD)': '2026-11-01',
      'Ngày hết hạn (YYYY-MM-DD)': '2026-12-31',
      'Ghi chú': 'Bảng giá chuẩn quý 4',
    },
    {
      'Loại bảng giá': targetLabel,
      'Tên khách hàng': 'Công Ty CP Dược Phẩm FPT Long Châu',
      'Hình thức tính': 'Chuyến',
      'Tỉnh / Thành phố': 'Thành phố Hồ Chí Minh',
      'Quận / Huyện': 'Thành phố Thủ Đức',
      'Mã tuyến (Hệ thống tự động sinh theo chuẩn)': '(Tự động sinh)',
      'Loại xe': '1.5T',
      'Đơn giá (VNĐ)': 850000,
      'Đơn giá rớt điểm (VNĐ)': 100000,
      'Ngày áp dụng (YYYY-MM-DD)': '2026-11-01',
      'Ngày hết hạn (YYYY-MM-DD)': '',
      'Ghi chú': 'Giao theo chuyến nội thành',
    },
    {
      'Loại bảng giá': targetLabel,
      'Tên khách hàng': 'Tổng Kho Masan Consumer',
      'Hình thức tính': 'Giá tấn',
      'Tỉnh / Thành phố': 'Tỉnh Đồng Nai',
      'Quận / Huyện': 'Thành phố Biên Hòa',
      'Mã tuyến (Hệ thống tự động sinh theo chuẩn)': '(Tự động sinh)',
      'Loại xe': '8T',
      'Đơn giá (VNĐ)': 380000,
      'Đơn giá rớt điểm (VNĐ)': 100000,
      'Ngày áp dụng (YYYY-MM-DD)': '2026-11-01',
      'Ngày hết hạn (YYYY-MM-DD)': '',
      'Ghi chú': 'Vận chuyển hàng bao kiện',
    },
  ] : [
    {
      'Loại bảng giá': targetLabel,
      'Tên Vendor (Tên NCC)': 'Đội Xe Vận Tải Sài Gòn Logistics',
      'Dự án / Khách hàng áp dụng': 'Tập Đoàn Bán Lẻ WinCommerce',
      'Hình thức tính': 'Số khối',
      'Tỉnh / Thành phố': 'Thành phố Hồ Chí Minh',
      'Quận / Huyện': 'Huyện Bình Chánh',
      'Mã tuyến (Hệ thống tự động sinh theo chuẩn)': '(Tự động sinh)',
      'Loại xe': '2T',
      'Đơn giá (VNĐ)': 125000,
      'Đơn giá rớt điểm Vendor (VNĐ)': 90000,
      'Ngày áp dụng (YYYY-MM-DD)': '2026-11-01',
      'Ngày hết hạn (YYYY-MM-DD)': '2026-12-31',
      'Ghi chú': 'Áp dụng chạy riêng cho WinCommerce',
    },
    {
      'Loại bảng giá': targetLabel,
      'Tên Vendor (Tên NCC)': 'Nhà Xe Vận Tải Hoàng Gia',
      'Dự án / Khách hàng áp dụng': 'Tất cả khách hàng (Chung)',
      'Hình thức tính': 'Chuyến',
      'Tỉnh / Thành phố': 'Thành phố Hồ Chí Minh',
      'Quận / Huyện': 'Thành phố Thủ Đức',
      'Mã tuyến (Hệ thống tự động sinh theo chuẩn)': '(Tự động sinh)',
      'Loại xe': '1.5T',
      'Đơn giá (VNĐ)': 650000,
      'Đơn giá rớt điểm Vendor (VNĐ)': 80000,
      'Ngày áp dụng (YYYY-MM-DD)': '2026-11-01',
      'Ngày hết hạn (YYYY-MM-DD)': '',
      'Ghi chú': 'Bảng giá chuyến chung',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Mau_Bang_Gia_${target.toUpperCase()}`);
  XLSX.writeFile(workbook, `Mau_Bang_Gia_${target === 'customer' ? 'Khach_Hang' : 'Vendor'}.xlsx`);
}

/**
 * Đọc file Excel import bảng giá
 */
export async function parsePriceExcel(
  file: File,
  target: PriceTarget,
  currentUser: string,
  existingPriceList: RoutePriceItem[] = []
): Promise<{ success: boolean; data: RoutePriceItem[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        const items: RoutePriceItem[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2;
          const targetName = (
            row['Tên khách hàng / Vendor'] ||
            row['Tên khách hàng'] ||
            row['Tên Vendor (Tên NCC)'] ||
            row['Tên'] ||
            'Áp dụng chung'
          ).toString().trim();

          const appliedCustomerName = (
            row['Dự án / Khách hàng áp dụng'] ||
            row['Dự án'] ||
            row['Khách hàng'] ||
            'Tất cả khách hàng (Chung)'
          ).toString().trim();

          const rawModel = (row['Hình thức tính'] || row['Hình thức'] || 'Số khối').toString().toLowerCase();
          
          let pricingModel: PricingModel = 'volume';
          if (rawModel.includes('chuyến') || rawModel.includes('trip')) pricingModel = 'trip';
          else if (rawModel.includes('tấn') || rawModel.includes('ton')) pricingModel = 'ton';

          const province = (row['Tỉnh / Thành phố'] || row['Tỉnh/Thành'] || row['Tỉnh'] || 'Thành phố Hồ Chí Minh').toString().trim();
          const district = (row['Quận / Huyện'] || row['Quận/Huyện'] || row['Quận'] || 'Huyện Bình Chánh').toString().trim();
          
          // Tự động tìm mã tuyến đã có hoặc sinh mã tuyến mới chuẩn
          const combinedList = [...existingPriceList, ...items];
          const routeCode = getOrGenerateRouteCode(district, province, combinedList);

          let vehicleType: VehicleType = '2T';
          const rawVeh = (row['Loại xe'] || '2T').toString().toUpperCase().trim();
          if (['1.5T', '2T', '5T', '8T', '15T'].includes(rawVeh)) {
            vehicleType = rawVeh as VehicleType;
          }

          const rawPrice = row['Đơn giá (VNĐ)'] || row['Đơn giá'] || 0;
          const unitPrice = parseFloat(rawPrice.toString().replace(/[^0-9.]/g, '')) || 0;

          const rawDrop = row['Đơn giá rớt điểm Vendor (VNĐ)'] || row['Đơn giá rớt điểm (VNĐ)'] || row['Phí rớt điểm'] || (target === 'customer' ? 100000 : 90000);
          const dropPointRate = parseFloat(rawDrop.toString().replace(/[^0-9.]/g, '')) || (target === 'customer' ? 100000 : 90000);

          const effectiveDate = (row['Ngày áp dụng (YYYY-MM-DD)'] || row['Ngày áp dụng'] || new Date().toISOString().split('T')[0]).toString().trim();
          const expirationDate = (row['Ngày hết hạn (YYYY-MM-DD)'] || row['Ngày hết hạn'] || '').toString().trim();
          const notes = (row['Ghi chú'] || '').toString().trim();

          if (unitPrice <= 0) {
            errors.push(`Dòng ${rowNum}: Đơn giá không hợp lệ (${rawPrice})`);
            return;
          }

          items.push({
            id: `pr-import-${Date.now()}-${index}`,
            target,
            targetName,
            appliedCustomerName: target === 'vendor' ? appliedCustomerName : undefined,
            pricingModel,
            province,
            district,
            routeCode,
            vehicleType,
            unitPrice,
            dropPointRate,
            effectiveDate,
            expirationDate: expirationDate || undefined,
            surcharges: [],
            status: 'active',
            notes,
            updatedBy: currentUser,
            updatedAt: new Date().toISOString(),
          });
        });

        if (items.length === 0 && errors.length === 0) {
          errors.push('File Excel rỗng hoặc không đúng định dạng các cột yêu cầu');
        }

        resolve({
          success: errors.length === 0 && items.length > 0,
          data: items,
          errors,
        });
      } catch (err: any) {
        resolve({
          success: false,
          data: [],
          errors: [`Lỗi xử lý file Excel: ${err.message}`],
        });
      }
    };
    reader.readAsBinaryString(file);
  });
}

/**
 * Tải file Excel báo cáo doanh thu & lợi nhuận
 */
export function exportReportToExcel(reportData: any[], fileName: string = 'Bao_Cao_Doanh_Thu_Loi_Nhuan.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao_Cao');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Tải file Excel danh sách đơn vận hành
 */
export function exportOrdersToExcel(orders: OperationOrder[], fileName: string = 'Du_Lieu_Van_Hanh_Hang_Ngay.xlsx') {
  const exportRows = orders.map((o) => ({
    'Mã lệnh': o.orderCode,
    'Ngày kế hoạch': o.planDate,
    'Ngày vận chuyển': o.shippingDate,
    'Mã tuyến': o.routeCode,
    'Tỉnh / Thành': o.province,
    'Quận / Huyện': o.district,
    'Khách hàng': o.customerName,
    'Vendor (Tên NCC)': o.vendorName,
    'Biển số xe': o.licensePlate || '',
    'Tên tài xế': o.driverName || '',
    'SĐT tài xế': o.driverPhone || '',
    'Địa chỉ giao': o.deliveryAddress,
    'SĐT người nhận': o.phoneNumber,
    'Loại xe': o.vehicleType,
    'Hình thức': o.pricingModel === 'volume' ? 'Số khối (m³)' : o.pricingModel === 'trip' ? 'Chuyến' : 'Giá tấn',
    'Số lượng': o.quantity,
    'Số điểm giao': o.dropPoints,
    'Phụ phí rớt điểm (VNĐ)': o.dropFeeApplied,
    'Tổng doanh thu khách (VNĐ)': o.customerTotalAmount,
    'Cước Vendor gốc (VNĐ)': o.vendorFreight,
    'Phụ phí phát sinh Vendor (VNĐ)': o.vendorExtraFees,
    'Hình thức phạt thỏa thuận': o.penaltyType === 'percentage' ? `${o.penaltyValue}% cước` : o.penaltyType === 'fixed' ? 'Mức khoán' : 'Không',
    'Lý do phạt': o.penaltyReason || '',
    'Tiền phạt khấu trừ (VNĐ)': o.penaltyAmount || 0,
    'Chi phí thực tế Vendor (VNĐ)': o.vendorTotalCost,
    'Lợi nhuận gộp (VNĐ)': o.grossProfit,
    'Tỷ suất lợi nhuận (%)': o.profitMarginPercent + '%',
    'Trạng thái': o.status,
    'Ghi chú': o.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Van_Hanh');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Xuất dữ liệu bảng giá ra file Excel (Chức năng bảo mật cần phân quyền)
 */
export function exportPriceItemsToExcel(items: RoutePriceItem[], target: PriceTarget, fileName?: string) {
  const targetLabel = target === 'customer' ? 'Khach_Hang' : 'Vendor';
  const rows = items.map((p) => ({
    'Đối tượng': target === 'customer' ? 'Khách hàng' : 'Vendor',
    'Tên đối tượng': p.targetName,
    ...(target === 'vendor' ? { 'Dự án / Khách hàng áp dụng': p.appliedCustomerName || 'Tất cả khách hàng (Chung)' } : {}),
    'Mã tuyến': p.routeCode,
    'Tỉnh / Thành phố': p.province,
    'Quận / Huyện': p.district,
    'Loại xe': p.vehicleType,
    'Hình thức tính': p.pricingModel === 'volume' ? 'Số khối (m³)' : p.pricingModel === 'trip' ? 'Chuyến' : 'Giá tấn',
    'Đơn giá (VNĐ)': p.unitPrice,
    'Đơn giá rớt điểm (VNĐ)': p.dropPointRate || (target === 'customer' ? 100000 : 90000),
    'Ngày áp dụng': p.effectiveDate,
    'Ngày hết hạn': p.expirationDate || 'Vô thời hạn',
    'Trạng thái': p.status,
    'Người cập nhật': p.updatedBy,
    'Thời gian cập nhật': p.updatedAt,
    'Ghi chú': p.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Bang_Gia_${targetLabel}`);
  XLSX.writeFile(workbook, fileName || `Bang_Gia_${targetLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
