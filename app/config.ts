// app/config.ts

// Nếu không có biến môi trường, dùng chuỗi rỗng để code không bị crash,
// nhưng EnvChecker sẽ hiện thông báo lỗi đỏ cho bạn biết.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
