"use client";

// LoginForm.js - Form đăng nhập admin. Gọi server action loginAction,
// hiện lỗi nếu mật khẩu sai.

import { useActionState } from "react";

export default function LoginForm({ action }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="admin-login">
      <h1>Đăng nhập quản trị</h1>
      <form action={formAction}>
        {state?.error && <div className="admin-error">{state.error}</div>}
        <div className="admin-field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Nhập mật khẩu admin"
          />
        </div>
        <button className="admin-btn" type="submit" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
