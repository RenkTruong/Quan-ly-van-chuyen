// Bảng chuẩn hóa Tỉnh/Thành và Quận/Huyện theo dữ liệu hành chính Việt Nam
export interface GeoProvince {
  name: string;
  code: string; // 3 ký tự viết tắt chuẩn
  districts: { name: string; code: string }[];
}

export const VIETNAM_GEO: GeoProvince[] = [
  {
    name: 'Thành phố Hồ Chí Minh',
    code: 'HCM',
    districts: [
      { name: 'Quận 1', code: 'Q01' },
      { name: 'Quận 3', code: 'Q03' },
      { name: 'Quận 4', code: 'Q04' },
      { name: 'Quận 5', code: 'Q05' },
      { name: 'Quận 6', code: 'Q06' },
      { name: 'Quận 7', code: 'Q07' },
      { name: 'Quận 8', code: 'Q08' },
      { name: 'Quận 10', code: 'Q10' },
      { name: 'Quận 11', code: 'Q11' },
      { name: 'Quận 12', code: 'Q12' },
      { name: 'Thành phố Thủ Đức', code: 'TDU' },
      { name: 'Quận Bình Thạnh', code: 'BTH' },
      { name: 'Quận Gò Vấp', code: 'GVA' },
      { name: 'Quận Phú Nhuận', code: 'PNH' },
      { name: 'Quận Tân Bình', code: 'TBI' },
      { name: 'Quận Tân Phú', code: 'TPH' },
      { name: 'Quận Bình Tân', code: 'BTA' },
      { name: 'Huyện Bình Chánh', code: 'BCH' },
      { name: 'Huyện Hóc Môn', code: 'HMO' },
      { name: 'Huyện Củ Chi', code: 'CCH' },
      { name: 'Huyện Nhà Bè', code: 'NBE' },
      { name: 'Huyện Cần Giờ', code: 'CGI' },
    ],
  },
  {
    name: 'Thành phố Hà Nội',
    code: 'HAN',
    districts: [
      { name: 'Quận Ba Đình', code: 'BDI' },
      { name: 'Quận Hoàn Kiếm', code: 'HKI' },
      { name: 'Quận Tây Hồ', code: 'THO' },
      { name: 'Quận Long Biên', code: 'LBI' },
      { name: 'Quận Cầu Giấy', code: 'CGY' },
      { name: 'Quận Đống Đa', code: 'DDA' },
      { name: 'Quận Hai Bà Trưng', code: 'HBT' },
      { name: 'Quận Hoàng Mai', code: 'HMA' },
      { name: 'Quận Thanh Xuân', code: 'TXU' },
      { name: 'Huyện Sóc Sơn', code: 'SSO' },
      { name: 'Huyện Đông Anh', code: 'DAN' },
      { name: 'Huyện Gia Lâm', code: 'GLA' },
      { name: 'Quận Nam Từ Liêm', code: 'NTL' },
      { name: 'Quận Bắc Từ Liêm', code: 'BTL' },
      { name: 'Huyện Thanh Trì', code: 'TTI' },
      { name: 'Quận Hà Đông', code: 'HDO' },
      { name: 'Thị xã Sơn Tây', code: 'STA' },
      { name: 'Huyện Hoài Đức', code: 'HDU' },
      { name: 'Huyện Mê Linh', code: 'MLI' },
      { name: 'Huyện Thường Tín', code: 'TTI' },
    ],
  },
  {
    name: 'Tỉnh Bình Dương',
    code: 'BDG',
    districts: [
      { name: 'Thành phố Thủ Dầu Một', code: 'TDM' },
      { name: 'Thành phố Thuận An', code: 'TAN' },
      { name: 'Thành phố Dĩ An', code: 'DIA' },
      { name: 'Thành phố Tân Uyên', code: 'TUY' },
      { name: 'Thành phố Bến Cát', code: 'BCA' },
      { name: 'Huyện Bàu Bàng', code: 'BBA' },
      { name: 'Huyện Bắc Tân Uyên', code: 'BTU' },
      { name: 'Huyện Dầu Tiếng', code: 'DTI' },
      { name: 'Huyện Phú Giáo', code: 'PGI' },
    ],
  },
  {
    name: 'Tỉnh Đồng Nai',
    code: 'DNA',
    districts: [
      { name: 'Thành phố Biên Hòa', code: 'BHO' },
      { name: 'Thành phố Long Khánh', code: 'LKH' },
      { name: 'Huyện Long Thành', code: 'LTH' },
      { name: 'Huyện Nhơn Trạch', code: 'NTR' },
      { name: 'Huyện Trảng Bom', code: 'TBO' },
      { name: 'Huyện Thống Nhất', code: 'TNH' },
      { name: 'Huyện Vĩnh Cửu', code: 'VCU' },
      { name: 'Huyện Cẩm Mỹ', code: 'CMY' },
      { name: 'Huyện Xuân Lộc', code: 'XLO' },
      { name: 'Huyện Định Quán', code: 'DQU' },
    ],
  },
  {
    name: 'Tỉnh Long An',
    code: 'LAN',
    districts: [
      { name: 'Thành phố Tân An', code: 'TAN' },
      { name: 'Huyện Bến Lức', code: 'BLU' },
      { name: 'Huyện Cần Giuộc', code: 'CGU' },
      { name: 'Huyện Cần Đước', code: 'CDU' },
      { name: 'Huyện Đức Hòa', code: 'DHO' },
      { name: 'Huyện Châu Thành', code: 'CTH' },
      { name: 'Thị xã Kiến Tường', code: 'KTU' },
    ],
  },
  {
    name: 'Thành phố Đà Nẵng',
    code: 'DNG',
    districts: [
      { name: 'Quận Hải Châu', code: 'HCH' },
      { name: 'Quận Thanh Khê', code: 'TKH' },
      { name: 'Quận Sơn Trà', code: 'STR' },
      { name: 'Quận Ngũ Hành Sơn', code: 'NHS' },
      { name: 'Quận Liên Chiểu', code: 'LCH' },
      { name: 'Quận Cẩm Lệ', code: 'CLE' },
      { name: 'Huyện Hòa Vang', code: 'HVA' },
    ],
  },
  {
    name: 'Thành phố Hải Phòng',
    code: 'HPG',
    districts: [
      { name: 'Quận Hồng Bàng', code: 'HBA' },
      { name: 'Quận Ngô Quyền', code: 'NQU' },
      { name: 'Quận Lê Chân', code: 'LCH' },
      { name: 'Quận Hải An', code: 'HAN' },
      { name: 'Quận Kiến An', code: 'KAN' },
      { name: 'Huyện An Dương', code: 'ADU' },
      { name: 'Thành phố Thủy Nguyên', code: 'TNG' },
    ],
  },
  {
    name: 'Thành phố Cần Thơ',
    code: 'CTH',
    districts: [
      { name: 'Quận Ninh Kiều', code: 'NKI' },
      { name: 'Quận Bình Thủy', code: 'BTH' },
      { name: 'Quận Cái Răng', code: 'CRA' },
      { name: 'Quận Ô Môn', code: 'OMO' },
      { name: 'Quận Thốt Nốt', code: 'TNO' },
      { name: 'Huyện Phong Điền', code: 'PDI' },
    ],
  },
  {
    name: 'Thành phố Bắc Ninh',
    code: 'BNI',
    districts: [
      { name: 'Thành phố Bắc Ninh', code: 'BNI' },
      { name: 'Thị xã Từ Sơn', code: 'TSO' },
      { name: 'Thị xã Quế Võ', code: 'QVO' },
      { name: 'Thị xã Thuận Thành', code: 'TTH' },
      { name: 'Huyện Yên Phong', code: 'YPH' },
      { name: 'Huyện Tiên Du', code: 'TDU' },
    ],
  },
  {
    name: 'Tỉnh Bà Rịa - Vũng Tàu',
    code: 'VTU',
    districts: [
      { name: 'Thành phố Vũng Tàu', code: 'VTU' },
      { name: 'Thành phố Bà Rịa', code: 'BRI' },
      { name: 'Thị xã Phú Mỹ', code: 'PMY' },
      { name: 'Huyện Châu Đức', code: 'CDU' },
      { name: 'Huyện Long Điền', code: 'LDI' },
      { name: 'Huyện Xuyên Mộc', code: 'XMO' },
    ],
  },
];

