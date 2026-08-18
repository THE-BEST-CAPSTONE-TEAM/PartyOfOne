import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  BookOpen,
  ShoppingBasket,
  Heart,
  Settings,
  X,
  Clock,
  Flame,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import {
  fetchMealPlan,
  addMealPlanEntry,
  removeMealPlanEntry,
  generateGroceryList,
} from "../api/items";
import "tailwindcss";

const C = {
  bg: "#f7f8ef",
  sidebarBg: "#FBF6EC",
  card: "#FFFFFF",
  sand: "#F0E6D8",
  line: "#E9DCC5",
  charcoal: "#2B2B2B",
  muted: "#8A7F6D",
  faint: "#B9AD98",
  primary: "#ff3131",
  onPrimary: "#2B2B2B",
  green: "#154202",
  coral: "#ff3131",
};

const serif = { fontFamily: "Fraunces, serif" };
const sans = { fontFamily: "Inter, sans-serif" };

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
const MEAL_TIMES = ["breakfast", "lunch", "dinner", "snack"];

// ── Shared UI primitives ──────────────────────

export function TagPill({ children, tone = "primary" }) {
  const bg =
    tone === "primary" ? C.primary : tone === "green" ? C.green : C.sand;
  const text =
    tone === "primary"
      ? C.onPrimary
      : tone === "green"
        ? "#FFFBF5"
        : C.charcoal;
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 text-xs font-semibold rounded-r-full rounded-l-sm"
      style={{ background: bg, color: text, ...sans }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: `${text}55` }}
      />
      {children}
    </span>
  );
}

export function Checkbox({ checked, onClick, tone = "primary" }) {
  const fill = tone === "primary" ? C.primary : C.green;
  const mark = tone === "primary" ? C.onPrimary : "#FFFBF5";
  return (
    <button
      onClick={onClick}
      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
      style={{
        borderColor: checked ? fill : "#D8CDBB",
        background: checked ? fill : "transparent",
      }}
    >
      {checked && <Check size={12} strokeWidth={3} color={mark} />}
    </button>
  );
}

// ── Sidebar ───────────────────────────────────

export function Sidebar({ active, onNavigate }) {
  const items = [
    { key: "week", label: "This Week", icon: Calendar },
    { key: "recipes", label: "Recipes", icon: BookOpen },
    { key: "grocery", label: "Grocery List", icon: ShoppingBasket },
    { key: "saved", label: "Saved", icon: Heart },
  ];
  return (
    <div
      className="flex flex-col gap-1 py-6 px-4 flex-shrink-0"
      style={{
        width: 210,
        background: C.sidebarBg,
        borderRight: `1px solid ${C.line}`,
      }}
    >
      <div className="flex items-center gap-2 px-2 mb-1">
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 48, height: 48, background: C.primary }}
        >
          <img
            src="./src/assets/Logo.png"
            alt="logo"
            style={{ width: 48, height: 48, objectFit: "contain" }}
          />
        </div>
        <span
          className="text-base font-semibold"
          style={{ ...serif, fontWeight: 600, color: C.charcoal }}
        >
          Table
        </span>
      </div>
      <p
        className="px-2 text-[11px] leading-snug mb-6"
        style={{ ...sans, color: C.muted }}
      >
        Stop negotiating with your fridge.
      </p>
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onNavigate(key)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
          style={{
            ...sans,
            fontWeight: active === key ? 600 : 500,
            background: active === key ? C.sand : "transparent",
            color: active === key ? C.charcoal : C.muted,
          }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={() => onNavigate("settings")}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
        style={{
          ...sans,
          fontWeight: active === "settings" ? 600 : 500,
          background: active === "settings" ? C.sand : "transparent",
          color: active === "settings" ? C.charcoal : C.muted,
        }}
      >
        <Settings size={16} />
        Settings
      </button>
    </div>
  );
}

// ── Draggable Meal Card ───────────────────────

