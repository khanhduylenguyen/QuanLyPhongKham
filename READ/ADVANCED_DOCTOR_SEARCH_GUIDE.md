# 🔍 Tìm kiếm Bác sĩ Nâng cao - Hướng dẫn

## Tổng quan

Tính năng **Tìm kiếm Bác sĩ Nâng cao** cho phép bệnh nhân tìm kiếm và lọc bác sĩ theo nhiều tiêu chí:
- ⭐ Đánh giá (Rating)
- 💰 Giá khám (Price)
- 📍 Vị trí (Location) với Google Maps
- 🏥 Chuyên khoa (Specialty)
- 🔍 Tìm kiếm theo tên, địa chỉ

## Tính năng chính

### 1. **Bộ lọc nâng cao**
- **Rating Filter**: Lọc theo điểm đánh giá (0-5 sao)
- **Price Filter**: Lọc theo giá khám (VND)
- **Specialty Filter**: Lọc theo chuyên khoa
- **Search Query**: Tìm kiếm theo tên, chuyên khoa, địa chỉ

### 2. **Google Maps Integration**
- Hiển thị bác sĩ trên bản đồ
- Xem vị trí của bạn
- Chỉ đường đến phòng khám
- Click vào marker để xem thông tin bác sĩ

### 3. **Dual View Mode**
- **List View**: Xem dạng danh sách với card
- **Map View**: Xem trên bản đồ Google Maps

### 4. **UX Improvements**
- Active filters hiển thị dạng badges
- Reset filters dễ dàng
- Responsive design
- Doctor detail dialog
- Quick booking từ search results

## Cách sử dụng

### Cho Bệnh nhân:

1. **Truy cập trang tìm kiếm:**
   - Từ trang chủ: Click "Tìm kiếm nâng cao" trong section Bác sĩ tiêu biểu
   - Hoặc truy cập trực tiếp: `/patient/doctors/search`

2. **Tìm kiếm:**
   - Nhập từ khóa vào ô tìm kiếm
   - Chọn chuyên khoa từ dropdown
   - Click "Bộ lọc" để mở advanced filters

3. **Sử dụng bộ lọc:**
   - Điều chỉnh slider cho Rating (0-5 sao)
   - Điều chỉnh slider cho Price (VND)
   - Click X trên badge để xóa filter

4. **Xem kết quả:**
   - **List View**: Xem dạng card với thông tin đầy đủ
   - **Map View**: Xem trên bản đồ (cần Google Maps API Key)

5. **Đặt lịch:**
   - Click vào card bác sĩ để xem chi tiết
   - Click "Đặt lịch ngay" trong dialog hoặc card

### Cho Admin:

1. **Cấu hình Google Maps:**
   - Vào `/dashboard/settings`
   - Tab "Tích hợp"
   - Nhập Google Maps API Key
   - Lưu settings

2. **Thêm thông tin bác sĩ:**
   - Vào `/dashboard/doctors`
   - Thêm/Edit bác sĩ
   - Có thể thêm:
     - `address`: Địa chỉ phòng khám
     - `price`: Giá khám (VND) - sẽ được thêm vào Staff interface
     - `location.lat` và `location.lng`: Tọa độ (sẽ được thêm vào Staff interface)

## Cấu trúc dữ liệu

### Doctor Interface (Extended)
```typescript
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  available: boolean;
  price?: number; // Consultation fee in VND
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  experienceYears?: number;
  degree?: string;
}
```

### Default Values
- Nếu bác sĩ không có `price`: Random 200k-500k VND
- Nếu bác sĩ không có `location`: 
  - Address: Lấy từ `address` field hoặc default "123 Đường ABC, Quận 1, TP.HCM"
  - Lat/Lng: Random quanh HCMC center (10.8231, 106.6297)

## Google Maps Setup

### 1. Lấy API Key:
1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Maps JavaScript API**
4. Tạo API Key:
   - Vào **Credentials** → **Create Credentials** → **API Key**
   - Restrict API Key (khuyến nghị):
     - Application restrictions: HTTP referrers
     - API restrictions: Chỉ Maps JavaScript API
5. Copy API Key

### 2. Cấu hình trong app (Khuyến nghị):
1. Đăng nhập với tài khoản **Admin**
2. Vào `/dashboard/settings`
3. Chọn tab **"Tích hợp"**
4. Paste API Key vào field **"Google Maps API Key"**
5. Click nút **"Lưu"** ở cuối trang
6. Refresh trang để áp dụng thay đổi

**Lưu ý:** API Key sẽ được lưu trong localStorage và có thể chỉnh sửa lại bất cứ lúc nào.

### 3. Environment Variable (Optional):
Nếu muốn dùng environment variable, tạo file `.env` trong thư mục gốc:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Ưu tiên:** Nếu có cả Settings và .env, app sẽ ưu tiên dùng Settings trước.

## Routes

- **Public Route**: `/patient/doctors/search` (không cần login)
- **Navigation**: 
  - Từ FeaturedDoctors component
  - Từ Index page (có thể thêm button)

## Components

### Main Component
- `src/pages/patient/AdvancedDoctorSearch.tsx`

### Dependencies
- `@react-google-maps/api`: Google Maps integration
- `lucide-react`: Icons
- `@/components/ui/*`: Shadcn UI components

## Future Enhancements

- [ ] Thêm distance calculation (khoảng cách từ user)
- [ ] Sort by distance
- [ ] Save favorite doctors
- [ ] Filter by availability (today, this week)
- [ ] Filter by languages spoken
- [ ] Advanced map features (clusters, heatmap)
- [ ] Export search results
- [ ] Share search results

## Troubleshooting

### Google Maps không hiển thị:
1. Kiểm tra API Key đã được thêm trong Settings
2. Kiểm tra API Key có enable Maps JavaScript API
3. Kiểm tra browser console cho errors
4. Kiểm tra API Key restrictions

### Không có bác sĩ hiển thị:
1. Kiểm tra có bác sĩ nào trong `/dashboard/doctors` với status = "active"
2. Kiểm tra filters có quá strict không
3. Reset filters và thử lại

### Location không chính xác:
- Admin cần thêm `location.lat` và `location.lng` chính xác cho mỗi bác sĩ
- Có thể dùng Google Maps để lấy tọa độ

## Notes

- Tính năng hoạt động tốt nhất khi có Google Maps API Key
- Nếu không có API Key, Map View sẽ bị disable nhưng List View vẫn hoạt động
- Price và Location có default values nếu không được set
- Rating được lấy từ review system (`src/lib/reviews.ts`)

