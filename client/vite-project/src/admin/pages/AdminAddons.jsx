// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../adminApi";

// export default function AdminAddons() {
//   const navigate = useNavigate();
//   const [addons, setAddons] = useState([]);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   async function load() {
//     setErr("");
//     setLoading(true);
//     try {
//       const res = await api.get("/admin/addons");
//       setAddons(res.data || []);
//     } catch (e) {
//       setErr(e?.response?.data?.error || e.message || "Failed to load add-ons");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   async function deactivateAddon(id) {
//     if (!confirm("Deactivate this add-on? It will be hidden from users.")) return;
//     await api.delete(`/admin/addons/${id}`); // soft delete (you'll create this route)
//     await load();
//   }

//   async function hardDeleteAddon(id) {
//     if (
//       !confirm(
//         "DELETE PERMANENTLY?\n\nThis will remove the add-on forever (including variants). This cannot be undone."
//       )
//     )
//       return;
//     await api.delete(`/admin/addons/${id}/hard`); // hard delete (you'll create this route)
//     await load();
//   }

//   return (
//     <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h2>Admin Add-ons</h2>

//         <div style={{ display: "flex", gap: 10 }}>
//           <button type="button" onClick={() => navigate("/admin/products")}>
//             Products
//           </button>
//           <button type="button" onClick={() => navigate("/admin/addons/new")}>
//             + New Add-on
//           </button>
//         </div>
//       </div>

//       {loading && <div style={{ padding: 10 }}>Loading...</div>}
//       {err && <div style={{ color: "crimson", padding: 10 }}>{err}</div>}

//       <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
//         {addons.map((a) => (
//           <div
//             key={a.id}
//             style={{
//               display: "grid",
//               gridTemplateColumns: "70px 1fr auto",
//               gap: 12,
//               padding: 12,
//               border: "1px solid #ddd",
//               borderRadius: 12,
//               alignItems: "center",
//             }}
//           >
//             <img
//               src={a.image_url || ""}
//               alt={a.title}
//               style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 10 }}
//               onError={(e) => (e.currentTarget.style.display = "none")}
//             />

//             <div>
//               <div style={{ fontWeight: 800 }}>{a.title}</div>
//               <div style={{ opacity: 0.7 }}>Active: {String(a.is_active)}</div>
//               {"has_variants" in a && (
//                 <div style={{ opacity: 0.7 }}>Variants: {a.has_variants ? "Yes" : "No"}</div>
//               )}
//             </div>

//             <div style={{ display: "flex", gap: 8 }}>
//               <button type="button" onClick={() => navigate(`/admin/addons/${a.id}`)}>
//                 Edit
//               </button>
//               <button type="button" onClick={() => deactivateAddon(a.id)}>
//                 Deactivate
//               </button>
//               <button type="button" onClick={() => hardDeleteAddon(a.id)}>
//                 Delete Permanently
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../adminApi";

export default function AdminAddons() {
  const navigate = useNavigate();
  const [addons, setAddons] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/admin/addons");
      setAddons(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deactivateAddon(id) {
    if (!confirm("Deactivate this add-on? It will be hidden from users.")) return;
    await api.delete(`/admin/addons/${id}`); // soft delete
    await load();
  }

  async function hardDeleteAddon(id) {
    if (
      !confirm(
        "DELETE PERMANENTLY?\n\nThis will remove the add-on forever (including variants). This cannot be undone."
      )
    )
      return;
    await api.delete(`/admin/addons/${id}/hard`); // hard delete
    await load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Add-ons</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => navigate("/admin/products")}>
            Products
          </button>
          <button type="button" onClick={() => navigate("/admin/addons/new")}>
            + New Add-on
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 10 }}>Loading...</div>}
      {err && <div style={{ color: "crimson", padding: 10 }}>{err}</div>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {addons.map((a) => {
          // ✅ define active per row (handles boolean or 0/1)
          const active = a.is_active === true || a.is_active === 1 || a.is_active === "1";

          return (
            <div
              key={a.id}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr auto",
                gap: 12,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 12,
                alignItems: "center",
                opacity: active ? 1 : 0.6,
              }}
            >
              <img
                src={a.image_url || a.img || ""}
                alt={a.title}
                style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 10 }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />

              <div>
                <div style={{ fontWeight: 800 }}>{a.title}</div>
                <div style={{ opacity: 0.7 }}>Status: {active ? "Active" : "Inactive"}</div>

                {"has_variants" in a && (
                  <div style={{ opacity: 0.7 }}>Variants: {a.has_variants ? "Yes" : "No"}</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => navigate(`/admin/addons/${a.id}`)}>
                  Edit
                </button>

                {active ? (
                  <button type="button" onClick={() => deactivateAddon(a.id)}>
                    Deactivate
                  </button>
                ) : (
                  <button type="button" disabled title="Add activate route if you want">
                    Inactive
                  </button>
                )}

                <button type="button" onClick={() => hardDeleteAddon(a.id)}>
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
