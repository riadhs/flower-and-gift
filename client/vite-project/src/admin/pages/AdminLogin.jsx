import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../adminApi";
import { setAdminToken } from "../auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@flowergift.com");
  const [password, setPassword] = useState("change_this_now");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      setAdminToken(res.data.token);
      navigate("/admin/products");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Admin Login</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
