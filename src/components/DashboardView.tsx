import React from 'react';
import { useApp } from '../context/AppContext';
import { formatVND, formatNumber } from '../utils/pricingEngine';
import {
  TrendingUp,
  DollarSign,
  Truck,
  ArrowUpRight,
  Package,
  Layers,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { orders, customerPrices, vendorPrices, setCurrentTab } = useApp();

  // 1. Tổng hợp chỉ số tài chính từ danh sách đơn hàng
  const totalRevenue = orders.reduce((sum, o) => sum + (o.customerTotalAmount || 0), 0);
  const totalVendorCost = orders.reduce((sum, o) => sum + (o.vendorTotalCost || 0), 0);
  const totalGrossProfit = totalRevenue - totalVendorCost;
  const overallMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  // Sản lượng
  const totalTrips = orders.length;
  const totalVolume = orders
    .filter((o) => o.pricingModel === 'volume')
    .reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalTons = orders
    .filter((o) => o.pricingModel === 'ton')
    .reduce((sum, o) => sum + (o.quantity || 0), 0);

  // 2. Thống kê theo 3 hình thức tính (Số khối, Chuyến, Giá tấn)
  const modelStats = {
    volume: { revenue: 0, cost: 0, count: 0 },
    trip: { revenue: 0, cost: 0, count: 0 },
    ton: { revenue: 0, cost: 0, count: 0 },
  };

  orders.forEach((o) => {
    if (modelStats[o.pricingModel]) {
      modelStats[o.pricingModel].revenue += o.customerTotalAmount || 0;
      modelStats[o.pricingModel].cost += o.vendorTotalCost || 0;
      modelStats[o.pricingModel].count += 1;
    }
  });

  // 3. Thống kê theo loại xe (1.5T, 2T, 5T, 8T, 15T)
  const vehicleStats: Record<string, { count: number; revenue: number }> = {
    '1.5T': { count: 0, revenue: 0 },
    '2T': { count: 0, revenue: 0 },
    '5T': { count: 0, revenue: 0 },
    '8T': { count: 0, revenue: 0 },
    '15T': { count: 0, revenue: 0 },
  };

  orders.forEach((o) => {
    if (vehicleStats[o.vehicleType]) {
      vehicleStats[o.vehicleType].count += 1;
      vehicleStats[o.vehicleType].revenue += o.customerTotalAmount || 0;
    }
  });

  // 4. Danh sách bảng giá cập nhật mới nhất (đáp ứng tiêu chí kiểm soát tính minh bạch)
  const allPricesCombined = [
    ...customerPrices.map((p) => ({ ...p, typeLabel: 'Bảng giá Khách hàng' })),
    ...vendorPrices.map((p) => ({ ...p, typeLabel: 'Bảng giá Vendor' })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const recentPriceUpdates = allPricesCombined.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Báo Cáo Hiệu Quả Kinh Doanh & Vận Tải
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tự động tổng hợp từ Doanh thu khách hàng, Chi phí vendor & Phụ phí rớt điểm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('operations')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            + Nhập Dữ Liệu Vận Hành
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
            {formatVND(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100%
            </span>
            <span>từ {totalTrips} đơn vận chuyển</span>
          </div>
        </div>

        {/* Vendor Cost */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Chi Phí Vendor (Đầu Vào)</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
            {formatVND(totalVendorCost)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>Chiếm</span>
            <span className="font-semibold text-slate-700">
              {totalRevenue > 0 ? Math.round((totalVendorCost / totalRevenue) * 100) : 0}%
            </span>
            <span>tổng doanh thu</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lợi Nhuận Gộp (P&L)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">
            {formatVND(totalGrossProfit)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              +{overallMargin.toFixed(1)}% Margin
            </span>
            <span>Doanh thu - Chi phí</span>
          </div>
        </div>

        {/* Total Production Volume */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sản Lượng Vận Tải</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Số khối:</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {formatNumber(totalVolume)} m³
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Hàng tải:</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {formatNumber(totalTons)} Tấn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 3 Pricing Models Comparison & Vehicle Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3 Pricing Models Performance */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Hiệu Quả Kinh Doanh Theo 3 Hình Thức Tính Giá
              </h2>
              <p className="text-xs text-slate-500">
                So sánh Số khối (m³), Chuyến (Trip) và Giá tấn (Ton)
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Volume */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">1. Số Khối (m³)</span>
                <span className="text-[11px] font-mono text-slate-500">{modelStats.volume.count} đơn</span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Doanh thu:</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {formatVND(modelStats.volume.revenue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chi phí Vendor:</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatVND(modelStats.volume.cost)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-700">
                  <span>Lợi nhuận:</span>
                  <span className="font-mono tabular-nums">
                    {formatVND(modelStats.volume.revenue - modelStats.volume.cost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">2. Chuyến (Trip)</span>
                <span className="text-[11px] font-mono text-slate-500">{modelStats.trip.count} đơn</span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Doanh thu:</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {formatVND(modelStats.trip.revenue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chi phí Vendor:</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatVND(modelStats.trip.cost)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-700">
                  <span>Lợi nhuận:</span>
                  <span className="font-mono tabular-nums">
                    {formatVND(modelStats.trip.revenue - modelStats.trip.cost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ton */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">3. Giá Tấn (Ton)</span>
                <span className="text-[11px] font-mono text-slate-500">{modelStats.ton.count} đơn</span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Doanh thu:</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">
                    {formatVND(modelStats.ton.revenue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chi phí Vendor:</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatVND(modelStats.ton.cost)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-700">
                  <span>Lợi nhuận:</span>
                  <span className="font-mono tabular-nums">
                    {formatVND(modelStats.ton.revenue - modelStats.ton.cost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Profit Ratio Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Tỷ lệ cơ cấu Doanh thu theo hình thức:</span>
              <span className="font-medium text-slate-700">100% Phân bổ</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
              <div
                style={{ width: `${totalRevenue > 0 ? (modelStats.volume.revenue / totalRevenue) * 100 : 33}%` }}
                className="bg-blue-600 h-full"
                title="Số khối"
              ></div>
              <div
                style={{ width: `${totalRevenue > 0 ? (modelStats.trip.revenue / totalRevenue) * 100 : 33}%` }}
                className="bg-emerald-500 h-full"
                title="Chuyến"
              ></div>
              <div
                style={{ width: `${totalRevenue > 0 ? (modelStats.ton.revenue / totalRevenue) * 100 : 34}%` }}
                className="bg-amber-500 h-full"
                title="Giá tấn"
              ></div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                <span>Số khối ({totalRevenue > 0 ? Math.round((modelStats.volume.revenue / totalRevenue) * 100) : 0}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Chuyến ({totalRevenue > 0 ? Math.round((modelStats.trip.revenue / totalRevenue) * 100) : 0}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span>Giá tấn ({totalRevenue > 0 ? Math.round((modelStats.ton.revenue / totalRevenue) * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Fleet Breakdown (1.5T, 2T, 5T, 8T, 15T) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cơ Cấu Đội Xe</h2>
              <p className="text-xs text-slate-500">5 loại tải trọng quy định</p>
            </div>
            <Truck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {(['1.5T', '2T', '5T', '8T', '15T'] as const).map((vType) => {
              const stat = vehicleStats[vType];
              const percent = totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0;

              return (
                <div key={vType} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">Xe {vType}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {stat.count} chuyến · {formatVND(stat.revenue)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transparency Widget: Recent Price Updates (Kiểm soát tính minh bạch dữ liệu) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Kiểm Soát Tính Minh Bạch: Lịch Sử Cập Nhật Bảng Giá Gần Nhất
              </h2>
              <p className="text-xs text-slate-500">
                Hiển thị tài khoản update bảng giá cùng thời gian chỉnh sửa mới nhất để kiểm soát
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('customer_pricing')}
            className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Xem toàn bộ bảng giá →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Phân loại</th>
                <th className="py-2.5 px-3">Tuyến & Mã Tuyến</th>
                <th className="py-2.5 px-3">Xe</th>
                <th className="py-2.5 px-3">Đơn giá mới</th>
                <th className="py-2.5 px-3">Ngày áp dụng</th>
                <th className="py-2.5 px-3">Tài khoản Update</th>
                <th className="py-2.5 px-3">Thời gian sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPriceUpdates.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.target === 'customer'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {item.typeLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-slate-900">{item.routeCode}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.district}, {item.province}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{item.vehicleType}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {formatVND(item.unitPrice)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {item.effectiveDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.updatedBy}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(item.updatedAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
