import React from "react";
import { C, sans } from "../theme/tokens";

export default function TagPill({ children, tone = "primary" }) {
  const bg = tone === "primary" ? C.primary : tone === "green" ? C.green : C.sand;
  const text = tone === "primary" ? C.onPrimary : tone === "green" ? "#FFFBF5" : C.charcoal;

  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 text-xs font-semibold rounded-r-full rounded-l-sm"
      style={{ background: bg, color: text, ...sans }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `${text}55` }} />
      {children}
    </span>
  );
}