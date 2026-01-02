// src/components/Time.jsx
import React from "react";
import { getScheduleForDate, formatTime12h } from "./storeSchedule";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Time({ today }) {
  // today is a Date object (passed from App.jsx)
  const { dayIndex, closed, open, close } = getScheduleForDate(today);

  const dayName = DAY_LABELS[dayIndex];
  const text = closed ? "Closed" : `${formatTime12h(open)} - ${formatTime12h(close)}`;

  return (
    <div className="hours">
      {/* <div className="hoursLabel">{dayName} :</div> */}
      <div className="hoursTime">{text}</div>
    </div>
  );
}
