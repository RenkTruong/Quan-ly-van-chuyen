import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { RoutePriceItem, PriceTarget, PricingModel, VehicleType, VEHICLE_TYPES, SurchargeConfig } from '../types';
import { VIETNAM_GEO, getOrGenerateRouteCode, getProvinceAbbr, getDistrictAbbr } from '../data/vietnamGeo';
import { formatVND } from '../utils/pricingEngine';
import { downloadPriceTemplate, parsePriceExcel, exportPriceItemsToExcel } from '../utils/excelHelper';
import {
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X,
  FileUp,
  Tag,
  Truck,
  Sparkles,
  Lock,
  EyeOff,
  Building2,
} from 'lucide-react';

interface Props {
  target: PriceTarget;
}

export const PriceMatrixView: React.FC<Props> = ({ target }) => {
  const {
    customerPrices,
    vendorPrices,
    addPriceItem,
    updatePriceItem,
    deletePriceItem,
    importPriceItems,
    canEdit,
    canDelete,
    currentUser,
    surcharges,
    canViewPrices,
    canExportPriceExcel,
    vendors,
  } = useApp();

  const fileInputId = useId();

  const isCustomer = target === 'customer';
  const priceList = isCustomer ? customerPrices : vendorPrices;
  const pageTitle = isCustomer ? 'Bảng Giá Cho Khách Hàng' : 'Bảng Giá Cho Vendor (Nhà Xe)';
  const subtitle = isCustomer
    ? 'Cấu hình đơn giá bán theo Số khối, Chuyến, Tấn cho từng khách hàng hoặc áp dụng chung'
    : 'Cấu hình đơn giá theo từng Dự án / Khách hàng và chi phí theo tuyến cho các đối tác vận tải';

  // Filters
  const [modelFilter, setModelFilter] = useState<'all' | PricingModel>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutePriceItem | null>(null);

  // Form State for Add / Edit
  const [formTargetName, setFormTargetName] = useState(
    isCustomer ? 'Tập Đoàn Bán Lẻ WinCommerce' : 'Đội Xe Vận Tải Sài Gòn Logistics'
  );
  // Vendor specific: Dự án / Khách hàng áp dụng
  const [formAppliedCustomerName, setFormAppliedCustomerName] = useState(
    isCustomer ? '' : 'Tập Đoàn Bán Lẻ WinCommerce'
  );
  const [formDropPointRate, setFormDropPointRate] = useState<number>(isCustomer ? 100000 : 80000);
  const [formModel, setFormModel] = useState<PricingModel>('volume');
  const [formProvince, setFormProvince] = useState(VIETNAM_GEO[0].name);
  const [formDistrict, setFormDistrict] = useState(VIETNAM_GEO[0].districts[0].name);
  const [formRouteCode, setFormRouteCode] = useState(() =>
    getOrGenerateRouteCode(VIETNAM_GEO[0].districts[0].name, VIETNAM_GEO[0].name, priceList)
  );
  const [formVehicle, setFormVehicle] = useState<VehicleType>('2T');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(isCustomer ? 160000 : 125000);
  const [formEffectiveDate, setFormEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formExpirationDate, setFormExpirationDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSelectedSurcharges, setFormSelectedSurcharges] = useState<SurchargeConfig[]>(surcharges);

  // Handler khi thay đổi Tỉnh/Thành
  const handleProvinceChange = (newProv: string) => {
    setFormProvince(newProv);
    const provObj = VIETNAM_GEO.find((p) => p.name === newProv);
    const firstDist = provObj ? provObj.districts[0].name : '';
    setFormDistrict(firstDist);
    setFormRouteCode(getOrGenerateRouteCode(firstDist, newProv, priceList));
  };

  // Handler khi thay đổi Quận/Huyện
  const handleDistrictChange = (newDist: string) => {
    setFormDistrict(newDist);
    setFormRouteCode(getOrGenerateRouteCode(newDist, formProvince, priceList));
  };

  // Reset form
  const resetForm = () => {
    setFormTargetName(isCustomer ? 'Áp dụng chung' : (vendors[0]?.name || 'Đội Xe Vận Tải Sài Gòn Logistics'));
    setFormAppliedCustomerName(isCustomer ? '' : 'Áp dụng chung mọi dự án');
    setFormDropPointRate(isCustomer ? 100000 : 80000);
    setFormModel('volume');
    setFormProvince(VIETNAM_GEO[0].name);
    setFormDistrict(VIETNAM_GEO[0].districts[0].name);
    setFormRouteCode(
      getOrGenerateRouteCode(VIETNAM_GEO[0].districts[0].name, VIETNAM_GEO[0].name, priceList)
    );
    setFormVehicle('2T');
    setFormUnitPrice(isCustomer ? 160000 : 125000);
    setFormEffectiveDate(new Date().toISOString().split('T')[0]);
    setFormExpirationDate('');
    setFormNotes('');
    setEditingItem(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: RoutePriceItem) => {
    setEditingItem(item);
    setFormTargetName(item.targetName);
    setFormAppliedCustomerName(item.appliedCustomerName || '');
    setFormDropPointRate(item.dropPointRate !== undefined ? item.dropPointRate : (isCustomer ? 100000 : 80000));
    setFormModel(item.pricingModel);
    setFormProvince(item.province);
    setFormDistrict(item.district);
    setFormRouteCode(item.routeCode);
    setFormVehicle(item.vehicleType);
    setFormUnitPrice(item.unitPrice);
    setFormEffectiveDate(item.effectiveDate);
    setFormExpirationDate(item.expirationDate || '');
    setFormNotes(item.notes || '');
    setShowAddModal(true);
  };

  // Submit Add or Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (editingItem) {
      updatePriceItem(target, editingItem.id, {
        targetName: formTargetName,
        appliedCustomerName: !isCustomer && formAppliedCustomerName ? formAppliedCustomerName : undefined,
        dropPointRate: formDropPointRate,
        pricingModel: formModel,
        province: formProvince,
        district: formDistrict,
        routeCode: formRouteCode,
        vehicleType: formVehicle,
        unitPrice: formUnitPrice,
        effectiveDate: formEffectiveDate,
        expirationDate: formExpirationDate || undefined,
        notes: formNotes,
      });
    } else {
      addPriceItem(target, {
        target,
        targetName: formTargetName,
        appliedCustomerName: !isCustomer && formAppliedCustomerName ? formAppliedCustomerName : undefined,
        dropPointRate: formDropPointRate,
        pricingModel: formModel,
        province: formProvince,
        district: formDistrict,
        routeCode: formRouteCode,
        vehicleType: formVehicle,
        unitPrice: formUnitPrice,
        effectiveDate: formEffectiveDate,
        expirationDate: formExpirationDate || undefined,
        surcharges: formSelectedSurcharges,
        notes: formNotes,
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  // File Upload Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await parsePriceExcel(file, target, currentUser.fullName, priceList);
    if (result.success) {
      importPriceItems(target, result.data);
      alert(`Đã nhập thành công ${result.data.length} bảng giá từ file Excel!`);
    } else {
      alert(`Lỗi: ${result.errors.join('\n')}`);
    }
    e.target.value = '';
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    if (!canExportPriceExcel) {
      alert('Tài khoản của bạn chưa được cấp quyền "Xuất Excel Bảng Giá" vì lý do bảo mật thương mại.');
      return;
    }
    exportPriceItemsToExcel(priceList, target);
  };

  // State: Tab view (master list vs detail view)
  const [selectedBatchKey, setSelectedBatchKey] = useState<string | null>(null);
  const [shippingDateTest, setShippingDateTest] = useState(new Date().toISOString().split('T')[0]);

  // Group priceList into update packages/batches by (targetName + effectiveDate + updatedBy)
  // or show each distinct update batch with summary
  const priceBatches = React.useMemo(() => {
    const map = new Map<string, {
      key: string;
      targetName: string;
      appliedCustomerName?: string;
      effectiveDate: string;
      expirationDate?: string;
      updatedBy: string;
      updatedAt: string;
      itemCount: number;
      pricingModels: Set<PricingModel>;
      vehicleTypes: Set<VehicleType>;
      provinces: Set<string>;
      items: RoutePriceItem[];
    }>();

    priceList.forEach((item) => {
      // Key can group by targetName + effectiveDate + updatedBy
      const batchKey = `${item.targetName}__${item.effectiveDate}__${item.appliedCustomerName || 'all'}`;
      if (!map.has(batchKey)) {
        map.set(batchKey, {
          key: batchKey,
          targetName: item.targetName,
          appliedCustomerName: item.appliedCustomerName,
          effectiveDate: item.effectiveDate,
          expirationDate: item.expirationDate,
          updatedBy: item.updatedBy,
          updatedAt: item.updatedAt,
          itemCount: 0,
          pricingModels: new Set(),
          vehicleTypes: new Set(),
          provinces: new Set(),
          items: [],
        });
      }
      const b = map.get(batchKey)!;
      b.itemCount += 1;
      b.pricingModels.add(item.pricingModel);
      b.vehicleTypes.add(item.vehicleType);
      b.provinces.add(item.province);
      b.items.push(item);
      // update latest update timestamp if needed
      if (item.updatedAt > b.updatedAt) {
        b.updatedAt = item.updatedAt;
        b.updatedBy = item.updatedBy;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
  }, [priceList]);

  // Selected batch items
  const activeBatch = selectedBatchKey ? priceBatches.find((b) => b.key === selectedBatchKey) : null;
  const activeItems = activeBatch ? activeBatch.items : [];

  // Filtered List inside active batch or overall
  const displayItems = (activeBatch ? activeItems : priceList).filter((item) => {
    if (modelFilter !== 'all' && item.pricingModel !== modelFilter) return false;
    if (vehicleFilter !== 'all' && item.vehicleType !== vehicleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRoute = item.routeCode.toLowerCase().includes(q);
      const matchTarget = item.targetName.toLowerCase().includes(q);
      const matchCust = (item.appliedCustomerName || '').toLowerCase().includes(q);
      const matchDistrict = item.district.toLowerCase().includes(q);
      const matchProvince = item.province.toLowerCase().includes(q);
      if (!matchRoute && !matchTarget && !matchCust && !matchDistrict && !matchProvince) return false;
    }
    return true;
  });

  // Calculate matching items based on date test: Ngày vận chuyển <= Ngày áp dụng
  const eligibleTestItems = React.useMemo(() => {
    if (!shippingDateTest) return [];
    return priceList.filter((item) => {
      // Điều kiện của người dùng: Ngày vận chuyển <= Ngày áp dụng
      return shippingDateTest <= item.effectiveDate;
    });
  }, [priceList, shippingDateTest]);

  return (
    <div className="space-y-5">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold border ${
                isCustomer
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {priceBatches.length} danh sách bảng giá ({priceList.length} tuyến)
            </span>
            {!canViewPrices && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                <EyeOff className="w-3 h-3" /> Chế độ ẩn giá (Bảo mật)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={() => downloadPriceTemplate(target)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Tải file Excel mẫu đúng quy định"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Tải Mẫu Excel</span>
          </button>

          {/* Import Excel */}
          {canEdit && (
            <label
              htmlFor={fileInputId}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel</span>
              <input
                id={fileInputId}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Export Current List */}
          {canExportPriceExcel ? (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Xuất bảng giá ra file Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              title="Bạn không có quyền bảo mật để xuất bảng giá"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Xuất Excel (Khóa)</span>
            </span>
          )}

          {/* Add New Button */}
          {canEdit ? (
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Bảng Giá Mới</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic px-2 py-1 bg-slate-100 rounded">
              (Chỉ xem - Không có quyền thêm)
            </span>
          )}
        </div>
      </div>

      {/* Quy tắc tính theo ngày vận chuyển & Ngày áp dụng */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-xl p-3.5 text-xs space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-blue-950">
                Quy tắc tính giá theo ngày áp dụng & TH update bổ sung data:
              </span>
              <p className="text-blue-900 mt-0.5 leading-relaxed">
                • <strong>Nguyên tắc áp giá:</strong> Trường hợp update bổ sung data thì tính theo ngày vận chuyển để đối soát bảng giá (<strong>Ngày vận chuyển &le; Ngày áp dụng</strong>).
                <br />
                • <strong>Minh bạch dữ liệu:</strong> Mỗi lần update bảng giá đều lưu vết chính xác tài khoản chỉnh sửa và mốc thời gian cập nhật.
              </p>
            </div>
          </div>

          {/* Tra cứu nhanh theo ngày vận chuyển */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 shrink-0 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">Tra cứu ngày VC:</span>
            <input
              type="date"
              value={shippingDateTest}
              onChange={(e) => setShippingDateTest(e.target.value)}
              className="text-xs font-mono font-semibold text-blue-900 px-2 py-1 border border-slate-200 rounded focus:outline-hidden"
            />
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              {eligibleTestItems.length} tuyến hợp lệ
            </span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BẢNG GIÁ UPDATE (Master Catalog List) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Danh Sách Bảng Giá Đã Update Trong Hệ Thống
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {priceBatches.length} danh sách
            </span>
          </div>
          <span className="text-[11px] text-slate-500 italic">
            * Bấm vào từng danh sách dưới đây để mở xem bảng giá đầy đủ chi tiết
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {priceBatches.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có danh sách bảng giá nào được tạo. Hãy bấm "+ Thêm Bảng Giá Mới" hoặc "Import Excel".
            </div>
          ) : (
            priceBatches.map((batch, idx) => {
              const isSelected = selectedBatchKey === batch.key;
              const hasMatchingDate = shippingDateTest ? shippingDateTest <= batch.effectiveDate : true;

              return (
                <div
                  key={batch.key}
                  onClick={() => {
                    setSelectedBatchKey(isSelected ? null : batch.key);
                  }}
                  className={`p-4 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600 shadow-inner'
                      : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {batch.targetName}
                      </span>
                      {!isCustomer && batch.appliedCustomerName && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          Dự án: {batch.appliedCustomerName}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Ngày áp dụng: {batch.effectiveDate}
                      </span>
                      {hasMatchingDate && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                          Khớp ngày VC &le; {batch.effectiveDate}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500">
                      <span>
                        Quy mô: <strong className="text-slate-800">{batch.itemCount} tuyến cước</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Tỉnh/Thành: <strong className="text-slate-800">{Array.from(batch.provinces).join(', ')}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Loại xe: <strong className="text-slate-800">{Array.from(batch.vehicleTypes).sort().join(', ')}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Hình thức: <strong className="text-slate-800">
                          {Array.from(batch.pricingModels).map((m) => m === 'volume' ? 'Số khối' : m === 'trip' ? 'Chuyến' : 'Tấn').join(', ')}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Tài khoản cập nhật: <strong className="text-slate-600">{batch.updatedBy}</strong></span>
                      <span>·</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Thời gian sửa: {new Date(batch.updatedAt).toLocaleString('vi-VN')}</span>
                      <span>·</span>
                      <span>Thời hạn: {batch.expirationDate ? `Đến ${batch.expirationDate}` : 'Vô thời hạn'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{isSelected ? 'Đang Xem Chi Tiết' : 'Bấm Xem Đầy Đủ Bảng Giá'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHI TIẾT ĐẦY ĐỦ BẢNG GIÁ (Chỉ hiển thị khi đã bấm chọn 1 danh sách, hoặc có thể chọn xem tất cả) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {activeBatch
                ? `Chi Tiết Bảng Giá: ${activeBatch.targetName} (Ngày áp dụng: ${activeBatch.effectiveDate})`
                : 'Bảng Giá Toàn Bộ Tuyến (Chọn một danh sách ở trên để lọc chi tiết)'}
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {displayItems.length} tuyến
            </span>
          </div>

          {activeBatch && (
            <button
              onClick={() => setSelectedBatchKey(null)}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer self-start sm:self-auto"
            >
              &larr; Quay lại xem toàn bộ danh sách
            </button>
          )}
        </div>

        {/* Filter and Search Bar for the table */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Control for 3 Pricing Models */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setModelFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                modelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả hình thức
            </button>
            <button
              onClick={() => setModelFilter('volume')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                modelFilter === 'volume'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Số khối (m³)
            </button>
            <button
              onClick={() => setModelFilter('trip')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                modelFilter === 'trip'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Chuyến (Trip)
            </button>
            <button
              onClick={() => setModelFilter('ton')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                modelFilter === 'ton'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Giá tấn (Ton)
            </button>
          </div>

          {/* Vehicle Type Filter & Search Input */}
          <div className="flex items-center gap-2">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả xe (5 loại)</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  Xe {v}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã tuyến, tỉnh, quận..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-48 sm:w-60 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Full Pricing Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5">Mã Tuyến (6 chữ + 6 số)</th>
                  <th className="py-3 px-3.5">Tỉnh / Thành & Quận / Huyện</th>
                  <th className="py-3 px-3.5">{isCustomer ? 'Khách Hàng' : 'Vendor & Dự Án'}</th>
                  <th className="py-3 px-3.5">Hình thức tính</th>
                  <th className="py-3 px-3.5">Loại xe</th>
                  <th className="py-3 px-3.5 text-right">Đơn giá chuẩn</th>
                  <th className="py-3 px-3.5 text-center">Phí rớt điểm</th>
                  <th className="py-3 px-3.5">Hiệu lực (Áp dụng / Hết hạn)</th>
                  <th className="py-3 px-3.5">Tài khoản & Thời gian sửa</th>
                  <th className="py-3 px-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy tuyến giá nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  displayItems.map((item) => {
                    const isMatchedWithTestDate = shippingDateTest ? shippingDateTest <= item.effectiveDate : false;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        {/* Mã Tuyến 6 chữ + 6 số */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono font-bold text-blue-700 bg-blue-50/70 px-2 py-0.5 rounded inline-block border border-blue-200">
                            {item.routeCode}
                          </div>
                        </td>

                        {/* Tỉnh / Huyện */}
                        <td className="py-3 px-3.5">
                          <div className="font-medium text-slate-900">{item.district}</div>
                          <div className="text-[11px] text-slate-500">{item.province}</div>
                        </td>

                        {/* Tên đối tượng & Dự án */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900 truncate max-w-[180px]">
                            {item.targetName}
                          </div>
                          {!isCustomer && (
                            <div className="text-[11px] text-indigo-700 font-medium truncate max-w-[180px] flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400">Dự án:</span>
                              <span>{item.appliedCustomerName || 'Chung mọi khách'}</span>
                            </div>
                          )}
                        </td>

                        {/* Hình thức */}
                        <td className="py-3 px-3.5">
                          <span className="font-medium text-slate-700">
                            {item.pricingModel === 'volume'
                              ? 'Số khối (m³)'
                              : item.pricingModel === 'trip'
                              ? 'Chuyến'
                              : 'Giá tấn'}
                          </span>
                        </td>

                        {/* Loại xe */}
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 font-bold text-slate-800 rounded text-[11px]">
                            {item.vehicleType}
                          </span>
                        </td>

                        {/* Đơn giá chuẩn (Bảo mật: Ẩn giá nếu không có quyền) */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {canViewPrices ? (
                            <>
                              {formatVND(item.unitPrice)}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                /{item.pricingModel === 'volume' ? 'm³' : item.pricingModel === 'trip' ? 'chuyến' : 'tấn'}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400 tracking-widest font-mono text-xs flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              ***.***đ
                            </span>
                          )}
                        </td>

                        {/* Phí rớt điểm */}
                        <td className="py-3 px-3.5 text-center font-mono">
                          {canViewPrices ? (
                            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              {formatVND(item.dropPointRate !== undefined ? item.dropPointRate : (isCustomer ? 100000 : 80000))}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">***đ/điểm</span>
                          )}
                        </td>

                        {/* Ngày áp dụng & thời hạn */}
                        <td className="py-3 px-3.5 font-mono text-[11px]">
                          <div className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span>Từ {item.effectiveDate}</span>
                            {isMatchedWithTestDate && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-sans">
                                Hợp lệ
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            {item.expirationDate ? `Đến ${item.expirationDate}` : 'Vô thời hạn'}
                          </div>
                        </td>

                        {/* Tài khoản update & Thời gian sửa (Tính minh bạch) */}
                        <td className="py-3 px-3.5">
                          <div className="text-slate-800 text-[11px] font-medium truncate max-w-[150px]">
                            {item.updatedBy}
                          </div>
                          <div className="text-slate-400 text-[10px] font-mono">
                            {new Date(item.updatedAt).toLocaleString('vi-VN')}
                          </div>
                        </td>

                        {/* Thao tác */}
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {canEdit ? (
                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Chỉnh sửa bảng giá"
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-300">Khóa sửa</span>
                            )}

                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Bạn có chắc chắn muốn xóa bảng giá tuyến ${item.routeCode} (${item.vehicleType})?`
                                    )
                                  ) {
                                    deletePriceItem(target, item.id);
                                  }
                                }}
                                title="Xóa bảng giá (Chỉ Quản trị viên)"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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
      </div>

      {/* Modal Add / Edit Price Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingItem ? 'Chỉnh Sửa Bảng Báo Giá' : `Tạo Mới Bảng Báo Giá (${isCustomer ? 'Khách Hàng' : 'Vendor'})`}
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Tên Khách hàng / Vendor */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {isCustomer ? 'Tên Khách Hàng (hoặc để "Áp dụng chung"):' : 'Tên Vendor / Nhà Xe Vận Tải:'}
                </label>
                {isCustomer ? (
                  <input
                    type="text"
                    required
                    value={formTargetName}
                    onChange={(e) => setFormTargetName(e.target.value)}
                    placeholder="Ví dụ: Tập Đoàn Bán Lẻ WinCommerce..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                ) : (
                  <div className="space-y-1">
                    <select
                      value={formTargetName}
                      onChange={(e) => setFormTargetName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name} ({v.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">Chọn từ danh mục Vendor đã tạo hoặc chọn áp dụng chung</p>
                  </div>
                )}
              </div>

              {/* Vendor Specific: Áp dụng cho Dự Án / Khách Hàng Nào? */}
              {!isCustomer && (
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
                  <label className="block text-indigo-900 font-bold mb-1">
                    Áp Dụng Cho Dự Án / Khách Hàng Cụ Thể (Yêu cầu nghiệp vụ):
                  </label>
                  <input
                    type="text"
                    value={formAppliedCustomerName}
                    onChange={(e) => setFormAppliedCustomerName(e.target.value)}
                    placeholder="VD: Tập Đoàn Bán Lẻ WinCommerce (hoặc để trống nếu áp dụng chung)"
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-indigo-700 mt-1">
                    * 1 vendor có thể có nhiều bảng báo giá để áp dụng cho từng khách hàng nhằm tính đúng doanh thu/chi phí.
                  </p>
                </div>
              )}

              {/* Hình thức tính & Loại xe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Hình thức tính giá:
                  </label>
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value as PricingModel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="volume">1. Số khối (m³)</option>
                    <option value="trip">2. Chuyến (Trip)</option>
                    <option value="ton">3. Giá tấn (Ton)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Loại xe (5 loại):
                  </label>
                  <select
                    value={formVehicle}
                    onChange={(e) => setFormVehicle(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v} value={v}>
                        Xe {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tỉnh / Thành & Quận / Huyện */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tỉnh / Thành phố:
                  </label>
                  <select
                    value={formProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {VIETNAM_GEO.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Quận / Huyện:
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {VIETNAM_GEO.find((p) => p.name === formProvince)?.districts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mã Tuyến Tự Sinh / Tái Sử Dụng: 6 chữ (3 Quận + 3 Tỉnh) + 6 số */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-800 font-bold">
                    Mã Tuyến (Hệ thống tự sinh / tái sử dụng mã đã có):
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Khóa nhập tay · Tự động chuẩn hóa
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  value={formRouteCode}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-800 bg-slate-100 tracking-widest text-sm focus:outline-hidden cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Công thức: 3 chữ viết tắt Quận ({getDistrictAbbr(formDistrict, formProvince)}) + 3 chữ viết tắt Tỉnh ({getProvinceAbbr(formProvince)}) + 6 số. Nếu tuyến đã tồn tại trong hệ thống thì tự động áp mã tuyến cũ.
                </p>
              </div>

              {/* Đơn giá chuẩn & Đơn giá rớt điểm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Đơn giá cước chính (VNĐ):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      required
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 tabular-nums focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-mono">VNĐ</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Đọc: {formatVND(formUnitPrice)} / {formModel === 'volume' ? 'm³' : formModel === 'trip' ? 'chuyến' : 'tấn'}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Đơn giá rớt điểm (VNĐ/điểm):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      required
                      value={formDropPointRate}
                      onChange={(e) => setFormDropPointRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-amber-300 bg-amber-50/30 rounded-lg font-mono font-bold text-amber-900 tabular-nums focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-mono">VNĐ</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Mặc định: {isCustomer ? '100.000đ (KH)' : '80.000đ (Vendor thay đổi độc lập)'}
                  </p>
                </div>
              </div>

              {/* Ngày áp dụng & Thời hạn */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ngày áp dụng bảng giá:
                  </label>
                  <input
                    type="date"
                    required
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Giá áp dụng cho các đơn có ngày vận chuyển &gt;= ngày này
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Thời hạn / Ngày hết hạn:
                  </label>
                  <input
                    type="date"
                    value={formExpirationDate}
                    onChange={(e) => setFormExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Để trống nếu bảng giá có hiệu lực vô thời hạn
                  </p>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú:</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú điều kiện xe, bốc xếp hoặc thỏa thuận..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Tạo Bảng Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
