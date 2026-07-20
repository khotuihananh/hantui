// auth.js - Đăng nhập admin đơn giản bằng cookie (CHỈ dùng server).
// So khớp mật khẩu với ADMIN_PASSWORD trong .env.local, rồi đặt cookie phiên.

import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";

// Giá trị cookie khi đã đăng nhập. Dựa trên mật khẩu để cookie cũ tự vô hiệu
// khi bạn đổi mật khẩu (không dùng Math.random/Date).
function sessionValue() {
  const pass = process.env.ADMIN_PASSWORD || "";
  return `ok_${pass.length}_${pass.slice(0, 2)}`;
}

export function checkPassword(input) {
  const pass = process.env.ADMIN_PASSWORD || "";
  return Boolean(pass) && input === pass;
}

export async function createSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isLoggedIn() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === sessionValue();
}
