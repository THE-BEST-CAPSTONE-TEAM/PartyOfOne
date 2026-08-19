import React from "react";
import { C, serif, sans } from "../theme/tokens";
import { WEEK } from "../data/mockData";
import MealCard from "./MealCard";
import EmptySlot from "./EmptySlot";

export default function ThisWeekScreen({ onOpenRecipe }) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekLabel = `${fmt(monday)} – ${fmt(sunday)}`;
  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-7"
      style={{ background: C.bg }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl mb-1"
            style={{ ...serif, fontWeight: 600, color: C.charcoal }}
          >
            This Week
          </h1>
          <p className="text-sm" style={{ ...sans, color: C.muted }}>
            {weekLabel}
          </p>
        </div>
        <button
          className="px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm"
          style={{ ...sans, background: C.primary, color: C.onPrimary }}
        >
          Generate grocery list
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {WEEK.map((d) => (
          <div
            key={d.day}
            className="rounded-2xl p-2.5 flex flex-col gap-2"
            style={{
              background: C.card,
              border: `1px solid ${C.line}`,
              minHeight: 320,
            }}
          >
            <p
              className="text-[10px] font-bold text-center tracking-widest"
              style={{ ...sans, color: C.muted }}
            >
              {d.day}
            </p>
            {d.meals.map((m, i) => (
              <MealCard key={i} meal={m} onOpen={onOpenRecipe} />
            ))}
            <EmptySlot onClick={onOpenRecipe} />
          </div>
        ))}
      </div>
    </div>
  );
}
