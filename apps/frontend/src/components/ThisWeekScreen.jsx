import React, { useState, useEffect } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchMealPlan,
  addMealPlanEntry,
  removeMealPlanEntry,
  generateGroceryList,
} from "../api/items";
import {
  MealCard,
  EmptySlot,
  AddToWeekModal,
  MealTimeGroup,
} from "./HomeScreen.jsx";
import { C } from "../theme/tokens";

const sans = { fontFamily: "Inter, sans-serif" };
const serif = { fontFamily: "Fraunces, serif" };

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const MEAL_TIMES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "drinks",
];
const MEAL_META = {
  breakfast: { label: "Breakfast", emoji: "🍳", order: 0 },
  lunch: { label: "Lunch", emoji: "🥪", order: 1 },
  dinner: { label: "Dinner", emoji: "🍝", order: 2 },
  snack: { label: "Snack", emoji: "🍎", order: 3 },
  dessert: { label: "Dessert", emoji: "🍰", order: 4 },
  drinks: { label: "Drinks", emoji: "☕", order: 5 },
};

export default function ThisWeekScreen({ onOpenRecipe, userId }) {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [dragState, setDragState] = useState({ dragging: null, overDay: null });
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // mobile day picker

  // Week label
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekLabel = `${fmt(monday)} – ${fmt(sunday)}`;

  // Day dates for mobile picker
  const dayDates = DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });

  const loadPlan = () => {
    if (!userId) return;
    fetchMealPlan(userId)
      .then(setMealPlan)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlan();
  }, [userId]);

  const entriesByDay = {};
  DAYS.forEach((d) => {
    entriesByDay[d] = [];
  });
  if (mealPlan?.meal_plan_entries) {
    for (const entry of mealPlan.meal_plan_entries) {
      if (entriesByDay[entry.day_of_week]) {
        entriesByDay[entry.day_of_week].push(entry);
      }
    }
  }

  const handleRemoveEntry = async (entry) => {
    try {
      await removeMealPlanEntry(entry.id);
      setMealPlan((prev) => ({
        ...prev,
        meal_plan_entries: prev.meal_plan_entries.filter(
          (e) => e.id !== entry.id,
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateGroceryList = async () => {
    if (!userId) return;
    setGenerating(true);
    setGenerated(false);
    try {
      await generateGroceryList(userId);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDragStart = (entry) =>
    setDragState({ dragging: entry, overDay: null });
  const handleDragEnd = () => setDragState({ dragging: null, overDay: null });

  const handleDrop = async (targetDay, targetMealTime) => {
    const sourceEntry = dragState.dragging;
    if (!sourceEntry) return;
    if (
      sourceEntry.day_of_week === targetDay &&
      sourceEntry.meal_time === targetMealTime
    ) {
      setDragState({ dragging: null, overDay: null });
      return;
    }
    try {
      await addMealPlanEntry(
        userId,
        sourceEntry.recipe_id,
        targetDay,
        targetMealTime,
      );
      await removeMealPlanEntry(sourceEntry.id);
      loadPlan();
    } catch (err) {
      console.error("Failed to move meal:", err);
    }
    setDragState({ dragging: null, overDay: null });
  };

  // ── Mobile single day view ──
  const MobileDayView = () => {
    const dayKey = DAYS[selectedDayIndex];
    const entries = entriesByDay[dayKey];
    const grouped = {};
    MEAL_TIMES.forEach((mt) => {
      grouped[mt] = [];
    });
    for (const entry of entries) {
      if (grouped[entry.meal_time]) grouped[entry.meal_time].push(entry);
    }
    const activeMealTimes = MEAL_TIMES.filter(
      (mt) =>
        grouped[mt].length > 0 || ["breakfast", "lunch", "dinner"].includes(mt),
    );

    return (
      <div className="flex flex-col gap-3 px-4 py-3">
        {activeMealTimes.map((mt) => {
          const meta = MEAL_META[mt];
          return (
            <div key={mt}>
              <div className="flex items-center justify-between mb-1.5">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                  style={{ ...sans, color: C.faint }}
                >
                  <span>{meta.emoji}</span> {meta.label}
                </p>
                <button
                  onClick={() => setAddModal({ day: dayKey, mealTime: mt })}
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: C.sand }}
                >
                  <Plus size={10} color={C.muted} />
                </button>
              </div>
              {grouped[mt].length === 0 ? (
                <button
                  onClick={() => setAddModal({ day: dayKey, mealTime: mt })}
                  className="w-full rounded-xl flex items-center justify-center h-14"
                  style={{ border: `1px dashed ${C.line}`, color: C.faint }}
                >
                  <Plus size={16} />
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {grouped[mt].map((entry) =>
                    entry.recipes ? (
                      <MealCard
                        key={entry.id}
                        meal={entry.recipes}
                        entry={entry}
                        onOpen={onOpenRecipe}
                        onRemove={handleRemoveEntry}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isDragging={dragState.dragging?.id === entry.id}
                      />
                    ) : null,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Desktop day column ──
  const DayColumn = ({ dayKey, dayLabel, entries }) => {
    const grouped = {};
    MEAL_TIMES.forEach((mt) => {
      grouped[mt] = [];
    });
    for (const entry of entries) {
      if (grouped[entry.meal_time]) grouped[entry.meal_time].push(entry);
    }
    const activeMealTimes = MEAL_TIMES.filter(
      (mt) =>
        grouped[mt].length > 0 || ["breakfast", "lunch", "dinner"].includes(mt),
    );
    return (
      <div
        className="group rounded-2xl p-2.5 flex flex-col gap-2.5"
        style={{
          background: C.card,
          border: `1px solid ${dragState.overDay === dayKey ? C.primary : C.line}`,
          minHeight: 320,
          transition: "border-color 0.15s",
        }}
      >
        <p
          className="text-[10px] font-bold text-center tracking-widest"
          style={{ ...sans, color: C.muted }}
        >
          {dayLabel}
        </p>
        {activeMealTimes.map((mt) => (
          <MealTimeGroup
            key={mt}
            mealTime={mt}
            entries={grouped[mt]}
            onOpenRecipe={onOpenRecipe}
            onRemoveEntry={handleRemoveEntry}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={(mealTime) => handleDrop(dayKey, mealTime)}
            onAddClick={(mealTime) => setAddModal({ day: dayKey, mealTime })}
          />
        ))}
        {MEAL_TIMES.filter(
          (mt) =>
            !["breakfast", "lunch", "dinner"].includes(mt) &&
            grouped[mt].length === 0,
        ).length > 0 && (
          <button
            onClick={() => setAddModal({ day: dayKey, mealTime: "snack" })}
            className="rounded-xl flex items-center justify-center h-8 w-full transition-colors mt-auto"
            style={{ border: `1px dashed ${C.line}`, color: C.faint }}
          >
            <Plus size={13} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col" style={{ background: C.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-7 flex-shrink-0">
        <div>
          <h1
            className="text-xl md:text-2xl mb-0.5"
            style={{ ...serif, fontWeight: 600, color: C.charcoal }}
          >
            This Week
          </h1>
          <p className="text-xs md:text-sm" style={{ ...sans, color: C.muted }}>
            {weekLabel}
          </p>
        </div>
        <button
          onClick={handleGenerateGroceryList}
          disabled={generating}
          className="px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-sm transition-all"
          style={{
            ...sans,
            background: generated ? C.green : C.primary,
            color: "#fff",
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? (
            "Generating..."
          ) : generated ? (
            "✓ Ready!"
          ) : (
            <>
              <span className="hidden md:inline">Generate grocery list</span>
              <span className="md:hidden">🛒 Generate</span>
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ ...sans, color: C.muted }}>Loading your week...</p>
        </div>
      ) : (
        <>
          {/* ── MOBILE: Day picker + single day view ── */}
          <div className="md:hidden flex-1 overflow-y-auto">
            {/* Day picker strip */}
            <div
              className="flex items-center px-4 pb-3 gap-1 overflow-x-auto"
              style={{ borderBottom: `1px solid ${C.line}` }}
            >
              {DAYS.map((dayKey, i) => {
                const isActive = selectedDayIndex === i;
                const hasEntries = entriesByDay[dayKey].length > 0;
                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDayIndex(i)}
                    className="flex flex-col items-center gap-0.5 rounded-xl py-2 flex-1 min-w-[40px] transition-all"
                    style={{
                      background: isActive ? C.charcoal : "transparent",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ ...sans, color: isActive ? "#FFFBF5" : C.muted }}
                    >
                      {DAY_SHORT[i]}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        ...sans,
                        color: isActive ? "#FFFBF5" : C.charcoal,
                      }}
                    >
                      {dayDates[i]}
                    </span>
                    {hasEntries && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isActive ? C.primary : C.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Day navigator arrows */}
            <div className="flex items-center justify-between px-4 py-2">
              <button
                onClick={() => setSelectedDayIndex((i) => Math.max(0, i - 1))}
                disabled={selectedDayIndex === 0}
                className="flex items-center gap-1 text-xs font-semibold disabled:opacity-30"
                style={{ ...sans, color: C.muted }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <p
                className="text-sm font-semibold"
                style={{ ...serif, color: C.charcoal }}
              >
                {DAY_LABELS[selectedDayIndex]}
              </p>
              <button
                onClick={() => setSelectedDayIndex((i) => Math.min(6, i + 1))}
                disabled={selectedDayIndex === 6}
                className="flex items-center gap-1 text-xs font-semibold disabled:opacity-30"
                style={{ ...sans, color: C.muted }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>

            <MobileDayView />
          </div>

          {/* ── DESKTOP: 7-column grid ── */}
          <div className="hidden md:block flex-1 overflow-y-auto px-8 pb-7">
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((dayKey, i) => (
                <DayColumn
                  key={dayKey}
                  dayKey={dayKey}
                  dayLabel={DAY_LABELS[i]}
                  entries={entriesByDay[dayKey]}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add to week modal */}
      {addModal && (
        <AddToWeekModal
          recipe={addModal.recipe || null}
          userId={userId}
          defaultDay={addModal.day}
          defaultMealTime={addModal.mealTime}
          onClose={() => setAddModal(null)}
          onAdded={() => {
            setAddModal(null);
            loadPlan();
          }}
        />
      )}
    </div>
  );
}
