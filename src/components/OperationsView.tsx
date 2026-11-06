import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OperationOrder, VehicleType, VEHICLE_TYPES, PricingModel, OrderStatus, VendorPenaltyType } from '../types';
import { findMatchingPriceItem, calculateOrderFinancials, formatVND } from '../utils/pricingEngine';
import { exportOrdersToExcel } from '../utils/excelHelper';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  AlertCircle,
  X,
  FileText,
  User,
  ChevronRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const OperationsView: React.FC = () => {
  const {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    customerPrices,
    vendorPrices,
    canEdit,
    canDelete,
    currentUser,
    vendors,
    canViewPrices,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OperationOrder | null>(null);

  // Form Fields
  const [orderCode, setOrderCode] = useState('');
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [shippingDate, setShippingDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeCode, setRouteCode] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [customerName, setCustomerName] = useState('Tập Đoàn Bán Lẻ WinCommerce');
  const [vendorName, setVendorName] = useState('Đội Xe Vận Tải Sài Gòn Logistics');
  const [licensePlate, setLicensePlate] = useState('51D-892.45');
  const [driverName, setDriverName] = useState('Nguyễn Văn Tuấn');
  const [driverPhone, setDriverPhone] = useState('0918.452.190');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('2T');
  const [pricingModel, setPricingModel] = useState<PricingModel>('volume');
  const [quantity, setQuantity] = useState<number>(10);
  const [dropPoints, setDropPoints] = useState<number>(6); // Ví dụ: 6 điểm -> rớt 5 điểm
  const [customerOtherFees, setCustomerOtherFees] = useState<number>(0);
  const [vendorOtherFees, setVendorOtherFees] = useState<number>(0);
  // Phạt thỏa thuận với Vendor
  const [penaltyType, setPenaltyType] = useState<VendorPenaltyType>('none');
  const [penaltyValue, setPenaltyValue] = useState<number>(0);
  const [penaltyReason, setPenaltyReason] = useState<string>('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');

  // Auto-calculated state for preview
  const [calculatedFinancials, setCalculatedFinancials] = useState({
    customerUnitPrice: 0,
    customerFreight: 0,
    customerDropRate: 100000,
    customerDropFee: 0,
    customerTotalAmount: 0,
    dropFeeApplied: 0,
    vendorUnitPrice: 0,
    vendorFreight: 0,
    vendorDropRate: 80000,
    vendorDropFee: 0,
    penaltyAmount: 0,
    vendorTotalCost: 0,
    grossProfit: 0,
    profitMarginPercent: 0,
  });

  // Tự động sinh mã lệnh mới khi mở modal
  const generateNewOrderCode = () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randNum = String(orders.length + 1).padStart(3, '0');
    return `ORD-${today}-${randNum}`;
  };

  // Khởi tạo tuyến mặc định
  useEffect(() => {
    if (!routeCode && customerPrices.length > 0) {
      const first = customerPrices[0];
      setRouteCode(first.routeCode);
      setProvince(first.province);
      setDistrict(first.district);
      setVehicleType(first.vehicleType);
      setPricingModel(first.pricingModel);
    }
  }, [customerPrices]);

  // Handle Vendor Change -> auto select first vehicle and driver
  const handleVendorSelect = (selectedVenName: string) => {
    setVendorName(selectedVenName);
    const venProfile = vendors.find((v) => v.name === selectedVenName);
    if (venProfile) {
      if (venProfile.vehicles.length > 0) {
        setLicensePlate(venProfile.vehicles[0].licensePlate);
        setVehicleType(venProfile.vehicles[0].vehicleType);
      }
      if (venProfile.drivers.length > 0) {
        setDriverName(venProfile.drivers[0].fullName);
        setDriverPhone(venProfile.drivers[0].phoneNumber);
      }
    }
  };

  // Cập nhật tính toán tài chính tự động khi người dùng thay đổi dữ liệu trên form
  useEffect(() => {
    // 1. Dò bảng giá khách hàng gần nhất có ngày áp dụng <= ngày vận chuyển
    const matchedCustPrice = findMatchingPriceItem(customerPrices, {
      target: 'customer',
      targetName: customerName,
      routeCode,
      province,
      district,
      vehicleType,
      pricingModel,
      shippingDate,
    });

    // 2. Dò bảng giá vendor gần nhất có ngày áp dụng <= ngày vận chuyển (ưu tiên khớp Dự án/Khách hàng)
    const matchedVenPrice = findMatchingPriceItem(vendorPrices, {
      target: 'vendor',
      targetName: vendorName,
      appliedCustomerName: customerName,
      routeCode,
      province,
      district,
      vehicleType,
      pricingModel,
      shippingDate,
    });

    const cPrice = matchedCustPrice ? matchedCustPrice.unitPrice : (pricingModel === 'trip' ? 800000 : 150000);
    const vPrice = matchedVenPrice ? matchedVenPrice.unitPrice : (pricingModel === 'trip' ? 600000 : 120000);
    const cDropRate = matchedCustPrice?.dropPointRate ?? 100000;
    const vDropRate = matchedVenPrice?.dropPointRate ?? 80000;

    const fin = calculateOrderFinancials({
      pricingModel,
      vehicleType,
      quantity,
      dropPoints,
      customerUnitPrice: cPrice,
      customerOtherFees,
      customerCustomDropRate: cDropRate,
      vendorUnitPrice: vPrice,
      vendorExtraFees: vendorOtherFees,
      vendorCustomDropRate: vDropRate,
      penaltyType,
      penaltyValue,
    });

    setCalculatedFinancials({
      customerUnitPrice: cPrice,
      customerFreight: fin.customerFreight,
      customerDropRate: fin.customerDropRate,
      customerDropFee: fin.customerDropFee,
      customerTotalAmount: fin.customerTotalAmount,
      dropFeeApplied: fin.dropFee,
      vendorUnitPrice: vPrice,
      vendorFreight: fin.vendorFreight,
      vendorDropRate: fin.vendorDropRate,
      vendorDropFee: fin.vendorDropFee,
      penaltyAmount: fin.penaltyAmount,
      vendorTotalCost: fin.vendorTotalCost,
      grossProfit: fin.grossProfit,
      profitMarginPercent: fin.profitMarginPercent,
    });
  }, [
    routeCode,
    province,
    district,
    customerName,
    vendorName,
    vehicleType,
    pricingModel,
    quantity,
    dropPoints,
    shippingDate,
    customerOtherFees,
    vendorOtherFees,
    penaltyType,
    penaltyValue,
    customerPrices,
    vendorPrices,
  ]);

  // Reset form
  const resetForm = () => {
    setOrderCode(generateNewOrderCode());
    setPlanDate(new Date().toISOString().split('T')[0]);
    setShippingDate(new Date().toISOString().split('T')[0]);
    if (customerPrices.length > 0) {
      setRouteCode(customerPrices[0].routeCode);
      setProvince(customerPrices[0].province);
      setDistrict(customerPrices[0].district);
      setVehicleType(customerPrices[0].vehicleType);
      setPricingModel(customerPrices[0].pricingModel);
    }
    setCustomerName('Tập Đoàn Bán Lẻ WinCommerce');
    const firstVen = vendors[0] || { name: 'Đội Xe Vận Tải Sài Gòn Logistics', vehicles: [], drivers: [] };
    setVendorName(firstVen.name);
    setLicensePlate(firstVen.vehicles[0]?.licensePlate || '51D-892.45');
    setDriverName(firstVen.drivers[0]?.fullName || 'Nguyễn Văn Tuấn');
    setDriverPhone(firstVen.drivers[0]?.phoneNumber || '0918.452.190');
    setDeliveryAddress('Kho tổng -> Chuỗi 6 điểm siêu thị nội thành');
    setPhoneNumber('0903889124');
    setQuantity(15);
    setDropPoints(6); // Đi 6 điểm tính rớt 5 điểm
    setCustomerOtherFees(0);
    setVendorOtherFees(0);
    setPenaltyType('none');
    setPenaltyValue(0);
    setPenaltyReason('');
    setStatus('pending');
    setNotes('');
    setEditingOrder(null);
  };

  const handleOpenEdit = (order: OperationOrder) => {
    setEditingOrder(order);
    setOrderCode(order.orderCode);
    setPlanDate(order.planDate);
    setShippingDate(order.shippingDate);
    setRouteCode(order.routeCode);
    setProvince(order.province);
    setDistrict(order.district);
    setCustomerName(order.customerName);
    setVendorName(order.vendorName);
    setLicensePlate(order.licensePlate || '');
    setDriverName(order.driverName || '');
    setDriverPhone(order.driverPhone || '');
    setDeliveryAddress(order.deliveryAddress);
    setPhoneNumber(order.phoneNumber);
    setVehicleType(order.vehicleType);
    setPricingModel(order.pricingModel);
    setQuantity(order.quantity);
    setDropPoints(order.dropPoints);
    setCustomerOtherFees(order.customerOtherFees || 0);
    setVendorOtherFees(order.vendorExtraFees ? order.vendorExtraFees - (order.vendorDropFee || order.dropFeeApplied || 0) : 0);
    setPenaltyType(order.penaltyType || 'none');
    setPenaltyValue(order.penaltyValue || 0);
    setPenaltyReason(order.penaltyReason || '');
    setStatus(order.status);
    setNotes(order.notes || '');
    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (editingOrder) {
      updateOrder(editingOrder.id, {
        orderCode,
        planDate,
        shippingDate,
        routeCode,
        province,
        district,
        customerName,
        vendorName,
        licensePlate,
        driverName,
        driverPhone,
        deliveryAddress,
        phoneNumber,
        vehicleType,
        pricingModel,
        quantity,
        dropPoints,
        dropFeeApplied: calculatedFinancials.customerDropFee,
        customerDropRate: calculatedFinancials.customerDropRate,
        customerDropFee: calculatedFinancials.customerDropFee,
        customerUnitPrice: calculatedFinancials.customerUnitPrice,
        customerFreight: calculatedFinancials.customerFreight,
        customerOtherFees,
        customerTotalAmount: calculatedFinancials.customerTotalAmount,
        vendorUnitPrice: calculatedFinancials.vendorUnitPrice,
        vendorFreight: calculatedFinancials.vendorFreight,
        vendorDropRate: calculatedFinancials.vendorDropRate,
        vendorDropFee: calculatedFinancials.vendorDropFee,
        vendorExtraFees: vendorOtherFees + calculatedFinancials.vendorDropFee,
        penaltyType,
        penaltyValue,
        penaltyReason,
        penaltyAmount: calculatedFinancials.penaltyAmount,
        vendorTotalCost: calculatedFinancials.vendorTotalCost,
        grossProfit: calculatedFinancials.grossProfit,
        profitMarginPercent: calculatedFinancials.profitMarginPercent,
        status,
        notes,
      });
    } else {
      addOrder({
        orderCode,
        planDate,
        shippingDate,
        routeCode,
        province,
        district,
        customerName,
        vendorName,
        licensePlate,
        driverName,
        driverPhone,
        deliveryAddress,
        phoneNumber,
        vehicleType,
        pricingModel,
        quantity,
        dropPoints,
        dropFeeApplied: calculatedFinancials.customerDropFee,
        customerDropRate: calculatedFinancials.customerDropRate,
        customerDropFee: calculatedFinancials.customerDropFee,
        customerUnitPrice: calculatedFinancials.customerUnitPrice,
        customerFreight: calculatedFinancials.customerFreight,
        customerOtherFees,
        customerTotalAmount: calculatedFinancials.customerTotalAmount,
        vendorUnitPrice: calculatedFinancials.vendorUnitPrice,
        vendorFreight: calculatedFinancials.vendorFreight,
        vendorDropRate: calculatedFinancials.vendorDropRate,
        vendorDropFee: calculatedFinancials.vendorDropFee,
        vendorExtraFees: vendorOtherFees + calculatedFinancials.vendorDropFee,
        penaltyType,
        penaltyValue,
        penaltyReason,
        penaltyAmount: calculatedFinancials.penaltyAmount,
        vendorTotalCost: calculatedFinancials.vendorTotalCost,
        grossProfit: calculatedFinancials.grossProfit,
        profitMarginPercent: calculatedFinancials.profitMarginPercent,
        status,
        notes,
      });
    }

    setShowModal(false);
    resetForm();
  };

  // Helper status badge
  const getStatusBadge = (st: OrderStatus) => {
    switch (st) {
      case 'completed':
        return { label: 'Đã hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'in_transit':
        return { label: 'Đang vận chuyển', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'pending':
        return { label: 'Chờ điều phối', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'delayed':
        return { label: 'Hoãn giao', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'cancelled':
        return { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: st, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (dateFilter && o.shippingDate !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = o.orderCode.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchVen = o.vendorName.toLowerCase().includes(q);
      const matchRoute = o.routeCode.toLowerCase().includes(q);
      const matchAddr = o.deliveryAddress.toLowerCase().includes(q);
      const matchPlate = (o.licensePlate || '').toLowerCase().includes(q);
      const matchDriver = (o.driverName || '').toLowerCase().includes(q);
      const matchDriverPhone = (o.driverPhone || '').toLowerCase().includes(q);
      if (!matchCode && !matchCust && !matchVen && !matchRoute && !matchAddr && !matchPlate && !matchDriver && !matchDriverPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Dữ Liệu Vận Hành Hàng Ngày
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {orders.length} lệnh điều vận
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật mã lệnh, ngày kế hoạch/vận chuyển, biển số xe, tài xế, phạt thỏa thuận và tính phụ phí rớt điểm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportOrdersToExcel(orders)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel Đơn Hàng</span>
          </button>

          {canEdit ? (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nhập Đơn Vận Hành Mới</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic px-2 py-1 bg-slate-100 rounded">
              (Chỉ xem - Không có quyền thêm)
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ điều phối</option>
            <option value="in_transit">Đang vận chuyển</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="delayed">Hoãn giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Date filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Ngày vận chuyển:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                Xóa lọc ngày
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm mã lệnh, khách, xe, tài xế, tuyến..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-60 sm:w-80 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Mã Lệnh</th>
                <th className="py-3 px-3">Kế hoạch / Vận chuyển</th>
                <th className="py-3 px-3">Mã Tuyến & Khu Vực</th>
                <th className="py-3 px-3">Khách Hàng & Địa Chỉ</th>
                <th className="py-3 px-3">Vendor / Biển Xe / Tài Xế</th>
                <th className="py-3 px-3 text-center">Xe & Sản Lượng</th>
                <th className="py-3 px-3 text-center">Điểm Giao & Rớt</th>
                <th className="py-3 px-3 text-right">Doanh Thu Khách</th>
                <th className="py-3 px-3 text-right">Chi Phí Vendor & Phạt</th>
                <th className="py-3 px-3 text-right">Lợi Nhuận Gộp</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 text-xs">
                    Không có đơn vận hành nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const st = getStatusBadge(o.status);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      {/* Mã lệnh */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">{o.orderCode}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {o.phoneNumber || 'Không có SĐT'}
                        </div>
                      </td>

                      {/* Ngày kế hoạch & ngày vận chuyển */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="text-slate-800">VC: {o.shippingDate}</div>
                        <div className="text-[10px] text-slate-400">KH: {o.planDate}</div>
                      </td>

                      {/* Mã tuyến */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] inline-block border border-blue-200">
                          {o.routeCode}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                          {o.district}, {o.province}
                        </div>
                      </td>

                      {/* Khách hàng & địa chỉ */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[160px]">
                          {o.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {o.deliveryAddress}
                        </div>
                      </td>

                      {/* Vendor, Biển số xe & Tài xế */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                          {o.vendorName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300">
                            {o.licensePlate || 'Chưa gán xe'}
                          </span>
                        </div>
                        {(o.driverName || o.driverPhone) && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                            TX: <span className="text-slate-700 font-medium">{o.driverName}</span> {o.driverPhone ? `(${o.driverPhone})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Xe & Số lượng */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {o.vehicleType}
                        </span>
                        <div className="font-mono font-semibold text-slate-600 text-[11px] mt-0.5">
                          {o.quantity}{' '}
                          {o.pricingModel === 'volume'
                            ? 'm³'
                            : o.pricingModel === 'trip'
                            ? 'chuyến'
                            : 'tấn'}
                        </div>
                      </td>

                      {/* Số điểm giao & Phí rớt điểm */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-slate-800">
                          {o.dropPoints} điểm
                        </div>
                        <div className="text-[10px] text-amber-700 font-mono font-medium">
                          Rớt {Math.max(0, o.dropPoints - 1)} điểm
                        </div>
                        {canViewPrices ? (
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            KH: {formatVND(o.customerDropFee || o.dropFeeApplied || 0)} | NCC: {formatVND(o.vendorDropFee || 0)}
                          </div>
                        ) : (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">***đ</div>
                        )}
                      </td>

                      {/* Doanh thu khách hàng */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {canViewPrices ? (
                          formatVND(o.customerTotalAmount)
                        ) : (
                          <span className="text-slate-400 font-normal">***.***đ</span>
                        )}
                      </td>

                      {/* Chi phí Vendor (thực tế & phạt thỏa thuận) */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {canViewPrices ? (
                          <>
                            <div className="font-bold text-slate-900">
                              {formatVND(o.vendorTotalCost)}
                            </div>
                            {o.penaltyAmount > 0 ? (
                              <div 
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 mt-0.5"
                                title={`Phạt thỏa thuận: ${o.penaltyReason || 'Khấu trừ vi phạm'}`}
                              >
                                <span>- {formatVND(o.penaltyAmount)}</span>
                                <span className="text-[9px] font-normal">
                                  ({o.penaltyType === 'percentage' ? `${o.penaltyValue}% cước` : 'khoán'})
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">
                                Cước: {formatVND(o.vendorFreight)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal">***.***đ</span>
                        )}
                      </td>

                      {/* Lợi nhuận gộp */}
                      <td className="py-3 px-3 text-right">
                        {canViewPrices ? (
                          <>
                            <div className="font-mono font-bold text-emerald-600 tabular-nums">
                              {formatVND(o.grossProfit)}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-semibold">
                              +{o.profitMarginPercent}%
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">***đ</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit ? (
                            <button
                              onClick={() => handleOpenEdit(o)}
                              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Sửa đơn vận hành"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">Khóa</span>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa lệnh vận chuyển ${o.orderCode}? (Chỉ Quản trị viên)`)) {
                                  deleteOrder(o.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Xóa đơn (Chỉ Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nhập / Chỉnh sửa đơn vận hành */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingOrder ? 'Chỉnh Sửa Lệnh Vận Hành' : 'Tạo Mới Lệnh Vận Hành & Tính Cước Tự Động'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Row 1: Mã lệnh & Ngày kế hoạch, ngày vận chuyển */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mã lệnh:</label>
                  <input
                    type="text"
                    required
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-800 bg-slate-50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ngày kế hoạch:</label>
                  <input
                    type="date"
                    required
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-blue-800">
                    Ngày vận chuyển (*):
                  </label>
                  <input
                    type="date"
                    required
                    value={shippingDate}
                    onChange={(e) => setShippingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-400 bg-blue-50/30 rounded-lg font-mono font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Khách hàng, Địa chỉ giao & SĐT người nhận */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Thông Tin Khách Hàng & Nơi Giao</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Khách hàng:</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tên khách hàng..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Địa chỉ giao hàng:</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Kho / Cửa hàng nhận..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SĐT người nhận:</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="090..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Mã tuyến & Loại xe & Hình thức tính & Sản lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mã tuyến:</label>
                  <select
                    value={routeCode}
                    onChange={(e) => {
                      const selected = customerPrices.find((p) => p.routeCode === e.target.value);
                      setRouteCode(e.target.value);
                      if (selected) {
                        setProvince(selected.province);
                        setDistrict(selected.district);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:outline-hidden"
                  >
                    {Array.from(new Set(customerPrices.map((p) => p.routeCode))).map((code) => {
                      const item = customerPrices.find((p) => p.routeCode === code);
                      return (
                        <option key={code} value={code}>
                          {code} - {item?.district}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Loại xe:</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                  >
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v} value={v}>
                        Xe {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hình thức tính:</label>
                  <select
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="volume">Số khối (m³)</option>
                    <option value="trip">Chuyến</option>
                    <option value="ton">Giá tấn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Sản lượng ({pricingModel === 'volume' ? 'm³' : pricingModel === 'trip' ? 'chuyến' : 'tấn'}):
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Điểm giao hàng & Phụ phí rớt điểm tự động độc lập KH & Vendor */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Quy Tắc Rớt Điểm (Khách hàng & Vendor có đơn giá độc lập)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Điều kiện cùng 1 mã lệnh / ngày: Đi {dropPoints} điểm &rarr; tính rớt{' '}
                    <strong>{Math.max(0, dropPoints - 1)} điểm</strong>:
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px]">
                    <span className="text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 font-medium">
                      Thu KH: {formatVND(calculatedFinancials.customerDropRate)}/đ &rarr;{' '}
                      <strong>{formatVND(calculatedFinancials.customerDropFee)}</strong>
                    </span>
                    <span className="text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">
                      Trả NCC: {formatVND(calculatedFinancials.vendorDropRate)}/đ &rarr;{' '}
                      <strong>{formatVND(calculatedFinancials.vendorDropFee)}</strong>
                    </span>
                  </div>
                </div>
                <div className="w-32">
                  <label className="block text-[11px] text-amber-900 font-semibold mb-1">Số điểm giao:</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={dropPoints}
                    onChange={(e) => setDropPoints(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-amber-300 rounded-lg font-mono font-bold bg-white text-slate-900 focus:outline-hidden text-center"
                  />
                </div>
              </div>

              {/* Row 4: THÔNG TIN VENDOR, BIỂN SỐ XE, TÀI XẾ & SĐT (Liên kết hồ sơ Vendor) */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Thông Tin Vendor (Nhà Cung Cấp) & Phương Tiện Điều Phối</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold">Tự động gợi ý xe & tài xế theo NCC</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-700 font-semibold mb-1">Tên Vendor (NCC):</label>
                    <select
                      value={vendorName}
                      onChange={(e) => handleVendorSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:outline-hidden"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Biển số xe:
                    </label>
                    {(() => {
                      const curVen = vendors.find((v) => v.name === vendorName);
                      if (curVen && curVen.vehicles.length > 0) {
                        return (
                          <select
                            value={licensePlate}
                            onChange={(e) => {
                              setLicensePlate(e.target.value);
                              const matchedV = curVen.vehicles.find((v) => v.licensePlate === e.target.value);
                              if (matchedV) setVehicleType(matchedV.vehicleType);
                            }}
                            className="w-full px-3 py-2 border border-amber-300 bg-amber-50/40 rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden"
                          >
                            {curVen.vehicles.map((vh) => (
                              <option key={vh.id} value={vh.licensePlate}>
                                {vh.licensePlate} ({vh.vehicleType})
                              </option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <input
                          type="text"
                          required
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                          placeholder="VD: 51D-892.45"
                          className="w-full px-3 py-2 border border-amber-300 bg-amber-50/40 rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden"
                        />
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tên tài xế:</label>
                    {(() => {
                      const curVen = vendors.find((v) => v.name === vendorName);
                      if (curVen && curVen.drivers.length > 0) {
                        return (
                          <select
                            value={driverName}
                            onChange={(e) => {
                              setDriverName(e.target.value);
                              const matchedD = curVen.drivers.find((d) => d.fullName === e.target.value);
                              if (matchedD) setDriverPhone(matchedD.phoneNumber);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-hidden"
                          >
                            {curVen.drivers.map((dr) => (
                              <option key={dr.id} value={dr.fullName}>
                                {dr.fullName}
                              </option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          placeholder="Họ tên lái xe..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                        />
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SĐT tài xế:</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="0918..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: PHẠT DỰA THEO THỎA THUẬN (TRỪ VÀO CƯỚC NCC) */}
              <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Phạt Dựa Theo Thỏa Thuận Với Vendor (Trừ Trực Tiếp Vào Chi Phí Thực Tế)</span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-medium">Khấu trừ cước thanh toán cho NCC</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Hình thức phạt:</label>
                    <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPenaltyType('none');
                          setPenaltyValue(0);
                        }}
                        className={`py-1 text-[10px] font-semibold rounded cursor-pointer transition-colors ${
                          penaltyType === 'none'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Không phạt
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPenaltyType('percentage');
                          if (penaltyValue === 0) setPenaltyValue(10); // mặc định 10%
                        }}
                        className={`py-1 text-[10px] font-semibold rounded cursor-pointer transition-colors ${
                          penaltyType === 'percentage'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        % Giá cước
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPenaltyType('fixed');
                          if (penaltyValue === 0) setPenaltyValue(100000); // mặc định 100k khoán
                        }}
                        className={`py-1 text-[10px] font-semibold rounded cursor-pointer transition-colors ${
                          penaltyType === 'fixed'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Mức khoán
                      </button>
                    </div>
                  </div>

                  {penaltyType !== 'none' ? (
                    <div>
                      <label className="block text-rose-800 font-bold mb-1">
                        {penaltyType === 'percentage' ? 'Tỷ lệ phạt (% trên giá cước):' : 'Mức khoán phạt thỏa thuận (VNĐ):'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step={penaltyType === 'percentage' ? 0.5 : 10000}
                          value={penaltyValue}
                          onChange={(e) => setPenaltyValue(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-rose-300 rounded-lg bg-white font-mono font-bold text-rose-700 focus:outline-hidden"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-rose-600">
                          {penaltyType === 'percentage' ? '%' : 'VNĐ'}
                        </span>
                      </div>
                      <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                        Số tiền khấu trừ: -{formatVND(calculatedFinancials.penaltyAmount)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic pt-4">
                      Đơn hàng không áp dụng điều khoản phạt vendor
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lý do phạt thỏa thuận:</label>
                    <input
                      type="text"
                      disabled={penaltyType === 'none'}
                      value={penaltyReason}
                      onChange={(e) => setPenaltyReason(e.target.value)}
                      placeholder={penaltyType === 'none' ? 'Không áp dụng phạt' : 'VD: Trễ giờ giao hàng 3h, vi phạm seal...'}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Trạng thái & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trạng thái vận chuyển:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                  >
                    <option value="pending">Chờ điều phối</option>
                    <option value="in_transit">Đang vận chuyển</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="delayed">Hoãn giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ghi chú đơn:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú về thời gian giao, người nhận..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              {/* LIVE FINANCIAL SUMMARY BOX (Tự động tính theo quy định) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Bảng Tự Động Tra Cứu Giá & Tính P&L (Theo ngày vận chuyển &le; {shippingDate})
                  </span>
                  <span className="text-[10px] text-slate-500">Tự động áp dụng bảng giá gần nhất</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Doanh thu khách hàng */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[11px] text-slate-500">Doanh Thu Khách Hàng</div>
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {formatVND(calculatedFinancials.customerTotalAmount)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Cước: {formatVND(calculatedFinancials.customerFreight)} + Rớt điểm: {formatVND(calculatedFinancials.dropFeeApplied)}
                    </div>
                  </div>

                  {/* Chi phí Vendor (thực tế trả vendor) */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[11px] text-slate-500">Chi Phí Vendor (Thực Tế Chi Trả)</div>
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {formatVND(calculatedFinancials.vendorTotalCost)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 space-y-0.5 font-mono">
                      <div>Cước gốc: {formatVND(calculatedFinancials.vendorFreight)} + Rớt: {formatVND(calculatedFinancials.dropFeeApplied)}</div>
                      {calculatedFinancials.penaltyAmount > 0 && (
                        <div className="text-rose-600 font-semibold">
                          Khấu trừ phạt: -{formatVND(calculatedFinancials.penaltyAmount)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lợi nhuận gộp */}
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[11px] text-emerald-800 font-semibold">Lợi Nhuận Gộp Đơn (Gross Profit)</div>
                    <div className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                      {formatVND(calculatedFinancials.grossProfit)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                      Margin: +{calculatedFinancials.profitMarginPercent}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingOrder ? 'Lưu Thay Đổi Đơn' : 'Tạo Lệnh Vận Hành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
