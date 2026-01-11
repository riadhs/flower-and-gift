import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../adminApi";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/admin/categories");
      setCats(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deactivate(id) {
    if (!confirm("Deactivate this category?")) return;
    await api.delete(`/admin/categories/${id}`);
    await load();
  }

  async function hardDelete(id) {
    if (!confirm("DELETE PERMANENTLY? This cannot be undone.")) return;
    await api.delete(`/admin/categories/${id}/hard`);
    await load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Categories</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => navigate("/admin/products")}>
            Products
          </button>
          <button type="button" onClick={() => navigate("/admin/categories/new")}>
            + New Category
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 10 }}>Loading...</div>}
      {err && <div style={{ color: "crimson", padding: 10 }}>{err}</div>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {cats.map((c) => {
          const active = c.is_active === undefined ? true : !!c.is_active;

          return (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{c.name}</div>
                <div style={{ opacity: 0.7 }}>slug: {c.slug}</div>
                {"is_active" in c && (
                  <div style={{ opacity: 0.7 }}>Status: {active ? "Active" : "Inactive"}</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => navigate(`/admin/categories/${c.id}`)}>
                  Edit
                </button>

                {"is_active" in c && (
                  <button type="button" onClick={() => deactivate(c.id)}>
                    Deactivate
                  </button>
                )}

                <button type="button" onClick={() => hardDelete(c.id)}>
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
