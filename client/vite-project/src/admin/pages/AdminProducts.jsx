
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../adminApi";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/admin/products"); // -> /api/admin/products
      setProducts(res.data || []);
    } catch (e) {
      console.error("AdminProducts load error:", e);
      setErr(e?.response?.data?.error || e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deactivateProduct(id) {
    if (!confirm("Deactivate this product? It will be hidden from users.")) return;
    try {
      await api.delete(`/admin/products/${id}`); // soft delete
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || "Deactivate failed");
    }
  }

  async function deleteProductHard(id) {
    if (
      !confirm(
        "DELETE PERMANENTLY?\n\nThis will remove the product forever (including variants). This cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/admin/products/${id}/hard`); // hard delete
      await load();
    } catch (e) {
      alert(e?.response?.data?.error || "Hard delete failed");
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Products</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => navigate("/admin/schedule")}>Schedule</button>
          <button type="button" onClick={() => navigate("/admin/categories")}>Categories</button>
          <button type="button" onClick={() => navigate("/admin/addons")}>Add-ons</button>
          <button type="button" onClick={() => navigate("/admin/products/new")}>
            + New Product
          </button>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 10 }}>Loading...</div>}
      {err && <div style={{ color: "crimson", padding: 10 }}>{err}</div>}

      {!loading && !err && products.length === 0 && (
        <div style={{ padding: 10, opacity: 0.8 }}>No products found.</div>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {products.map((p) => {
          const isActive = Number(p.is_active ?? p.isActive ?? 0) === 1;
          const imgUrl = p.image_url || p.img || "";

          return (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr auto",
                gap: 12,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 12,
                alignItems: "center",
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <img
                src={imgUrl}
                alt={p.title}
                style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 10 }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />

              <div>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div style={{ opacity: 0.7 }}>{p.category || "—"}</div>
                <div style={{ opacity: 0.7 }}>Status: {isActive ? "Active" : "Inactive"}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                
                <button type="button" onClick={() => navigate(`/admin/products/${p.id}`)}>
                  Edit
                </button>

                <button type="button" onClick={() => deactivateProduct(p.id)}>
                  Deactivate
                </button>

                <button
                  type="button"
                  onClick={() => deleteProductHard(p.id)}
                  style={{ marginLeft: 8 }}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
