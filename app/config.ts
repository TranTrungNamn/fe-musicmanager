// File này chịu trách nhiệm lấy link từ biến môi trường
// Nếu không tìm thấy (ví dụ quên set), nó sẽ dùng mặc định là localhost
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
