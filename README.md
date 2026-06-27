# 🎀 Gửi em — Website bất ngờ sinh nhật

Một website nhỏ tạo bất ngờ sinh nhật, gồm: màn khoá mật khẩu → menu chính → nhạc → thư tay → album ảnh → bánh sinh nhật 3D → bóng bay kết thúc.

## Cách mở để xem thử

Mở file `index.html` bằng trình duyệt (double click hoặc kéo vào Chrome/Safari/Edge).

> 💡 Một số trình duyệt giới hạn việc phát nhạc/âm thanh khi mở file trực tiếp (`file://`). Nếu nhạc không phát, hãy thử **đăng tải lên một host miễn phí** (Netlify, Vercel, GitHub Pages...) rồi mở bằng đường link `https://...` — mọi thứ sẽ chạy trơn tru hơn nhiều, đặc biệt trên điện thoại.

## Cách tuỳ chỉnh nội dung

Mọi nội dung cần sửa đều nằm gọn trong phần `CONFIG` ở đầu file **`js/app.js`** — không cần sửa HTML/CSS.

### 1. Đổi mã mở khoá (passcode)
```js
passcode: '1308',                       // đổi thành 4 số bạn muốn (ví dụ ngày sinh nhật em)
passcodeHint: 'Gợi ý: sinh nhật của em đó 🎂',  // gợi ý hiển thị khi bấm nút 💡
```

### 2. Đổi ảnh chính ở màn khoá
```js
mainPhoto: 'assets/images/main-photo.svg',
```
Thay file đó bằng ảnh thật của bạn (nên là `.jpg`/`.png`, tỉ lệ ngang ~16:9 đẹp nhất), giữ nguyên tên đường dẫn hoặc đổi tên trong dòng code trên.

### 3. Đổi nhạc
```js
songs: [
  { title: 'Tên bài hát', cover: 'assets/images/cover1.svg', src: 'assets/music/song1.mp3' },
  ...
],
```
Copy file nhạc thật (`.mp3`) vào thư mục `assets/music/`, rồi sửa `src` trỏ đúng tên file. `cover` là ảnh bìa nhỏ hiển thị trong player.

### 4. Đổi nội dung lá thư
```js
letterParagraphs: [
  'Gửi người con gái anh yêu,',
  'Hôm nay là một ngày đặc biệt.',
  '',                 // dòng trống = một khoảng nghỉ
  'Đoạn văn dài...',
  ...
],
```
Mỗi dòng trong danh sách là một đoạn sẽ được "gõ" ra lần lượt.

### 5. Đổi ảnh trong album kỷ niệm
```js
gallery: [
  { src: 'assets/images/photo1.svg', caption: 'Chú thích ảnh' },
  ...
],
```

### 6. Đổi ảnh dán quanh bánh sinh nhật 3D
```js
cakeTopPhotos:    [...],  // ảnh cho tầng trên (nhỏ)
cakeBottomPhotos: [...],  // ảnh cho tầng dưới (to)
cakeTopFaceCount: 6,      // số mặt tầng trên — tăng lên để bánh tròn mượt hơn (ảnh sẽ tự lặp lại nếu ít hơn số mặt)
cakeBottomFaceCount: 10,  // số mặt tầng dưới
```
👉 Bánh có thể **kéo bằng tay để xoay xem các mặt** (giữ chuột/chạm rồi kéo ngang). Khi không chạm vào, bánh sẽ tự xoay nhẹ.

### 7. Đổi ảnh trong bóng bay (màn kết)
```js
balloonPhotos: [...],
```

### 8. Đổi lời chúc cuối cùng
Sửa trực tiếp trong **`index.html`**, tìm dòng:
```html
<p class="balloon-message">Chúc em sinh nhật vui vẻ, hạnh phúc thật nhiều 🎂<br/>Mãi mãi bên em — anh 💞</p>
```

## Cấu trúc thư mục

```
index.html          → toàn bộ khung trang
css/style.css        → toàn bộ giao diện/màu sắc/hoạt ảnh
js/app.js            → toàn bộ logic + nơi sửa nội dung (CONFIG)
assets/images/       → ảnh (hiện là ảnh placeholder, hãy thay bằng ảnh thật)
assets/music/        → nhạc (hiện là âm thanh placeholder, hãy thay bằng nhạc thật)
assets/flowers/      → ảnh hoa cho hiệu ứng "ngập hoa" sau khi mở khoá thành công
assets/pop.mp3       → âm thanh hiệu ứng click nhỏ
```

## Lưu ý ảnh/nhạc placeholder

Toàn bộ ảnh trong `assets/images/*.svg` và nhạc trong `assets/music/*.mp3` hiện tại là **placeholder** (ảnh minh hoạ đơn giản, nhạc là tiếng nền nhẹ) để bạn xem trước bố cục. Hãy thay bằng ảnh và nhạc thật của hai bạn — chỉ cần giữ đúng tên file, hoặc đổi tên trong `CONFIG` ở `js/app.js` cho khớp.

Chúc bạn có một món quà thật ý nghĩa! 💕
