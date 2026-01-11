// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../adminApi";

// const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// export default function AdminSchedule() {
//   const navigate = useNavigate();
//   const [weekly, setWeekly] = useState([]);
//   const [exceptions, setExceptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // new exception form
//   const [ex, setEx] = useState({
//     date: "",
//     is_closed: false,
//     open_time: "09:00",
//     close_time: "17:00",
//     note: "",
//   });

//   async function load() {
//     setErr("");
//     setLoading(true);
//     try {
//       const res = await api.get("/admin/schedule");
//       setWeekly(res.data.weekly || []);
//       setExceptions(res.data.exceptions || []);
//     } catch (e) {
//       setErr(e?.response?.data?.error || e.message || "Failed to load schedule");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { load(); }, []);

//   async function saveDay(day, patch) {
//     await api.put(`/admin/schedule/weekly/${day}`, patch);
//     await load();
//   }

//   async function saveException() {
//     if (!ex.date) return alert("Pick a date");
//     await api.put("/admin/schedule/exceptions", ex);
//     setEx({ date: "", is_closed: false, open_time: "09:00", close_time: "17:00", note: "" });
//     await load();
//   }

//   async function deleteException(id) {
//     if (!confirm("Delete this exception?")) return;
//     await api.delete(`/admin/schedule/exceptions/${id}`);
//     await load();
//   }

//   return (
//     <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <h2>Store Schedule</h2>
//         <div style={{ display: "flex", gap: 10 }}>
//           <button type="button" onClick={() => navigate("/admin/products")}>Products</button>
//           <button type="button" onClick={() => navigate("/admin/addons")}>Add-ons</button>
//         </div>
//       </div>

//       {loading && <div style={{ padding: 10 }}>Loading...</div>}
//       {err && <div style={{ color: "crimson", padding: 10 }}>{err}</div>}

//       {!loading && !err && (
//         <>
//           <h3 style={{ marginTop: 20 }}>Weekly hours</h3>

//           <div style={{ display: "grid", gap: 10 }}>
//             {weekly.map((d) => (
//               <div
//                 key={d.day_of_week}
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "90px 120px 1fr 1fr auto",
//                   gap: 10,
//                   alignItems: "center",
//                   border: "1px solid #ddd",
//                   padding: 10,
//                   borderRadius: 10,
//                 }}
//               >
//                 <div style={{ fontWeight: 700 }}>{DAYS[d.day_of_week]}</div>

//                 <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                   <input
//                     type="checkbox"
//                     checked={!!d.is_closed}
//                     onChange={(e) =>
//                       saveDay(d.day_of_week, { is_closed: e.target.checked, open_time: d.open_time, close_time: d.close_time })
//                     }
//                   />
//                   Closed
//                 </label>

//                 <input
//                   type="time"
//                   value={(d.open_time || "09:00").slice(0,5)}
//                   disabled={!!d.is_closed}
//                   onChange={(e) =>
//                     saveDay(d.day_of_week, { is_closed: !!d.is_closed, open_time: e.target.value, close_time: d.close_time })
//                   }
//                 />

//                 <input
//                   type="time"
//                   value={(d.close_time || "17:00").slice(0,5)}
//                   disabled={!!d.is_closed}
//                   onChange={(e) =>
//                     saveDay(d.day_of_week, { is_closed: !!d.is_closed, open_time: d.open_time, close_time: e.target.value })
//                   }
//                 />

//                 <button
//                   type="button"
//                   onClick={() => saveDay(d.day_of_week, d)}
//                 >
//                   Save
//                 </button>
//               </div>
//             ))}
//           </div>

//           <h3 style={{ marginTop: 28 }}>Exceptions (holidays / special days)</h3>

//           <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
//             <div style={{ display: "grid", gridTemplateColumns: "160px 120px 1fr 1fr 1fr", gap: 10 }}>
//               <input type="date" value={ex.date} onChange={(e) => setEx((p) => ({ ...p, date: e.target.value }))} />

//               <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                 <input
//                   type="checkbox"
//                   checked={!!ex.is_closed}
//                   onChange={(e) => setEx((p) => ({ ...p, is_closed: e.target.checked }))}
//                 />
//                 Closed
//               </label>

//               <input
//                 type="time"
//                 disabled={!!ex.is_closed}
//                 value={ex.open_time}
//                 onChange={(e) => setEx((p) => ({ ...p, open_time: e.target.value }))}
//               />

