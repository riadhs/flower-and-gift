import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../adminApi";

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategoryForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    slug: "",
    is_active: true, // only used if your DB has it
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const res = await api.get("/admin/categories");
        const row = (res.data || []).find((x) => String(x.id) === String(id));
        if (!row) throw new Error("Category not found");

        setForm({
          name: row.name || "",
          slug: row.slug || "",
          is_active: row.is_active === undefined ? true : !!row.is_active,
        });
      } catch (e) {
        setError(e?.response?.data?.error || e.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  async function onSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug ? slugify(form.slug) : slugify(form.name),
        is_active: !!form.is_active,
      };

      if (isEdit) {
        await api.put(`/admin/categories/${id}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }

      navigate("/admin/categories");
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <button type="button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 style={{ marginTop: 10 }}>{isEdit ? "Edit Category" : "New Category"}</h2>

      <form onSubmit={onSave} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Category name (ex: Flower Bouquet)"
        />

        <input
          value={form.slug}
          onChange={(e) => setField("slug", e.target.value)}
          placeholder="Slug (optional, ex: flower-bouquet)"
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => setField("is_active", e.target.checked)}
          />
          Active
        </label>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