// Hàm loại bỏ dấu tiếng Việt để tạo mã viết tắt dự phòng
export function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

// Lấy 3 chữ viết tắt chuẩn của Tỉnh/Thành
export function getProvinceAbbr(provinceName: string): string {
  const found = VIETNAM_GEO.find(
    (p) =>
      p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
      provinceName.toLowerCase().includes(p.name.toLowerCase())
  );
  if (found) return found.code;

  // Thuật toán sinh tự động 3 ký tự
  const clean = removeVietnameseTones(provinceName)
    .replace(/(T?nh|Thnh ph?|Thành phố|Tỉnh)/gi, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    return words[0].substring(0, 3).toUpperCase();
  }
  return 'TTP';
}

// Lấy 3 chữ viết tắt chuẩn của Quận/Huyện
export function getDistrictAbbr(districtName: string, provinceName?: string): string {
  if (provinceName) {
    const p = VIETNAM_GEO.find(
      (prov) =>
        prov.name.toLowerCase().includes(provinceName.toLowerCase()) ||
        provinceName.toLowerCase().includes(prov.name.toLowerCase())
    );
    if (p) {
      const d = p.districts.find(
        (dist) =>
          dist.name.toLowerCase().includes(districtName.toLowerCase()) ||
          districtName.toLowerCase().includes(dist.name.toLowerCase())
      );
      if (d) return d.code;
    }
  }

  // Tìm trong tất cả các quận huyện
  for (const prov of VIETNAM_GEO) {
    const d = prov.districts.find(
      (dist) =>
        dist.name.toLowerCase().includes(districtName.toLowerCase()) ||
        districtName.toLowerCase().includes(dist.name.toLowerCase())
    );
    if (d) return d.code;
  }

  // Thuật toán sinh tự động 3 ký tự
  const clean = removeVietnameseTones(districtName)
    .replace(/(Qu?n|Huy?n|Th? x|Thnh ph?|Quận|Huyện|Thị xã|Thành phố)/gi, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    return words[0].substring(0, 3).toUpperCase();
  }
  return 'QHY';
}