export function MealCard({
  meal,
  entry,
  onOpen,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}) {
  const photo =
    meal.photo_url ||
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80";

  // ✅ Emoji + label per meal time
  const MEAL_LABELS = {
    breakfast: { label: "Breakfast", emoji: "🍳" },
    lunch: { label: "Lunch", emoji: "🥪" },
    dinner: { label: "Dinner", emoji: "🍝" },
    snack: { label: "Snack", emoji: "🍎" },
    dessert: { label: "Dessert", emoji: "🍰" },
    drinks: { label: "Drinks", emoji: "☕" },
  };

  const mealLabel = MEAL_LABELS[entry?.meal_time] || {
    label: entry?.meal_time,
    emoji: "🍽",
  };

  return (
    <div className="relative group">
      {/* ✅ Meal time label above the card */}
      <p
        className="text-[9px] font-bold uppercase tracking-widest mb-1 px-1 flex items-center gap-1"
        style={{ ...sans, color: C.faint }}
      >
        <span>{mealLabel.emoji}</span>
        {mealLabel.label}
      </p>

      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart(entry);
        }}
        onDragEnd={onDragEnd}
        onClick={() => onOpen(meal)}
        className="text-left rounded-xl overflow-hidden w-full cursor-grab active:cursor-grabbing"
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          opacity: isDragging ? 0.4 : 1,
          transform: isDragging ? "scale(0.97)" : "scale(1)",
          transition: "opacity 0.15s, transform 0.15s",
        }}
      >
        <div className="h-16 w-full overflow-hidden pointer-events-none">
          <img
            src={photo}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="px-2.5 py-2 pointer-events-none">
          <p
            className="text-xs font-semibold leading-snug"
            style={{ ...sans, color: C.charcoal }}
          >
            {meal.name}
          </p>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entry);
          }}
          className="absolute top-5 right-1 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex z-10"
          style={{ background: "rgba(255,251,245,0.9)" }}
        >
          <X size={10} color={C.charcoal} />
        </button>
      )}
    </div>
  );
}

// ── Drop Zone (empty slot or between cards) ───

function DropZone({ onDrop, isOver }) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={onDrop}
      className="rounded-xl flex items-center justify-center h-10 flex-shrink-0 transition-all duration-150"
      style={{
        border: `1px dashed ${isOver ? C.primary : C.line}`,
        background: isOver ? `${C.primary}10` : "transparent",
        color: isOver ? C.primary : C.faint,
      }}
    >
      <Plus size={16} />
    </div>
  );
}

export function EmptySlot({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl flex items-center justify-center h-10 flex-shrink-0 transition-colors"
      style={{ border: `1px dashed ${C.line}`, color: C.faint }}
    >
      <Plus size={16} />
    </button>
  );
}

// ── Day Column with drag/drop ─────────────────

function DayColumn({
  dayKey,
  dayLabel,
  entries,
  onOpenRecipe,
  onRemoveEntry,
  dragState,
  onDragStart,
  onDragEnd,
  onDrop,
  onEmptyClick,
}) {
  const [overZone, setOverZone] = useState(null); // index of which drop zone is hovered

  const handleDragOver = (e, zoneIdx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverZone(zoneIdx);
  };

  const handleDragLeave = () => setOverZone(null);

  const handleDrop = (e, zoneIdx) => {
    e.preventDefault();
    setOverZone(null);
    onDrop(dayKey, zoneIdx);
  };

  return (
    <div
      className="rounded-2xl p-2.5 flex flex-col gap-2"
      style={{
        background: C.card,
        border: `1px solid ${dragState.overDay === dayKey ? C.primary : C.line}`,
        minHeight: 320,
        transition: "border-color 0.15s",
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <p
        className="text-[10px] font-bold text-center tracking-widest"
        style={{ ...sans, color: C.muted }}
      >
        {dayLabel}
      </p>

      {/* Drop zone before first card */}
      {dragState.dragging && (
        <div
          className="rounded-xl transition-all duration-150 flex items-center justify-center"
          style={{
            height: overZone === -1 ? 40 : 8,
            background: overZone === -1 ? `${C.primary}10` : "transparent",
            border: overZone === -1 ? `1px dashed ${C.primary}` : "none",
          }}
          onDragOver={(e) => handleDragOver(e, -1)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, -1)}
        />
      )}

      {entries.map((entry, idx) => (
        <React.Fragment key={entry.id}>
          {entry.recipes && (
            <MealCard
              meal={entry.recipes}
              entry={entry}
              onOpen={onOpenRecipe}
              onRemove={onRemoveEntry}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={dragState.dragging?.id === entry.id}
            />
          )}
          {/* Drop zone after each card */}
          {dragState.dragging && (
            <div
              className="rounded-xl transition-all duration-150 flex items-center justify-center"
              style={{
                height: overZone === idx ? 40 : 8,
                background: overZone === idx ? `${C.primary}10` : "transparent",
                border: overZone === idx ? `1px dashed ${C.primary}` : "none",
              }}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
            />
          )}
        </React.Fragment>
      ))}

      {/* Empty slot — only shown when not dragging */}
      {!dragState.dragging && <EmptySlot onClick={onEmptyClick} />}

      {/* Full column drop target when dragging and column is empty */}
      {dragState.dragging && entries.length === 0 && (
        <div
          className="flex-1 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{
            border: `1px dashed ${overZone === 0 ? C.primary : C.line}`,
            background: overZone === 0 ? `${C.primary}10` : "transparent",
            minHeight: 60,
          }}
          onDragOver={(e) => handleDragOver(e, 0)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 0)}
        >
          <p
            className="text-xs"
            style={{ ...sans, color: overZone === 0 ? C.primary : C.faint }}
          >
            Drop here
          </p>
        </div>
      )}
    </div>
  );
}

