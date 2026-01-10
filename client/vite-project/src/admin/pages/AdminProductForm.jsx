// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../adminApi";
// import ImageUpload from "../components/ImageUpload";

// export default function AdminProductForm({ mode }) {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const isEdit = mode === "edit";

//   const [form, setForm] = useState({
//     category: "Flower Bouquet",
//     title: "",
//     desc: "",
//     img: "",
//     price: 0,
//   });

//   const [loading, setLoading] = useState(isEdit);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!isEdit) return;
//     (async () => {
//       setError("");
//       setLoading(true);
//       try {
//         const res = await api.get(`/admin/products/${id}`);
//         setForm({
//           category: res.data.category || "",
//           title: res.data.title || "",
//           desc: res.data.desc || "",
//           img: res.data.img || "",
//           price: Number(res.data.price || 0),
//         });
//       } catch (err) {
//         setError(err?.response?.data?.error || "Failed to load product");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id, isEdit]);

//   function setField(name, value) {
//     setForm((f) => ({ ...f, [name]: value }));
//   }

//   async function onSave(e) {
//     e.preventDefault();
//     setError("");
//     setSaving(true);
//     try {
//       if (isEdit) {
//         await api.put(`/admin/products/${id}`, form);
//       } else {
//         await api.post("/admin/products", form);
//       }
//       navigate("/admin/products");
//     } catch (err) {
//       setError(err?.response?.data?.error || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

//   return (
//     <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
//       <button type="button" onClick={() => navigate(-1)}>
//         ← Back
//       </button>

//       <h2 style={{ marginTop: 10 }}>{isEdit ? "Edit Product" : "New Product"}</h2>

//       <form onSubmit={onSave} style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
//         <div>
//           <ImageUpload value={form.img} onChange={(url) => setField("img", url)} />
//         </div>

//         <div style={{ display: "grid", gap: 10 }}>
//           <input
//             value={form.category}
//             onChange={(e) => setField("category", e.target.value)}
//             placeholder="Category"
//           />
//           <input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Title" />
//           <textarea
//             value={form.desc}
//             onChange={(e) => setField("desc", e.target.value)}
//             placeholder="Description"
//             rows={4}
//           />
//           <input
//             value={form.price}
//             onChange={(e) => setField("price", Number(e.target.value))}
//             placeholder="Price"
//             type="number"
//             step="0.01"
//           />

//           {error && <div style={{ color: "crimson" }}>{error}</div>}

//           <button type="submit" disabled={saving}>
//             {saving ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../adminApi";
import ImageUpload from "../components/ImageUpload";

function toCents(price) {
  const n = Number(price);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export default function AdminProductForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [cats, setCats] = useState([]);

  const [form, setForm] = useState({
    category_id: "", // ✅ number (set after categories load)
    title: "",
    desc: "",
    img: "",
    price: 0, // this will be saved as Standard variant
    is_active: true,
  });

  const [loading, setLoading] = useState(true); // start loading until categories loaded
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  // 1) Load categories first (needed for category_id)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCats(data || []);
      } catch (e) {
        // categories failure shouldn't crash, but saving will fail without category_id
        console.error("Failed to load categories", e);
      }
    })();
  }, []);

  // 2) After categories load, load product (edit mode) OR set default category (new mode)
  useEffect(() => {
    (async () => {
      setError("");
      setLoading(true);

      try {
        // If new product: set default category_id once categories exist
        if (!isEdit) {
          if (cats.length && !form.category_id) {
            setForm((f) => ({ ...f, category_id: cats[0].id }));
          }
          return;
        }

        // Edit mode: load the product
        const res = await api.get(`/admin/products/${id}`);

        // Your backend returns: { id, title, description, image_url, category_id, is_active, category }
        const p = res.data;

        // Load variants to derive a price (use the lowest active variant as default)
        let price = 0;
        try {
          const vRes = await api.get(`/admin/products/${id}/variants`);
          const variants = vRes.data || [];
          if (variants.length) {
            price = Number(variants[0].price_cents || 0) / 100;
          }
        } catch (e) {
          // variants might not exist yet; that's okay
        }

        setForm({
          category_id: p.category_id ?? "",
          title: p.title || "",
          desc: p.description || "",
          img: p.image_url || "",
          price,
          is_active: !!p.is_active,
        });
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats, id, isEdit]);

  async function upsertStandardVariant(productId, priceNumber) {
    const price_cents = toCents(priceNumber);

    // Fetch variants
    const vRes = await api.get(`/admin/products/${productId}/variants`);
    const variants = vRes.data || [];

    // Find "Standard" variant (case-insensitive)
    const standard = variants.find(
      (v) => (v.label || "").toLowerCase() === "standard"
    );

    if (!standard) {
      // Create Standard
      await api.post(`/admin/products/${productId}/variants`, {
        label: "Standard",
        price_cents,
        sku: null,
        is_active: true,
      });
      return;
    }

    // Update Standard
    await api.put(`/admin/variants/${standard.id}`, {
      label: "Standard",
      price_cents,
      sku: standard.sku ?? null,
      is_active: true,
    });
  }

  async function onSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // ✅ Map frontend fields to backend schema
      const productPayload = {
        title: form.title,
        description: form.desc,
        image_url: form.img,
        category_id: Number(form.category_id),
        is_active: !!form.is_active,
      };

      if (!productPayload.category_id) {
        throw new Error("Please select a category.");
      }

      if (isEdit) {
        // update product
        await api.put(`/admin/products/${id}`, productPayload);

        // create/update Standard variant for price
        await upsertStandardVariant(Number(id), form.price);
      } else {
        // create product
        const created = await api.post("/admin/products", productPayload);
        const newId = created?.data?.id;

        // create/update Standard variant for price
        if (newId) {
          await upsertStandardVariant(newId, form.price);
        }
      }

      navigate("/admin/products");
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

      <h2 style={{ marginTop: 10 }}>{isEdit ? "Edit Product" : "New Product"}</h2>

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
          {/* ✅ Category dropdown */}
          <select
            value={form.category_id}
            onChange={(e) => setField("category_id", Number(e.target.value))}
          >
            {cats.length === 0 ? (
              <option value="">No categories found</option>
            ) : (
              cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </select>

          <input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Title"
          />

          <textarea
            value={form.desc}
            onChange={(e) => setField("desc", e.target.value)}
            placeholder="Description"
            rows={4}
          />

          <input
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="Price"
            type="number"
            step="0.01"
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
        </div>
      </form>
    </div>
  );
}
