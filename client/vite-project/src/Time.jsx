import useSchedule from "./storeSchedule"; // your hook (same file name ok)
import { getScheduleForDate, formatTime12h } from "./storeSchedule";

export default function Time({ today }) {
  const date = today instanceof Date ? today : new Date();

  const { weekly, exceptions, loading } = useSchedule();

  if (loading) {
    return (
      <div className="hours">
        <div className="hoursTime">Loading hours...</div>
      </div>
    );
  }

  const s = getScheduleForDate(date, weekly, exceptions);

  const text = s.closed
    ? "Closed"
    : `${formatTime12h(s.open)} - ${formatTime12h(s.close)}`;

  return (
    <div className="hours">
      <div className="hoursTime">{text}</div>
      {/* optional debug */}
      {/* <div style={{ fontSize: 12, opacity: 0.6 }}>source: {s.source}</div> */}
    </div>
  );
}