// ── This Week Screen ──────────────────────────

export function ThisWeekScreen({ onOpenRecipe, userId }) {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Drag state: { dragging: entry | null, overDay: string | null }
  const [dragState, setDragState] = useState({ dragging: null, overDay: null });

  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekLabel = `${fmt(monday)} – ${fmt(sunday)}`;

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

  // ── Remove entry ──
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

  // ── Generate grocery list ──
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

  // ── Drag handlers ──
  const handleDragStart = (entry) => {
    setDragState({ dragging: entry, overDay: null });
  };

  const handleDragEnd = () => {
    setDragState({ dragging: null, overDay: null });
  };

  const handleDrop = async (targetDay, zoneIdx) => {
    const sourceEntry = dragState.dragging;
    if (!sourceEntry) return;

    const sourceDay = sourceEntry.day_of_week;
    const sourceMealTime = sourceEntry.meal_time;

    // Find what's in the target slot
    const targetEntries = entriesByDay[targetDay];

    // If dropped on same day do nothing
    if (sourceDay === targetDay) {
      setDragState({ dragging: null, overDay: null });
      return;
    }

    // Determine target meal time — use same meal time as source
    const targetMealTime = sourceMealTime;

    // Check if target slot is occupied
    const targetEntry = targetEntries.find(
      (e) => e.meal_time === targetMealTime,
    );

    try {
      if (targetEntry) {
        // Swap: move target recipe to source day, move source recipe to target day
        await Promise.all([
          addMealPlanEntry(
            userId,
            sourceEntry.recipe_id,
            targetDay,
            targetMealTime,
          ),
          addMealPlanEntry(
            userId,
            targetEntry.recipe_id,
            sourceDay,
            sourceMealTime,
          ),
        ]);
      } else {
        // Move: just move source to target
        await Promise.all([
          addMealPlanEntry(
            userId,
            sourceEntry.recipe_id,
            targetDay,
            targetMealTime,
          ),
          removeMealPlanEntry(sourceEntry.id),
        ]);
      }
      // Reload plan to reflect changes
      loadPlan();
    } catch (err) {
      console.error("Failed to move meal:", err);
    }

    setDragState({ dragging: null, overDay: null });
  };

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
        <div className="flex items-center gap-3">
          {dragState.dragging && (
            <p className="text-xs" style={{ ...sans, color: C.muted }}>
              Drop on another day to move or swap
            </p>
          )}
          <button
            onClick={handleGenerateGroceryList}
            disabled={generating}
            className="px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all"
            style={{
              ...sans,
              background: generated ? C.green : C.primary,
              color: C.onPrimary,
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating
              ? "Generating..."
              : generated
                ? "✓ List ready!"
                : "Generate grocery list"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((d) => (
            <div
              key={d}
              className="rounded-2xl p-2.5 animate-pulse"
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                minHeight: 320,
              }}
            >
              <div
                className="h-3 rounded mb-3"
                style={{ background: C.sand, width: "40%", margin: "0 auto" }}
              />
              <div className="h-20 rounded-xl" style={{ background: C.sand }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((dayKey, i) => (
            <DayColumn
              key={dayKey}
              dayKey={dayKey}
              dayLabel={DAY_LABELS[i]}
              entries={entriesByDay[dayKey]}
              onOpenRecipe={onOpenRecipe}
              onRemoveEntry={handleRemoveEntry}
              dragState={dragState}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onEmptyClick={() => setAddingTo({ day: dayKey })}
            />
          ))}
        </div>
      )}

      {/* Hint modal when clicking empty slot */}
      {addingTo && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: "rgba(43,43,43,0.5)" }}
          onClick={() => setAddingTo(null)}
        >
          <div
            className="rounded-2xl p-6 w-80 shadow-2xl"
            style={{ background: C.card }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-base font-semibold"
                style={{ ...serif, color: C.charcoal }}
              >
                Add a meal
              </h3>
              <button onClick={() => setAddingTo(null)}>
                <X size={16} color={C.muted} />
              </button>
            </div>
            <p className="text-sm" style={{ ...sans, color: C.muted }}>
              Go to <strong style={{ color: C.charcoal }}>Recipes</strong> and
              tap <strong style={{ color: C.charcoal }}>"+ Add to week"</strong>{" "}
              on any recipe, or{" "}
              <strong style={{ color: C.charcoal }}>drag</strong> an existing
              meal from another day into this slot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recipe Detail Modal ───────────────────────

export function RecipeDetailModal({ recipe: recipeProp, onClose, userId }) {
  const [servings, setServings] = useState(recipeProp?.servings || 1);
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState({});
  const [showAddToWeek, setShowAddToWeek] = useState(false);
  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const recipe = recipeProp || {};
  const title = recipe.name || "Recipe";
  const photo =
    recipe.photo_url ||
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80";
  const tags =
    recipe.recipe_tags?.map((rt) => rt.tags?.name).filter(Boolean) || [];
  const cookTime = recipe.cook_time
    ? `${recipe.cook_time} min`
    : recipe.prep_time
      ? `${recipe.prep_time} min`
      : null;
  const calories = recipe.calories_per_serving
    ? `${recipe.calories_per_serving} cal`
    : null;
  const ingredients = recipe.ingredients || [];
  const steps = recipe.preparation_steps?.map((s) => s.instruction) || [];

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-8"
      style={{ background: "rgba(43,43,43,0.45)" }}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl grid"
        style={{
          gridTemplateColumns: "360px 1fr",
          maxHeight: "88vh",
          background: C.bg,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,251,245,0.9)" }}
        >
          <X size={16} color={C.charcoal} />
        </button>

        {/* Left */}
        <div
          className="p-6 overflow-y-auto"
          style={{ borderRight: `1px solid ${C.line}` }}
        >
          <img
            src={photo}
            alt={title}
            className="w-full h-44 object-cover rounded-xl mb-4"
          />
          <h2
            className="text-xl mb-2 leading-tight"
            style={{ ...serif, fontWeight: 600, color: C.charcoal }}
          >
            {title}
          </h2>
          {tags.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {tags.map((tag, i) => (
                <TagPill key={tag} tone={i === 0 ? "green" : "primary"}>
                  {tag}
                </TagPill>
              ))}
            </div>
          )}
          <div
            className="flex items-center gap-4 mb-5"
            style={{ ...sans, color: C.muted }}
          >
            {cookTime && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock size={13} /> {cookTime}
              </div>
            )}
            {calories && (
              <div className="flex items-center gap-1.5 text-xs">
                <Flame size={13} /> {calories}
              </div>
            )}
          </div>
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4"
            style={{ background: C.sand }}
          >
            <span
              className="text-xs font-semibold"
              style={{ ...sans, color: C.charcoal }}
            >
              Servings
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: C.bg }}
              >
                <Minus size={12} color={C.charcoal} />
              </button>
              <span
                className="text-sm font-semibold w-3 text-center"
                style={{ ...sans, color: C.charcoal }}
              >
                {servings}
              </span>
              <button
                onClick={() => setServings((s) => s + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: C.primary }}
              >
                <Plus size={12} color={C.onPrimary} />
              </button>
            </div>
          </div>
          <button
            onClick={() => setSaved((s) => !s)}
            className="w-full py-2.5 rounded-full text-xs font-semibold mb-2 flex items-center justify-center gap-2"
            style={{
              ...sans,
              border: `1.5px solid ${C.line}`,
              color: C.charcoal,
            }}
          >
            <Heart
              size={13}
              color={saved ? C.coral : C.charcoal}
              fill={saved ? C.coral : "none"}
            />
            {saved ? "Saved" : "Save recipe"}
          </button>
          <button
            onClick={() => setShowAddToWeek(true)}
            className="w-full py-2.5 rounded-full text-xs font-semibold shadow-sm mb-2"
            style={{ ...sans, background: C.primary, color: C.onPrimary }}
          >
            + Add to week
          </button>
          <button
            className="w-full py-2.5 rounded-full text-xs font-semibold"
            style={{
              ...sans,
              border: `1.5px solid ${C.line}`,
              color: C.charcoal,
            }}
          >
            Add ingredients to grocery list
          </button>
        </div>

        {/* Right */}
        <div className="p-6 overflow-y-auto">
          <h3
            className="text-sm font-bold mb-3"
            style={{ ...serif, fontWeight: 600, color: C.charcoal }}
          >
            Ingredients
          </h3>
          <div className="mb-6">
            {ingredients.length === 0 && (
              <p className="text-sm" style={{ ...sans, color: C.faint }}>
                No ingredients listed.
              </p>
            )}
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center gap-3 py-2 border-b"
                style={{ borderColor: C.line }}
              >
                <Checkbox
                  checked={!!checked[ing.id]}
                  onClick={() => toggle(ing.id)}
                />
                <span
                  className="flex-1 text-sm"
                  style={{
                    ...sans,
                    color: checked[ing.id] ? C.faint : C.charcoal,
                    textDecoration: checked[ing.id] ? "line-through" : "none",
                  }}
                >
                  {ing.name}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ ...sans, color: C.muted }}
                >
                  {ing.quantity
                    ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ""}`
                    : ing.qty || ""}
                </span>
              </div>
            ))}
          </div>
          <h3
            className="text-sm font-bold mb-3"
            style={{ ...serif, fontWeight: 600, color: C.charcoal }}
          >
            Steps
          </h3>
          <div className="flex flex-col gap-4">
            {steps.length === 0 && (
              <p className="text-sm" style={{ ...sans, color: C.faint }}>
                No steps listed.
              </p>
            )}
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{
                    border: `1.5px solid ${C.charcoal}`,
                    color: C.charcoal,
                    ...sans,
                  }}
                >
                  {i + 1}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ ...sans, color: C.charcoal }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add to week modal */}
      {showAddToWeek && recipe.id && (
        <AddToWeekModal
          recipe={recipe}
          userId={userId}
          onClose={() => setShowAddToWeek(false)}
          onAdded={() => setShowAddToWeek(false)}
        />
      )}
    </div>
  );
}

// ── Add to Week Modal ─────────────────────────

function AddToWeekModal({ recipe, userId, onClose, onAdded }) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedMealTime, setSelectedMealTime] = useState(MEAL_TIMES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    setSaving(true);
    setError("");
    try {
      await addMealPlanEntry(userId, recipe.id, selectedDay, selectedMealTime);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add to plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(43,43,43,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-80 shadow-2xl"
        style={{ background: C.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-semibold"
            style={{ ...serif, color: C.charcoal }}
          >
            Add to week
          </h3>
          <button onClick={onClose}>
            <X size={16} color={C.muted} />
          </button>
        </div>
        <p className="text-xs mb-4" style={{ ...sans, color: C.muted }}>
          Adding <strong style={{ color: C.charcoal }}>{recipe.name}</strong>
        </p>
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-widest"
          style={{ ...sans, color: C.faint }}
        >
          Day
        </p>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                ...sans,
                background: selectedDay === day ? C.charcoal : C.sand,
                color: selectedDay === day ? "#FFFBF5" : C.muted,
              }}
            >
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-widest"
          style={{ ...sans, color: C.faint }}
        >
          Meal
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {MEAL_TIMES.map((mt) => (
            <button
              key={mt}
              onClick={() => setSelectedMealTime(mt)}
              className="py-2 rounded-xl text-xs font-semibold capitalize transition-colors"
              style={{
                ...sans,
                background: selectedMealTime === mt ? C.charcoal : C.sand,
                color: selectedMealTime === mt ? "#FFFBF5" : C.muted,
              }}
            >
              {mt}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-xs mb-3" style={{ ...sans, color: C.primary }}>
            {error}
          </p>
        )}
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full py-2.5 rounded-full text-sm font-semibold transition-opacity"
          style={{
            ...sans,
            background: C.primary,
            color: C.onPrimary,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Adding..." : "Add to plan"}
        </button>
      </div>
    </div>
  );
}
