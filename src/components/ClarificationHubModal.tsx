import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  Send,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const ClarificationHubModal: React.FC = () => {
  const { setCurrentTab } = useApp();
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;
    setSubmittedFeedback((prev) => [feedbackNote.trim(), ...prev]);
    setFeedbackNote('');
  };

  const copyQuestions = () => {
    const text = `CÁC ĐIỂM CẦN THẢO LUẬN CHI TIẾT CHO DỰ ÁN TMS:
1. Cấp hành chính: File địa lý hành chính đính kèm gồm Xã/Phường và Tỉnh/Thành. Anh/chị muốn biểu mẫu chọn cấp Tỉnh -> Quận/Huyện hay chọn đến chi tiết từng Xã/Phường?
2. Bảng giá số khối: Có quy định số khối tối thiểu (minimum CBM) cho từng loại xe (1.5T, 2T, 5T, 8T, 15T) không?
3. Phụ phí rớt điểm: Đơn giá 100.000đ/điểm đang áp dụng chung cho cả Khách hàng và Vendor, hay có mức riêng cho từng đối tượng?
4. Kênh thông báo đổi giá: Hiện đã có chuông thông báo & Audit log trên web, có cần kết nối thêm Email / Zalo ZNS / Telegram Bot không?`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Góc Làm Rõ Nghiệp Vụ & Thảo Luận Chi Tiết
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Dành cho Quý khách duyệt Demo
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống được thiết kế linh hoạt theo đúng yêu cầu &quot;Cái tính năng chỗ nào chưa rõ hãy hỏi lại tôi, không tự phán đoán&quot;. Dưới đây là các cơ chế đã cài đặt sẵn và các điểm mở để anh/chị phản hồi hoàn thiện.
        </p>
      </div>

      {/* Grid: Established Features vs Clarification Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Cơ chế đã được thiết lập chuẩn xác trong Demo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              1. Các Tiêu Chuẩn Đã Thiết Lập Hoàn Chỉnh Trong Bản Demo
            </h2>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-blue-900">
                Mã tuyến 12 ký tự: 6 chữ cái + 6 số chạy tự động
              </div>
              <p className="text-slate-600">
                Từ Tỉnh/Thành + Quận/Huyện, tự động ghép 3 chữ viết tắt Quận/Huyện (vd: <code>BCH</code> Bình Chánh, <code>CCH</code> Củ Chi) + 3 chữ viết tắt Tỉnh/Thành (<code>HCM</code>, <code>HAN</code>) + 6 số tự động (<code>000001</code>) &rarr; ví dụ <code>BCHHCM000001</code>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-emerald-900">
                Phụ phí rớt điểm tự động tính toán
              </div>
              <p className="text-slate-600">
                Điều kiện cùng 1 mã lệnh / ngày: Vd đi 6 điểm tính rớt 5 điểm (giao N điểm thì tính rớt N-1 điểm). Đơn giá mặc định 100.000 VNĐ &rarr; Tự động cộng vào Doanh thu khách và Chi phí vendor.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-indigo-900">
                Tra cứu giá theo ngày áp dụng gần nhất (&le; Ngày vận chuyển)
              </div>
              <p className="text-slate-600">
                Hệ thống tự động so khớp ngày vận chuyển với bảng giá có <code>effectiveDate &le; shippingDate</code> gần nhất, giúp kiểm soát lịch sử biến động giá qua từng thời kỳ.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-amber-900">
                4 Cấp độ phân quyền tài khoản (RBAC) & Quản lý bảo mật
              </div>
              <p className="text-slate-600">
                Gồm: <strong>Quản trị viên</strong> (toàn quyền, chỉ admin được xóa), <strong>Cho phép xem/sửa</strong> (không xóa), <strong>Cho phép xem</strong> (chỉ đọc), <strong>Không được truy cập</strong> (khóa). Có sẵn Lịch sử đăng nhập & Audit Log theo dõi mọi thao tác.
              </p>
            </div>
          </div>
        </div>

        {/* Right Box: Các câu hỏi nghiệp vụ cần anh/chị xác nhận */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                2. Các Chi Tiết Cụ Thể Cần Anh/Chị Phản Hồi Thêm
              </h2>
            </div>
            <button
              onClick={copyQuestions}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              {copied ? '✓ Đã sao chép câu hỏi' : 'Sao chép câu hỏi'}
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="font-bold text-amber-900 mb-1">
                Câu hỏi 1: Về dữ liệu địa lý hành chính từ file đính kèm
              </div>
              <p className="text-amber-800">
                File <code>Dia_ly_hanh_chinh.csv</code> chứa cột <code>ten_xa_moi</code> (Phường/Xã) và <code>ten_tinh</code>. Khi nhân viên nhập đơn hoặc tạo bảng giá, anh/chị muốn:
                <br />
                • Phương án A (Hiện tại trong Demo): Chọn theo <strong>Tỉnh/Thành &rarr; Quận/Huyện</strong> để rút gọn mã tuyến 6 chữ + 6 số.
                <br />
                • Phương án B: Cho phép chọn chi tiết đến tận <strong>Phường/Xã</strong>?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="font-bold text-blue-900 mb-1">
                Câu hỏi 2: Về quy tắc tính Số khối (m³) và tải trọng xe
              </div>
              <p className="text-blue-800">
                Xe tải 1.5T, 2T, 5T, 8T, 15T: Anh/chị có áp dụng mức <strong>Số khối tối thiểu</strong> cho 1 chuyến xe không? Ví dụ nếu khách đi xe 5T nhưng hàng chỉ có 2 khối thì tính theo 2 khối hay tính cước tối thiểu của xe 5T?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="font-bold text-emerald-900 mb-1">
                Câu hỏi 3: Về phụ phí rớt điểm giữa Khách hàng và Vendor
              </div>
              <p className="text-emerald-800">
                Đơn giá rớt điểm 100.000 VNĐ hiện đang tính đồng giá cho cả Khách hàng và Vendor. Thực tế công ty có thu của khách 100.000đ nhưng chỉ trả vendor mức khác (ví dụ 80.000đ để hưởng chênh lệch dịch vụ) không?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="font-bold text-purple-900 mb-1">
                Câu hỏi 4: Thông báo cho Quản trị viên khi có đổi giá
              </div>
              <p className="text-purple-800">
                Hiện tại hệ thống đã có tính năng chuông thông báo (Notification Center) và Audit Trail theo thời gian thực. Anh/chị có muốn tích hợp thêm gửi Email hoặc thông báo qua Zalo / Telegram khi có nhân viên đổi giá không?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive In-App Feedback Form */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">
            Gửi Ghi Chú / Phản Hồi Trực Tiếp Về Các Tính Năng
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          Anh/chị có thể nhập phản hồi hoặc yêu cầu điều chỉnh tại đây để lưu lại trong phiên demo này hoặc sao chép gửi lại cho kỹ sư.
        </p>

        <form onSubmit={handleSendFeedback} className="space-y-3">
          <textarea
            rows={3}
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Ví dụ: Cần bổ sung cột số điểm giao rớt giá khác cho Vendor... / Cần chỉnh sửa mã tuyến..."
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-400 font-sans"
          ></textarea>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {submittedFeedback.length > 0
                ? `Đã lưu ${submittedFeedback.length} phản hồi trong bộ nhớ tạm`
                : 'Chưa có phản hồi nào'}
            </span>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ghi Nhận Phản Hồi</span>
            </button>
          </div>
        </form>

        {submittedFeedback.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Các phản hồi vừa ghi nhận:
            </p>
            {submittedFeedback.map((fb, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                {fb}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
