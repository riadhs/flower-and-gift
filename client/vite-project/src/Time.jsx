import useSchedule, { getScheduleForDate, formatTime12h } from "./storeSchedule";

export default function Time({ today }) {
  const date = today instanceof Date ? today : new Date();
  const { weekly, exceptions, loading } = useSchedule();

  if (loading) return <div className="hours"><div className="hoursTime">Loading...</div></div>;

  const { closed, open, close } = getScheduleForDate(date, weekly, exceptions);

  const text = closed ? "Closed" : `${formatTime12h(open)} - ${formatTime12h(close)}`;

  return (
    <div className="hours">
      <div className="hoursTime">{text}</div>
    </div>
  );
}