//               <input
//                 type="time"
//                 disabled={!!ex.is_closed}
//                 value={ex.close_time}
//                 onChange={(e) => setEx((p) => ({ ...p, close_time: e.target.value }))}
//               />

//               <button type="button" onClick={saveException}>Add/Update</button>
//             </div>

//             <input
//               style={{ marginTop: 10, width: "100%" }}
//               placeholder="Note (optional)"
//               value={ex.note}
//               onChange={(e) => setEx((p) => ({ ...p, note: e.target.value }))}
//             />
//           </div>

//           <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
//             {exceptions.map((x) => (
//               <div
//                 key={x.id}
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "130px 120px 1fr auto",
//                   gap: 10,
//                   alignItems: "center",
//                   border: "1px solid #eee",
//                   padding: 10,
//                   borderRadius: 10,
//                 }}
//               >
//                 <div style={{ fontWeight: 700 }}>{String(x.date).slice(0, 10)}</div>
//                 <div>{x.is_closed ? "Closed" : `${String(x.open_time).slice(0,5)}–${String(x.close_time).slice(0,5)}`}</div>
//                 <div style={{ opacity: 0.8 }}>{x.note || ""}</div>
//                 <button type="button" onClick={() => deleteException(x.id)}>Delete</button>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../adminApi";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeTime(t, fallback) {
  if (!t) return fallback;
  // handle "09:00:00" -> "09:00"
  return String(t).slice(0, 5);
}

