// app/EnvChecker.tsx
"use client";

import { useEffect, useState } from "react";

export default function EnvChecker() {
  const [isMissingEnv, setIsMissingEnv] = useState(false);

  useEffect(() => {
    // Kiểm tra biến môi trường
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setIsMissingEnv(true);
    }
  }, []);

  if (!isMissingEnv) return null;

  return (
    // Đã đổi 'top-0' thành 'bottom-0' để nó nằm dưới đáy màn hình
    <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white p-4 text-center z-[9999] font-bold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      ⚠️ Cảnh báo: Chưa cấu hình NEXT_PUBLIC_API_URL!
      <br />
      <span className="text-sm font-normal">
        App đang cố kết nối đến localhost. Hãy cấu hình biến môi trường để chạy
        đúng.
      </span>
    </div>
  );
}
