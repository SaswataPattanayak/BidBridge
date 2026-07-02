import React, { useEffect, useState } from "react";

/**
 * Countdown timer to a target ISO date.
 * Props: endTime (ISO string), startTime (ISO), status ('live'|'upcoming'|'ended'), size ('sm'|'md'|'lg')
 */
export default function CountdownTimer({ endTime, startTime, status = "live", size = "md", className = "" }) {
  const target = status === "upcoming" ? startTime : endTime;
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));

  useEffect(() => {
    setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (status === "ended") {
    return <span className={`mono ${sizeClass(size)} text-[#5C5C5C] ${className}`} data-testid="countdown-ended">ENDED</span>;
  }

  const totalSec = Math.floor(remaining / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const urgent = status === "live" && totalSec < 60;

  let text;
  if (d > 0) text = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  else if (h > 0) text = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  else text = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <span
      className={`mono ${sizeClass(size)} ${urgent ? "text-[#CB5A3C]" : status === "upcoming" ? "text-[#5C5C5C]" : "text-[#111]"} ${className}`}
      data-testid="countdown-timer"
    >
      {text}
    </span>
  );
}

function sizeClass(size) {
  switch (size) {
    case "sm": return "text-xs";
    case "lg": return "text-3xl md:text-4xl font-bold tracking-tight";
    default: return "text-sm";
  }
}
