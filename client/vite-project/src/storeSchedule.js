
export const WEEKLY_SCHEDULE = {
  sun: { closed: false, open: "10:00", close: "21:00" },
  mon: { closed: false, open: "10:00", close: "21:00" },
  tue: { closed: false, open: "10:00", close: "21:00" },
  wed: { closed: false, open: "10:00", close: "21:00" },
  thu: { closed: false, open: "10:00", close: "21:00" },
  fri: { closed: false, open: "10:00", close: "21:00" },
  sat: { closed: false, open: "10:00", close: "21:00" },
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function getScheduleForDate(date, schedule = WEEKLY_SCHEDULE) {
  const dayIndex = date.getDay(); // 0=Sun ... 6=Sat
  const key = DAY_KEYS[dayIndex];
  const entry = schedule[key] || { closed: true, open: "00:00", close: "00:00" };

  return {
    dayIndex,
    key,
    ...entry, // closed, open, close
  };
}

export function formatTime12h(time24) {
  // "21:00" -> "9:00 pm"
  const [hhStr, mm] = time24.split(":");
  let hh = Number(hhStr);
  const ampm = hh >= 12 ? "pm" : "am";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${mm} ${ampm}`;
}
