import React from "react";
import { C, sans } from "../theme/tokens";

export default function MealCard({ meal, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-xl overflow-hidden flex-shrink-0 group"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="h-16 w-full overflow-hidden">
        <img
          src={meal.photo}
          alt={meal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="px-2.5 py-2">
        <p className="text-xs font-semibold leading-snug" style={{ ...sans, color: C.charcoal }}>
          {meal.title}
        </p>
      </div>
    </button>
  );
}