export default function AdminSchedule() {
  const navigate = useNavigate();

  const [weekly, setWeekly] = useState([]);
  const [weeklyDraft, setWeeklyDraft] = useState({}); // day_of_week -> {is_closed, open_time, close_time}

  const [exceptions, setExceptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null); // day index while saving
  const [savingEx, setSavingEx] = useState(false);
  const [err, setErr] = useState("");

  // new exception form
  const [ex, setEx] = useState({
    date: "",
    is_closed: false,
    open_time: "09:00",
    close_time: "17:00",
    note: "",
  });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/admin/schedule");
      const w = res.data.weekly || [];
      const x = res.data.exceptions || [];

      setWeekly(w);
      setExceptions(x);

      // build draft from server data (so edits start from current values)
      const draft = {};
      for (const d of w) {
        draft[d.day_of_week] = {
          is_closed: !!d.is_closed,
          open_time: normalizeTime(d.open_time, "09:00"),
          close_time: normalizeTime(d.close_time, "17:00"),
        };
      }
      setWeeklyDraft(draft);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setDraft(day, patch) {
    setWeeklyDraft((prev) => ({
      ...prev,
      [day]: { ...(prev[day] || {}), ...patch },
    }));
  }

  function isDirty(day) {
    const server = weekly.find((d) => d.day_of_week === day);
    const draft = weeklyDraft[day];
    if (!server || !draft) return false;

    const sClosed = !!server.is_closed;
    const sOpen = normalizeTime(server.open_time, "09:00");
    const sClose = normalizeTime(server.close_time, "17:00");

    return (
      sClosed !== !!draft.is_closed ||
      sOpen !== normalizeTime(draft.open_time, "09:00") ||
      sClose !== normalizeTime(draft.close_time, "17:00")
    );
  }

  async function saveDay(day) {
    const draft = weeklyDraft[day];
    if (!draft) return;

    setSavingDay(day);
    setErr("");

    try {
      await api.put(`/admin/schedule/weekly/${day}`, {
        is_closed: !!draft.is_closed,
        open_time: draft.open_time,
        close_time: draft.close_time,
      });

      // ✅ notify public site to refetch schedule (your useSchedule listens to this)
      localStorage.setItem("schedule_updated_at", String(Date.now()));

      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to save day");
    } finally {
      setSavingDay(null);
    }
  }

  async function saveException() {
    if (!ex.date) return alert("Pick a date");

    setSavingEx(true);
    setErr("");

    try {
      await api.put("/admin/schedule/exceptions", {
        ...ex,
        open_time: normalizeTime(ex.open_time, "09:00"),
        close_time: normalizeTime(ex.close_time, "17:00"),
      });

      // ✅ notify public site
      localStorage.setItem("schedule_updated_at", String(Date.now()));

      setEx({ date: "", is_closed: false, open_time: "09:00", close_time: "17:00", note: "" });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to save exception");
    } finally {
      setSavingEx(false);
    }
  }

  async function deleteException(id) {
    if (!confirm("Delete this exception?")) return;

    setErr("");
    try {
      await api.delete(`/admin/schedule/exceptions/${id}`);

      // ✅ notify public site
      localStorage.setItem("schedule_updated_at", String(Date.now()));

      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to delete exception");
    }
  }

  const weeklyRows = useMemo(() => {
    // If server doesn't return all 7 rows, you still want 0..6 displayed
    const byDay = new Map(weekly.map((d) => [d.day_of_week, d]));
    return Array.from({ length: 7 }, (_, day) => byDay.get(day) || { day_of_week: day, is_closed: false, open_time: "09:00", close_time: "17:00" });
  }, [weekly]);

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Store Schedule</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => navigate("/admin/products")}>Products</button>
          <button type="button" onClick={() => navigate("/admin/addons")}>Add-ons</button>
        </div>
      </div>

      {loading && <div style={{ padding: 10 }}>Loading...</div>}
      {err && <div style={{ color: "crimson", padding: 10 }}>{err}</div>}

      {!loading && (
        <>
          <h3 style={{ marginTop: 20 }}>Weekly hours</h3>

          <div style={{ display: "grid", gap: 10 }}>
            {weeklyRows.map((serverRow) => {
              const day = serverRow.day_of_week;
              const d = weeklyDraft[day] || {
                is_closed: !!serverRow.is_closed,
                open_time: normalizeTime(serverRow.open_time, "09:00"),
                close_time: normalizeTime(serverRow.close_time, "17:00"),
              };

              const dirty = isDirty(day);

              return (
                <div
                  key={day}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 120px 1fr 1fr auto",
                    gap: 10,
                    alignItems: "center",
                    border: "1px solid #ddd",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{DAYS[day]}</div>

                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!d.is_closed}
                      onChange={(e) => setDraft(day, { is_closed: e.target.checked })}
                    />
                    Closed
                  </label>

                  <input
                    type="time"
                    value={normalizeTime(d.open_time, "09:00")}
                    disabled={!!d.is_closed}
                    onChange={(e) => setDraft(day, { open_time: e.target.value })}
                  />

                  <input
                    type="time"
                    value={normalizeTime(d.close_time, "17:00")}
                    disabled={!!d.is_closed}
                    onChange={(e) => setDraft(day, { close_time: e.target.value })}
                  />

                  <button
                    type="button"
                    onClick={() => saveDay(day)}
                    disabled={!dirty || savingDay === day}
                    title={!dirty ? "No changes" : ""}
                  >
                    {savingDay === day ? "Saving..." : "Save"}
                  </button>
                </div>
              );
            })}
          </div>

          <h3 style={{ marginTop: 28 }}>Exceptions (holidays / special days)</h3>

          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 120px 1fr 1fr 1fr", gap: 10 }}>
              <input
                type="date"
                value={ex.date}
                onChange={(e) => setEx((p) => ({ ...p, date: e.target.value }))}
              />

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!ex.is_closed}
                  onChange={(e) => setEx((p) => ({ ...p, is_closed: e.target.checked }))}
                />
                Closed
              </label>

              <input
                type="time"
                disabled={!!ex.is_closed}
                value={normalizeTime(ex.open_time, "09:00")}
                onChange={(e) => setEx((p) => ({ ...p, open_time: e.target.value }))}
              />

              <input
                type="time"
                disabled={!!ex.is_closed}
                value={normalizeTime(ex.close_time, "17:00")}
                onChange={(e) => setEx((p) => ({ ...p, close_time: e.target.value }))}
              />

              <button type="button" onClick={saveException} disabled={savingEx}>
                {savingEx ? "Saving..." : "Add/Update"}
              </button>
            </div>

            <input
              style={{ marginTop: 10, width: "100%" }}
              placeholder="Note (optional)"
              value={ex.note}
              onChange={(e) => setEx((p) => ({ ...p, note: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {exceptions.map((x) => (
              <div
                key={x.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 120px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>{String(x.date).slice(0, 10)}</div>
                <div>
                  {x.is_closed
                    ? "Closed"
                    : `${String(x.open_time).slice(0, 5)}–${String(x.close_time).slice(0, 5)}`}
                </div>
                <div style={{ opacity: 0.8 }}>{x.note || ""}</div>
                <button type="button" onClick={() => deleteException(x.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
