import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const BlockedScreen: React.FC = () => {
  const { currentUser, switchUser } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-6 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Truy Cập Bị Từ Chối (Cấp Quyền: Không Được Truy Cập)
          </h2>
          <p className="text-xs text-slate-500">
            Tài khoản <strong>@{currentUser.username}</strong> ({currentUser.fullName}) đã bị Quản trị viên phân quyền vào nhóm <strong>Không được truy cập</strong>.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
          <div className="font-semibold text-slate-800">Quy tắc bảo mật hệ thống:</div>
          <div>• Không được xem danh sách bảng giá & dữ liệu doanh thu.</div>
          <div>• Không được xem điều phối đơn vận hành hàng ngày.</div>
          <div>• Mọi nỗ lực truy cập đều được ghi vào Lịch Sử Đăng Nhập & Audit Trail.</div>
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-slate-400 mb-2">
            Để tiếp tục trải nghiệm bản Demo, vui lòng chuyển sang tài khoản có quyền:
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => switchUser('usr-admin')}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Chuyển sang Quản Trị Viên (Admin)</span>
            </button>
            <button
              onClick={() => switchUser('usr-editor')}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Chuyển sang Điều Phối Viên (Xem & Sửa)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
