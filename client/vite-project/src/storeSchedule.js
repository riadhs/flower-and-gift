import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const publicApi = axios.create({ baseURL: "/api" });

export default function useSchedule() {
  const [data, setData] = useState({ weekly: [], exceptions: [] });
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    const res = await publicApi.get("/schedule");
    setData(res.data || { weekly: [], exceptions: [] });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await fetchSchedule();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchSchedule]);

  // ✅ refresh schedule when admin updates it
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "schedule_updated_at") fetchSchedule();
    };

    const onCustom = () => fetchSchedule();

    window.addEventListener("storage", onStorage); // other tabs
    window.addEventListener("schedule_updated", onCustom); // same tab

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("schedule_updated", onCustom);
    };
  }, [fetchSchedule]);

  return { ...data, loading, refetch: fetchSchedule };
}


function sameDateYYYYMMDD(a, b) {
  const sa = String(a).slice(0, 10);
  const sb = String(b).slice(0, 10);
  return sa === sb;
}


const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function getScheduleForDate(date, weekly = [], exceptions = []) {
  const dayIndex = date.getDay(); // 0..6

  // Convert local date -> YYYY-MM-DD (local)
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const isoLocal = `${yyyy}-${mm}-${dd}`;

  // ✅ 1) exception overrides weekly
  const ex = (exceptions || []).find((x) => String(x.date).slice(0, 10) === isoLocal);
  if (ex) {
    const closed = !!ex.is_closed;
    return {
      source: "exception",
      dayIndex,
      key: DAY_KEYS[dayIndex],
      closed,
      open: closed ? null : normalizeTime(ex.open_time),
      close: closed ? null : normalizeTime(ex.close_time),
      note: ex.note || "",
    };
  }

  // ✅ 2) weekly fallback
  const w = (weekly || []).find((x) => Number(x.day_of_week) === dayIndex);
  if (w) {
    const closed = !!w.is_closed;
    return {
      source: "weekly",
      dayIndex,
      key: DAY_KEYS[dayIndex],
      closed,
      open: closed ? null : normalizeTime(w.open_time),
      close: closed ? null : normalizeTime(w.close_time),
      note: "",
    };
  }

  // ✅ 3) default fallback if DB empty
  return {
    source: "default",
    dayIndex,
    key: DAY_KEYS[dayIndex],
    closed: true,
    open: null,
    close: null,
    note: "",
  };
}

function normalizeTime(t) {
  if (!t) return null;
  // handles "09:00:00" -> "09:00"
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [hh, mm] = String(timeStr).split(":");
  let h = Number(hh);
  const m = Number(mm || 0);

  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
}
