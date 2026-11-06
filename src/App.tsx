import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PriceMatrixView } from './components/PriceMatrixView';
import { OperationsView } from './components/OperationsView';
import { ReportsView } from './components/ReportsView';
import { UserManagementView } from './components/UserManagementView';
import { VendorManagementView } from './components/VendorManagementView';
import { BlockedScreen } from './components/BlockedScreen';
import {
  LayoutDashboard,
  Tag,
  Truck,
  Building2,
  ClipboardList,
  BarChart3,
  Users2,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentTab, setCurrentTab, canView, currentUser, hasPermission } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Header />

      {/* Main Workspace Frame */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {/* Mobile Tab Bar */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 mb-3 border-b border-slate-200">
            {hasPermission('dashboard', 'view') && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Tổng quan
              </button>
            )}
            {hasPermission('price_customer', 'view') && (
              <button
                onClick={() => setCurrentTab('customer_pricing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'customer_pricing' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Giá KH
              </button>
            )}
            {hasPermission('price_vendor', 'view') && (
              <button
                onClick={() => setCurrentTab('vendor_pricing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'vendor_pricing' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Giá Vendor
              </button>
            )}
            {hasPermission('vendors', 'view') && (
              <button
                onClick={() => setCurrentTab('vendors')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'vendors' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Hồ sơ Vendor
              </button>
            )}
            {hasPermission('operations', 'view') && (
              <button
                onClick={() => setCurrentTab('operations')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'operations' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Vận hành
              </button>
            )}
            {hasPermission('reports', 'view') && (
              <button
                onClick={() => setCurrentTab('reports')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Báo cáo
              </button>
            )}
            {hasPermission('users', 'view') && (
              <button
                onClick={() => setCurrentTab('users')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                  currentTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                Phân quyền
              </button>
            )}
          </div>

          {/* Role Check: If user has 'blocked' role, render BlockedScreen */}
          {!canView ? (
            <BlockedScreen />
          ) : (
            <>
              {currentTab === 'dashboard' && <DashboardView />}
              {currentTab === 'customer_pricing' && <PriceMatrixView target="customer" />}
              {currentTab === 'vendor_pricing' && <PriceMatrixView target="vendor" />}
              {currentTab === 'vendors' && <VendorManagementView />}
              {currentTab === 'operations' && <OperationsView />}
              {currentTab === 'reports' && <ReportsView />}
              {currentTab === 'users' && <UserManagementView />}
            </>
          )}
        </main>
      </div>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            LogisTMS &copy; 2026 · Hệ thống Quản Lý Vận Tải, Bảng Giá & Điều Phối Đa Phương Thức
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Phiên bản Demo V1.0 · Đang kết nối tài khoản: {currentUser.fullName} ({currentUser.role})
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
