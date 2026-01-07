// app/EnvChecker.tsx
"use client"; // Bắt buộc dòng này để chạy ở phía Client

import { useEffect, useState } from "react";

export default function EnvChecker() {
  const [isMissingEnv, setIsMissingEnv] = useState(false);

  useEffect(() => {
    // Kiểm tra xem biến môi trường có giá trị không
    // Lưu ý: Next.js sẽ replace giá trị này lúc build
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setIsMissingEnv(true);
    }
  }, []);

  if (!isMissingEnv) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white p-4 text-center z-[9999] font-bold shadow-lg">
      ⚠️ Cảnh báo: Chưa cấu hình NEXT_PUBLIC_API_URL!
      <br />
      <span className="text-sm font-normal">
        App đang cố kết nối đến localhost. Nếu bạn không chạy Backend trên máy
        này, tính năng sẽ bị lỗi.
      </span>
    </div>
  );
}
