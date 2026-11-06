import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatVND, formatNumber } from '../utils/pricingEngine';
import { exportReportToExcel } from '../utils/excelHelper';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  Truck,
  Users,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

// Helper tính số tuần trong năm (ISO 8601 week number)
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export const ReportsView: React.FC = () => {
  const { orders } = useApp();

  const [periodMode, setPeriodMode] = useState<'week' | 'month'>('month');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');

  // Lấy danh sách khách hàng duy nhất
  const uniqueCustomers = Array.from(new Set(orders.map((o) => o.customerName)));

  // Nhóm và tổng hợp dữ liệu theo Tuần hoặc Tháng trên từng khách hàng
  interface AggregatedReportRow {
    key: string;
    customerName: string;
    periodLabel: string; // "Tháng 11/2026" hoặc "Tuần 45/2026"
    orderCount: number;
    totalVolume: number; // m3
    totalTons: number;
    revenue: number;
    vendorCost: number;
    grossProfit: number;
    marginPercent: number;
  }

  const reportMap = new Map<string, AggregatedReportRow>();

  orders.forEach((o) => {
    if (selectedCustomer !== 'all' && o.customerName !== selectedCustomer) return;

    const shipDate = new Date(o.shippingDate);
    const year = shipDate.getFullYear();
    let periodKey = '';
    let periodLabel = '';

    if (periodMode === 'month') {
      const month = shipDate.getMonth() + 1;
      periodKey = `${year}-${String(month).padStart(2, '0')}`;
      periodLabel = `Tháng ${String(month).padStart(2, '0')}/${year}`;
    } else {
      const week = getWeekNumber(shipDate);
      periodKey = `${year}-W${String(week).padStart(2, '0')}`;
      periodLabel = `Tuần ${week} (${year})`;
    }

    const mapKey = `${o.customerName}__${periodKey}`;

    if (!reportMap.has(mapKey)) {
      reportMap.set(mapKey, {
        key: mapKey,
        customerName: o.customerName,
        periodLabel,
        orderCount: 0,
        totalVolume: 0,
        totalTons: 0,
        revenue: 0,
        vendorCost: 0,
        grossProfit: 0,
        marginPercent: 0,
      });
    }

    const item = reportMap.get(mapKey)!;
    item.orderCount += 1;
    if (o.pricingModel === 'volume') {
      item.totalVolume += o.quantity || 0;
    } else if (o.pricingModel === 'ton') {
      item.totalTons += o.quantity || 0;
    }
    item.revenue += o.customerTotalAmount || 0;
    item.vendorCost += o.vendorTotalCost || 0;
    item.grossProfit = item.revenue - item.vendorCost;
    item.marginPercent = item.revenue > 0 ? (item.grossProfit / item.revenue) * 100 : 0;
  });

  const reportRows = Array.from(reportMap.values()).sort((a, b) => {
    if (a.customerName !== b.customerName) {
      return a.customerName.localeCompare(b.customerName);
    }
    return b.periodLabel.localeCompare(a.periodLabel);
  });

  // Tổng cộng toàn bộ báo cáo
  const grandTotalRevenue = reportRows.reduce((sum, r) => sum + r.revenue, 0);
  const grandTotalCost = reportRows.reduce((sum, r) => sum + r.vendorCost, 0);
  const grandTotalProfit = grandTotalRevenue - grandTotalCost;
  const grandTotalMargin = grandTotalRevenue > 0 ? (grandTotalProfit / grandTotalRevenue) * 100 : 0;
  const grandTotalTrips = reportRows.reduce((sum, r) => sum + r.orderCount, 0);

  // Xuất Excel
  const handleExportExcel = () => {
    const exportData = reportRows.map((r) => ({
      'Khách hàng': r.customerName,
      'Thời gian': r.periodLabel,
      'Số chuyến': r.orderCount,
      'Sản lượng khối (m³)': r.totalVolume,
      'Sản lượng tấn': r.totalTons,
      'Doanh thu (VNĐ)': r.revenue,
      'Chi phí Vendor (VNĐ)': r.vendorCost,
      'Lợi nhuận gộp (VNĐ)': r.grossProfit,
      'Tỷ suất lợi nhuận (%)': `${r.marginPercent.toFixed(1)}%`,
    }));
    exportReportToExcel(
      exportData,
      `Bao_Cao_Doanh_Thu_${periodMode === 'week' ? 'Theo_Tuan' : 'Theo_Thang'}.xlsx`
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Báo Cáo Tổng Hợp Doanh Thu & Lợi Nhuận
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp đa chiều theo Tuần và Tháng trên từng khách hàng (Doanh thu - Chi phí vendor = Lợi nhuận)
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Báo Cáo Excel (.xlsx)</span>
        </button>
      </div>

      {/* KPI Highlights for the Current Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Tổng Doanh Thu Báo Cáo</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatVND(grandTotalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{grandTotalTrips} chuyến vận chuyển</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Tổng Chi Phí Vendor</div>
          <div className="text-xl font-bold text-slate-700 font-mono tabular-nums mt-1">
            {formatVND(grandTotalCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chiếm {grandTotalRevenue > 0 ? Math.round((grandTotalCost / grandTotalRevenue) * 100) : 0}% doanh thu
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Tổng Lợi Nhuận Gộp</div>
          <div className="text-xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {formatVND(grandTotalProfit)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            +{grandTotalMargin.toFixed(1)}% Tỷ suất lợi nhuận
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Số Lượng Khách Hàng</div>
          <div className="text-xl font-bold text-blue-600 font-mono tabular-nums mt-1">
            {selectedCustomer === 'all' ? uniqueCustomers.length : 1} Khách
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {periodMode === 'week' ? 'Phân tích theo tuần' : 'Phân tích theo tháng'}
          </div>
        </div>
      </div>

      {/* Filter and Period Mode Switcher */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Period Switcher: Week vs Month */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setPeriodMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              periodMode === 'month'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng Hợp Theo Tháng
          </button>
          <button
            onClick={() => setPeriodMode('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              periodMode === 'week'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng Hợp Theo Tuần
          </button>
        </div>

        {/* Customer Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Khách hàng:</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">Tất cả khách hàng ({uniqueCustomers.length})</option>
            {uniqueCustomers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5">Khách Hàng</th>
                <th className="py-3 px-3.5">Khoảng Thời Gian</th>
                <th className="py-3 px-3.5 text-center">Số Chuyến</th>
                <th className="py-3 px-3.5 text-right">Khối Lượng (m³)</th>
                <th className="py-3 px-3.5 text-right">Trọng Lượng (Tấn)</th>
                <th className="py-3 px-3.5 text-right">Doanh Thu (Khách)</th>
                <th className="py-3 px-3.5 text-right">Chi Phí Vendor</th>
                <th className="py-3 px-3.5 text-right">Lợi Nhuận Gộp</th>
                <th className="py-3 px-3.5 text-center">Tỷ Suất (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Chưa có dữ liệu vận hành trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                reportRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-900">{row.customerName}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-700 font-medium">
                      {row.periodLabel}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                      {row.orderCount}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-600">
                      {row.totalVolume > 0 ? `${formatNumber(row.totalVolume)} m³` : '-'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-600">
                      {row.totalTons > 0 ? `${formatNumber(row.totalTons)} Tấn` : '-'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatVND(row.revenue)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-700 tabular-nums">
                      {formatVND(row.vendorCost)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-600 tabular-nums">
                      {formatVND(row.grossProfit)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        +{row.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {reportRows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={2} className="py-3 px-3.5 uppercase text-[11px] tracking-wider">
                    Tổng Cộng Toàn Bộ:
                  </td>
                  <td className="py-3 px-3.5 text-center">{grandTotalTrips}</td>
                  <td className="py-3 px-3.5 text-right font-mono">
                    {formatNumber(reportRows.reduce((s, r) => s + r.totalVolume, 0))} m³
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono">
                    {formatNumber(reportRows.reduce((s, r) => s + r.totalTons, 0))} Tấn
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-blue-900">
                    {formatVND(grandTotalRevenue)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-800">
                    {formatVND(grandTotalCost)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-emerald-700">
                    {formatVND(grandTotalProfit)}
                  </td>
                  <td className="py-3 px-3.5 text-center text-emerald-700">
                    +{grandTotalMargin.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