/**
 * Tạo mã tuyến theo đúng quy định:
 * 6 chữ cái (3 chữ viết tắt Quận/Huyện + 3 chữ viết tắt Tỉnh/Thành) + 6 số chạy tự động
 * Ví dụ: Quận Bình Chánh + TP. Hồ Chí Minh + Số thứ tự 1 -> "BCHHCM000001"
 */
export function generateRouteCode(district: string, province: string, seqNumber: number = 1): string {
  const distCode = getDistrictAbbr(district, province);
  const provCode = getProvinceAbbr(province);
  const letters = (distCode.padEnd(3, 'X').substring(0, 3) + provCode.padEnd(3, 'X').substring(0, 3)).toUpperCase();
  const digits = String(seqNumber).padStart(6, '0');
  return `${letters}${digits}`;
}

/**
 * Tự động tìm mã tuyến đã có hoặc sinh mã tuyến mới:
 * TH mã tuyến đã có theo cặp (Tỉnh/Thành + Quận/Huyện) thì áp vào lại;
 * TH chưa có thì tự động sinh 6 chữ + 6 số tăng tự động.
 */
export function getOrGenerateRouteCode(
  district: string,
  province: string,
  existingPriceList: { routeCode: string; province: string; district: string }[] = []
): string {
  if (!district || !province) return 'ROUTEX000001';

  // 1. Kiểm tra nếu mã tuyến của cặp (Tỉnh/Thành + Quận/Huyện) đã tồn tại -> ÁP LẠI MÃ TUYẾN
  const normalizedDistrict = district.trim().toLowerCase();
  const normalizedProvince = province.trim().toLowerCase();

  const matched = existingPriceList.find(
    (item) =>
      item.province &&
      item.district &&
      item.province.trim().toLowerCase() === normalizedProvince &&
      item.district.trim().toLowerCase() === normalizedDistrict &&
      item.routeCode
  );

  if (matched && matched.routeCode) {
    return matched.routeCode.trim().toUpperCase();
  }

  // 2. Nếu chưa có, tạo mới theo quy định 6 chữ + 6 số
  const distCode = getDistrictAbbr(district, province);
  const provCode = getProvinceAbbr(province);
  const prefix = (distCode.padEnd(3, 'X').substring(0, 3) + provCode.padEnd(3, 'X').substring(0, 3)).toUpperCase();

  // Tìm số thứ tự lớn nhất của prefix này trong danh sách hiện tại
  let maxSeq = 0;
  for (const item of existingPriceList) {
    if (item.routeCode && item.routeCode.toUpperCase().startsWith(prefix)) {
      const numPart = item.routeCode.substring(6);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
}
