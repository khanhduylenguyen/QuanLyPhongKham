# 🚨 QUAN TRỌNG: Restart Server Ngay!

## Vấn Đề

File `.env` đã có ở đúng vị trí, nhưng Vite chưa đọc được vì **server chưa được restart**.

## Giải Pháp: Restart Server

### Bước 1: Dừng Server

Trong terminal đang chạy `npm run dev`:
- Nhấn **Ctrl + C**
- Đợi đến khi terminal quay về prompt

Hoặc dùng PowerShell:
```powershell
Stop-Process -Name node -Force
```

### Bước 2: Xóa Cache Vite

```powershell
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
```

### Bước 3: Khởi Động Lại Server

```powershell
npm run dev
```

### Bước 4: Đợi Server Khởi Động Xong

Đợi đến khi thấy message:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### Bước 5: Đóng Và Mở Lại Trình Duyệt

1. **Đóng tất cả tab** `localhost:8080`
2. **Đóng trình duyệt hoàn toàn**
3. **Mở trình duyệt mới**
4. **Vào** `http://localhost:8080`

### Bước 6: Kiểm Tra Lại

Mở Console (F12) và gõ:

```javascript
window.__VITE_ENV__
```

**Kết quả mong đợi:**

```javascript
{
  VITE_USE_EMAILJS: "true",
  VITE_EMAILJS_SERVICE_ID: "service_hd1binp",
  VITE_EMAILJS_TEMPLATE_ID: "template_femyln9",
  VITE_EMAILJS_PUBLIC_KEY: "6GFj5AWAFmSL1VNaa",
  MODE: "development"
}
```

Nếu vẫn thấy `undefined` → Xem phần "Nếu Vẫn Không Hoạt Động" bên dưới.

## ⚡ Cách Nhanh: Dùng Script

Nếu có file `restart-dev.ps1`:

```powershell
.\restart-dev.ps1
```

## ❓ Tại Sao Phải Restart?

Vite **chỉ đọc file `.env` khi khởi động**, không đọc lại khi đang chạy. Vì vậy:
- Mỗi lần thay đổi `.env` → Phải restart server
- Mỗi lần tạo `.env` mới → Phải restart server

## 🔍 Nếu Vẫn Không Hoạt Động

1. **Kiểm tra file `.env` có ở đúng vị trí không:**
   - Phải cùng cấp với `package.json`
   - Không phải trong `src/` hoặc thư mục con

2. **Kiểm tra format file `.env`:**
   ```env
   VITE_USE_EMAILJS=true
   VITE_EMAILJS_SERVICE_ID=service_hd1binp
   VITE_EMAILJS_TEMPLATE_ID=template_femyln9
   VITE_EMAILJS_PUBLIC_KEY=6GFj5AWAFmSL1VNaa
   ```
   - Không có khoảng trắng trước/sau dấu `=`
   - Không có dấu ngoặc kép
   - Mỗi dòng một biến

3. **Kiểm tra encoding:**
   - File phải là UTF-8, không có BOM

4. **Thử xóa cache và restart lại:**
   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite
   npm run dev
   ```

