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

export function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [hh, mm] = String(timeStr).slice(0, 5).split(":");
  const h = Number(hh);
  const m = Number(mm || 0);

  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function sameDateYYYYMMDD(a, b) {
  const sa = String(a).slice(0, 10);
  const sb = String(b).slice(0, 10);
  return sa === sb;
}

// ✅ use weekly + exceptions to compute today's schedule
export function getScheduleForDate(date, weekly = [], exceptions = []) {
  const d = date instanceof Date ? date : new Date();
  const dayIndex = d.getDay(); // 0..6

  // 1) exceptions override weekly
  const ex = exceptions.find((x) => sameDateYYYYMMDD(x.date, d.toISOString()));
  if (ex) {
    const closed = !!ex.is_closed;
    return {
      dayIndex,
      closed,
      open: closed ? null : String(ex.open_time || "").slice(0, 5),
      close: closed ? null : String(ex.close_time || "").slice(0, 5),
      note: ex.note || "",
      source: "exception",
    };
  }

  // 2) weekly
  const w = weekly.find((x) => Number(x.day_of_week) === dayIndex);

  // If DB is missing a row for that day, assume CLOSED (safer)
  if (!w) {
    return { dayIndex, closed: true, open: null, close: null, source: "missing_weekly_row" };
  }

  const closed = !!w.is_closed;
  return {
    dayIndex,
    closed,
    open: closed ? null : String(w.open_time || "").slice(0, 5),
    close: closed ? null : String(w.close_time || "").slice(0, 5),
    source: "weekly",
  };
}
