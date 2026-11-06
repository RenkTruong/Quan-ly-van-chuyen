import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VendorProfile, VehicleInfo, DriverInfo, VehicleType, VEHICLE_TYPES } from '../types';
import { formatVND } from '../utils/pricingEngine';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  User,
  CreditCard,
} from 'lucide-react';

export const VendorManagementView: React.FC = () => {
  const {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    addVehicleToVendor,
    deleteVehicleFromVendor,
    addDriverToVendor,
    deleteDriverFromVendor,
    hasPermission,
    isAdmin,
  } = useApp();

  const canAdd = hasPermission('vendors', 'add');
  const canEdit = hasPermission('vendors', 'edit');
  const canDelete = isAdmin;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State: Create / Edit Vendor Profile
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorProfile | null>(null);

  // Form Fields: Vendor Profile
  const [vendorCode, setVendorCode] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [defaultDropRate, setDefaultDropRate] = useState<number>(100000);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Drawer / Detail modal for Vehicles & Drivers
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<VendorProfile | null>(null);
  const [detailTab, setDetailTab] = useState<'vehicles' | 'drivers'>('vehicles');

  // Form Fields: Add Vehicle to selected vendor
  const [newPlate, setNewPlate] = useState('');
  const [newVehType, setNewVehType] = useState<VehicleType>('2T');
  const [newPayload, setNewPayload] = useState('1.95 tấn');

  // Form Fields: Add Driver to selected vendor
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newLicenseNum, setNewLicenseNum] = useState('');
  const [newLicenseGrade, setNewLicenseGrade] = useState('C');

  // Reset Vendor Modal Form
  const resetVendorForm = () => {
    const nextCode = `VEND-${String(vendors.length + 1).padStart(3, '0')}`;
    setVendorCode(nextCode);
    setVendorName('');
    setTaxCode('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDefaultDropRate(100000);
    setNotes('');
    setStatus('active');
    setEditingVendor(null);
  };

  const handleOpenEdit = (vend: VendorProfile) => {
    setEditingVendor(vend);
    setVendorCode(vend.code);
    setVendorName(vend.name);
    setTaxCode(vend.taxCode || '');
    setContactPerson(vend.contactPerson);
    setPhone(vend.phone);
    setEmail(vend.email || '');
    setAddress(vend.address || '');
    setDefaultDropRate(vend.defaultDropRate || 100000);
    setNotes(vend.notes || '');
    setStatus(vend.status);
    setShowVendorModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      if (!canEdit) return;
      updateVendor(editingVendor.id, {
        code: vendorCode,
        name: vendorName,
        taxCode,
        contactPerson,
        phone,
        email,
        address,
        defaultDropRate,
        notes,
        status,
      });
    } else {
      if (!canAdd) return;
      addVendor({
        code: vendorCode,
        name: vendorName,
        taxCode,
        contactPerson,
        phone,
        email,
        address,
        defaultDropRate,
        vehicles: [],
        drivers: [],
        status,
        notes,
      });
    }
    setShowVendorModal(false);
    resetVendorForm();
  };

  // Add Vehicle Handler
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForDetail || !canEdit) return;
    if (!newPlate.trim()) return;

    addVehicleToVendor(selectedVendorForDetail.id, {
      licensePlate: newPlate.trim().toUpperCase(),
      vehicleType: newVehType,
      payloadCapacity: newPayload.trim(),
      status: 'active',
    });

    setNewPlate('');
    setNewPayload('1.95 tấn');

    // Update local selected state
    setSelectedVendorForDetail((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        vehicles: [
          {
            id: `veh-${Date.now()}`,
            licensePlate: newPlate.trim().toUpperCase(),
            vehicleType: newVehType,
            payloadCapacity: newPayload.trim(),
            status: 'active',
          },
          ...prev.vehicles,
        ],
      };
    });
  };

  // Add Driver Handler
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForDetail || !canEdit) return;
    if (!newDriverName.trim() || !newDriverPhone.trim()) return;

    addDriverToVendor(selectedVendorForDetail.id, {
      fullName: newDriverName.trim(),
      phoneNumber: newDriverPhone.trim(),
      licenseNumber: newLicenseNum.trim(),
      licenseGrade: newLicenseGrade,
      status: 'active',
    });

    setNewDriverName('');
    setNewDriverPhone('');
    setNewLicenseNum('');

    // Update local selected state
    setSelectedVendorForDetail((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        drivers: [
          {
            id: `drv-${Date.now()}`,
            fullName: newDriverName.trim(),
            phoneNumber: newDriverPhone.trim(),
            licenseNumber: newLicenseNum.trim(),
            licenseGrade: newLicenseGrade,
            status: 'active',
          },
          ...prev.drivers,
        ],
      };
    });
  };

  // Filtered Vendors
  const filteredVendors = vendors.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCode = v.code.toLowerCase().includes(q);
      const matchContact = v.contactPerson.toLowerCase().includes(q);
      const matchPhone = v.phone.includes(q);
      const matchVeh = v.vehicles.some((veh) => veh.licensePlate.toLowerCase().includes(q));
      const matchDrv = v.drivers.some((drv) => drv.fullName.toLowerCase().includes(q) || drv.phoneNumber.includes(q));
      if (!matchName && !matchCode && !matchContact && !matchPhone && !matchVeh && !matchDrv) return false;
    }
    return true;
  });

  const totalVehicles = vendors.reduce((acc, v) => acc + (v.vehicles?.length || 0), 0);
  const totalDrivers = vendors.reduce((acc, v) => acc + (v.drivers?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Quản Lý Vendor (Nhà Cung Cấp Vận Tải)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {vendors.length} nhà cung cấp
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách NCC, danh sách đội xe & danh sách tài xế để tự động gợi ý khi điều phối vận hành
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => {
              resetVendorForm();
              setShowVendorModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo Vendor Mới</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-[11px]">Tổng Nhà Xe (NCC)</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{vendors.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Đang hợp tác vận hành</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-[11px]">Đội Xe Đăng Ký</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{totalVehicles} xe</div>
            <div className="text-[10px] text-slate-400 mt-0.5">1.5T &bull; 2T &bull; 5T &bull; 8T &bull; 15T</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-[11px]">Tài Xế Phụ Trách</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">{totalDrivers} tài xế</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sẵn sàng điều phối</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-[11px]">Phụ Phí Rớt Điểm Vendor</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              80.000đ - 100.000đ
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Đơn giá riêng theo thỏa thuận</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm dừng</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên vendor, biển số xe, tài xế, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-64 sm:w-80 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Mã & Tên Vendor</th>
                <th className="py-3 px-3">Người Liên Hệ & SĐT</th>
                <th className="py-3 px-3">Địa Chỉ & MST</th>
                <th className="py-3 px-3 text-center">Đội Xe Đăng Ký</th>
                <th className="py-3 px-3 text-center">Danh Sách Tài Xế</th>
                <th className="py-3 px-3 text-right">Đơn Giá Rớt Điểm</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy nhà cung cấp nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    {/* Mã & Tên Vendor */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {v.code}
                        </span>
                        <div className="font-bold text-slate-900">{v.name}</div>
                      </div>
                      {v.notes && <div className="text-[10px] text-slate-400 mt-0.5">{v.notes}</div>}
                    </td>

                    {/* Người liên hệ & SĐT */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{v.contactPerson}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        <span>{v.phone}</span>
                      </div>
                    </td>

                    {/* Địa chỉ & MST */}
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-slate-700 truncate max-w-[180px]" title={v.address}>
                        {v.address || 'Chưa cập nhật địa chỉ'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        MST: {v.taxCode || 'N/A'}
                      </div>
                    </td>

                    {/* Đội xe đăng ký */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedVendorForDetail(v);
                          setDetailTab('vehicles');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                        title="Xem và quản lý danh sách xe"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{v.vehicles?.length || 0} xe</span>
                      </button>
                    </td>

                    {/* Danh sách tài xế */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedVendorForDetail(v);
                          setDetailTab('drivers');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        title="Xem và quản lý danh sách tài xế"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{v.drivers?.length || 0} tài xế</span>
                      </button>
                    </td>

                    {/* Đơn giá rớt điểm */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatVND(v.defaultDropRate || 100000)}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          v.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {v.status === 'active' ? 'Đang hợp tác' : 'Tạm dừng'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedVendorForDetail(v);
                            setDetailTab('vehicles');
                          }}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Quản lý Xe & Tài xế"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Sửa hồ sơ Vendor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa Vendor ${v.name}? (Chỉ Quản trị viên)`)) {
                                deleteVendor(v.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Xóa Vendor (Chỉ Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TẠO / SỬA HỒ SƠ VENDOR */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingVendor ? 'Chỉnh Sửa Hồ Sơ Vendor' : 'Tạo Hồ Sơ Vendor Mới'}
                </h2>
              </div>
              <button
                onClick={() => setShowVendorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mã NCC (*):</label>
                  <input
                    type="text"
                    required
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-800 bg-slate-50 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Tên Vendor (Tên NCC) (*):</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="VD: Đội Xe Vận Tải Sài Gòn Logistics..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mã số thuế:</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="031..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Người liên hệ:</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Anh Tuấn..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại (*):</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0918..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email liên hệ:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dieuhanh@..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Đơn giá rớt điểm thỏa thuận riêng (VNĐ):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    required
                    value={defaultDropRate}
                    onChange={(e) => setDefaultDropRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-purple-300 bg-purple-50/40 rounded-lg font-mono font-bold text-purple-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-purple-700 mt-0.5 block">
                    Vendor này tính rớt điểm: {formatVND(defaultDropRate)} / điểm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Địa chỉ bãi xe / trụ sở:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Địa chỉ văn phòng điều hành hoặc bãi tập kết xe..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trạng thái hợp tác:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm dừng hợp tác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ghi chú về Vendor:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú thế mạnh tuyến đường, loại xe..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingVendor ? 'Lưu Thay Đổi' : 'Tạo Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUẢN LÝ CHI TIẾT ĐỘI XE & DANH SÁCH TÀI XẾ */}
      {selectedVendorForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedVendorForDetail.code}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">
                    {selectedVendorForDetail.name}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Quản lý danh sách phương tiện và đội ngũ tài xế đăng ký cho nhà xe
                </p>
              </div>

              <button
                onClick={() => setSelectedVendorForDetail(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Sub-tab selection */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setDetailTab('vehicles')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                    detailTab === 'vehicles'
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Danh Sách Đội Xe ({selectedVendorForDetail.vehicles?.length || 0})</span>
                </button>

                <button
                  onClick={() => setDetailTab('drivers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                    detailTab === 'drivers'
                      ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Danh Sách Tài Xế ({selectedVendorForDetail.drivers?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: DANH SÁCH XE */}
              {detailTab === 'vehicles' && (
                <div className="space-y-3">
                  {canEdit && (
                    <form onSubmit={handleAddVehicle} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                      <div className="font-bold text-amber-900 text-[11px] mb-2 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Đăng Ký Thêm Xe Mới Cho Vendor</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Biển số xe (*):</label>
                          <input
                            type="text"
                            required
                            placeholder="VD: 51D-892.45"
                            value={newPlate}
                            onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                            className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg bg-white font-mono font-bold text-slate-900 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Loại xe:</label>
                          <select
                            value={newVehType}
                            onChange={(e) => setNewVehType(e.target.value as VehicleType)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-medium"
                          >
                            {VEHICLE_TYPES.map((v) => (
                              <option key={v} value={v}>
                                Xe {v}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Tải trọng đăng ký:</label>
                          <input
                            type="text"
                            value={newPayload}
                            onChange={(e) => setNewPayload(e.target.value)}
                            placeholder="VD: 1.99 tấn"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <button
                            type="submit"
                            className="w-full px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg cursor-pointer"
                          >
                            + Thêm Xe
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Biển Số Xe</th>
                          <th className="py-2.5 px-3">Loại Xe</th>
                          <th className="py-2.5 px-3">Tải Trọng Đăng Ký</th>
                          <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                          <th className="py-2.5 px-3 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedVendorForDetail.vehicles || []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              Chưa có phương tiện nào được gán cho vendor này.
                            </td>
                          </tr>
                        ) : (
                          selectedVendorForDetail.vehicles.map((veh) => (
                            <tr key={veh.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-amber-900 bg-amber-50 border border-amber-300">
                                  {veh.licensePlate}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                Xe {veh.vehicleType}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {veh.payloadCapacity || 'N/A'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Sẵn sàng
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {canEdit && (
                                  <button
                                    onClick={() => {
                                      deleteVehicleFromVendor(selectedVendorForDetail.id, veh.id);
                                      setSelectedVendorForDetail((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              vehicles: prev.vehicles.filter((v) => v.id !== veh.id),
                                            }
                                          : null
                                      );
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="Xóa xe"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: DANH SÁCH TÀI XẾ */}
              {detailTab === 'drivers' && (
                <div className="space-y-3">
                  {canEdit && (
                    <form onSubmit={handleAddDriver} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                      <div className="font-bold text-emerald-900 text-[11px] mb-2 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Đăng Ký Thêm Tài Xế Cho Vendor</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-700 font-semibold mb-1">Họ tên tài xế (*):</label>
                          <input
                            type="text"
                            required
                            placeholder="Họ tên lái xe..."
                            value={newDriverName}
                            onChange={(e) => setNewDriverName(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Số điện thoại (*):</label>
                          <input
                            type="text"
                            required
                            placeholder="0918..."
                            value={newDriverPhone}
                            onChange={(e) => setNewDriverPhone(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Hạng bằng lái:</label>
                          <select
                            value={newLicenseGrade}
                            onChange={(e) => setNewLicenseGrade(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                          >
                            <option value="B2">Bằng B2</option>
                            <option value="C">Bằng C</option>
                            <option value="D">Bằng D</option>
                            <option value="FC">Bằng FC</option>
                          </select>
                        </div>

                        <div>
                          <button
                            type="submit"
                            className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
                          >
                            + Thêm Lái Xe
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Họ Tên Tài Xế</th>
                          <th className="py-2.5 px-3">Số Điện Thoại</th>
                          <th className="py-2.5 px-3">Hạng Bằng & Số GPLX</th>
                          <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                          <th className="py-2.5 px-3 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedVendorForDetail.drivers || []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              Chưa có tài xế nào được gán cho vendor này.
                            </td>
                          </tr>
                        ) : (
                          selectedVendorForDetail.drivers.map((drv) => (
                            <tr key={drv.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {drv.fullName}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-700">
                                {drv.phoneNumber}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-semibold text-slate-800">
                                  Hạng {drv.licenseGrade || 'C'}
                                </span>
                                {drv.licenseNumber && (
                                  <span className="font-mono text-slate-400 text-[10px] ml-1.5">
                                    {drv.licenseNumber}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Hoạt động
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {canEdit && (
                                  <button
                                    onClick={() => {
                                      deleteDriverFromVendor(selectedVendorForDetail.id, drv.id);
                                      setSelectedVendorForDetail((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              drivers: prev.drivers.filter((d) => d.id !== drv.id),
                                            }
                                          : null
                                      );
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="Xóa tài xế"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
