import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../adminApi";
import ImageUpload from "../components/ImageUpload";

function toCents(price) {
  const n = Number(price);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/**
 * Admin Add-on Form
 * Supports:
 * - Add-on with single price (no variants)
 * - Add-on with variants (checkbox on + variant editor)
 *
 * Backend expectation:
 * Addon: { id, title, image_url, is_active, has_variants? }
 * Variants: { id, addon_id, label, price_cents, is_active }
 */
export default function AdminAddonForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: "",
    img: "",
    price: 0, // used when NO variants
    is_active: true,
    has_variants: false, // toggle
  });

  // simple variants editor
  const [variants, setVariants] = useState([]); // [{id?, label, price, is_active}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function setVariantField(idx, name, value) {
    setVariants((arr) => {
      const copy = [...arr];
      copy[idx] = { ...copy[idx], [name]: value };
      return copy;
    });
  }

  function addVariantRow() {
    setVariants((v) => [
      ...v,
      { id: null, label: "", price: 0, is_active: true },
    ]);
  }

  function removeVariantRow(idx) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  async function loadAddonAndVariants(addonId) {
    const res = await api.get(`/admin/addons/${addonId}`);
    const a = res.data;

    // load variants (if exist)
    let loadedVariants = [];
    try {
      const vRes = await api.get(`/admin/addons/${addonId}/variants`);
      loadedVariants = (vRes.data || []).map((v) => ({
        id: v.id,
        label: v.label || "",
        price: Number(v.price_cents || 0) / 100,
        is_active: !!v.is_active,
      }));
    } catch (e) {
      // if endpoint not present or no variants, ignore
    }

    const hasVariants = loadedVariants.length > 0;

    setForm({
      title: a.title || "",
      img: a.image_url || "",
      price:
        hasVariants
          ? 0
          : typeof a.price_cents === "number"
          ? a.price_cents / 100
          : 0,
      is_active: !!a.is_active,
      has_variants: hasVariants,
    });

    setVariants(loadedVariants);
  }

  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);
      try {
        if (isEdit) {
          await loadAddonAndVariants(id);
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load add-on");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  async function saveAddonBase(addonPayload) {
    if (isEdit) {
      await api.put(`/admin/addons/${id}`, addonPayload);
      return Number(id);
    } else {
      const created = await api.post(`/admin/addons`, addonPayload);
      return created?.data?.id;
    }
  }

  async function saveVariants(addonId) {
    // Basic rules
    const cleaned = variants
      .map((v) => ({
        ...v,
        label: (v.label || "").trim(),
        price: Number(v.price),
      }))
      .filter((v) => v.label.length > 0); // ignore empty rows

    if (cleaned.length === 0) {
      throw new Error("Add at least 1 variant (or turn off variants).");
    }

    // Upsert each row
    for (const v of cleaned) {
      const payload = {
        label: v.label,
        price_cents: toCents(v.price),
        is_active: !!v.is_active,
      };

      if (!v.id) {
        // create
        await api.post(`/admin/addons/${addonId}/variants`, payload);
      } else {
        // update
        // ✅ adjust path if yours is different
        await api.put(`/admin/addon-variants/${v.id}`, payload);
      }
    }
  }

  async function onSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Base addon payload
      const addonPayload = {
        title: form.title,
        image_url: form.img,
        is_active: !!form.is_active,
      };

      if (!addonPayload.title?.trim()) {
        throw new Error("Title is required.");
      }

      // if no variants, include base price (optional depending on schema)
      if (!form.has_variants) {
        addonPayload.price_cents = toCents(form.price);
      }

      const addonId = await saveAddonBase(addonPayload);

      // variants mode: create/update variants
      if (form.has_variants && addonId) {
        await saveVariants(addonId);
      }

      navigate("/admin/addons");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Save failed");
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

      <h2 style={{ marginTop: 10 }}>{isEdit ? "Edit Add-on" : "New Add-on"}</h2>

      <form
        onSubmit={onSave}
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
          <ImageUpload value={form.img} onChange={(url) => setField("img", url)} />
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Title"
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={!!form.has_variants}
              onChange={(e) => setField("has_variants", e.target.checked)}
            />
            This add-on has variants (dropdown)
          </label>

          {!form.has_variants && (
            <input
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="Price"
              type="number"
              step="0.01"
            />
          )}

          {form.has_variants && (
            <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Variants</strong>
                <button type="button" onClick={addVariantRow}>
                  + Add Variant
                </button>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {variants.length === 0 && (
                  <div style={{ opacity: 0.7 }}>
                    No variants yet. Click “Add Variant”.
                  </div>
                )}

                {variants.map((v, idx) => (
                  <div
                    key={v.id ?? `new-${idx}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 110px 44px",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      value={v.label}
                      onChange={(e) => setVariantField(idx, "label", e.target.value)}
                      placeholder="Label (e.g. Small box)"
                    />

                    <input
                      value={v.price}
                      onChange={(e) => setVariantField(idx, "price", e.target.value)}
                      placeholder="Price"
                      type="number"
                      step="0.01"
                    />

                    <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={!!v.is_active}
                        onChange={(e) => setVariantField(idx, "is_active", e.target.checked)}
                      />
                      Active
                    </label>

                    <button type="button" onClick={() => removeVariantRow(idx)} title="Remove">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </div>
      </form>
    </div>
  );
}
