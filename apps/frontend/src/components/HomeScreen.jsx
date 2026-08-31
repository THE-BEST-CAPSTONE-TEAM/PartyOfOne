import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchMealPlan,
  addMealPlanEntry,
  removeMealPlanEntry,
  generateGroceryList,
  fetchRecipes,
} from "../api/items";
import "tailwindcss";
import logo from "../assets/Logo.png";
import { EditPhotoButton, DEFAULT_RECIPE_PHOTO } from "./PhotoUpload";

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
      <div className="flex flex-col items-center px-2 mb-2">
        <div
          className="flex items-center justify-center rounded-2xl overflow-hidden mb-3"
          style={{ width: 80, height: 80, background: C.primary }}
        >
          <img
            src={logo}
            alt="logo"
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </div>
        <p
          className="text-center leading-snug mb-6"
          style={{ ...sans, fontSize: 13, fontWeight: 700, color: C.charcoal }}
        >
          Stop negotiating
          <br />
          <span style={{ color: C.primary }}>with your fridge.</span>
        </p>
      </div>
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

export function EmptySlot({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl flex items-center justify-center h-8 w-full flex-shrink-0 transition-colors"
      style={{ border: `1px dashed ${C.line}`, color: C.faint }}
    >
      <Plus size={14} />
    </button>
  );
}

// ── Meal Card ─────────────────────────────────

export function MealCard({
  meal,
  entry,
  onOpen,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  isSelected,
  onTapSelect,
}) {
  const photo =
    meal.photo_url ||
    "https://images.unsplash.com/photo-1614548540093-6f7dfceed46b?w=600&q=80";

  const lastTapTime = useRef(0);
  const lastTapTimer = useRef(null);

  const handleClick = () => {
    if (window.innerWidth >= 768) {
      onOpen(meal);
      return;
    }

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    lastTapTime.current = now;

    if (timeSinceLastTap < 300) {
      // Double tap — select for moving
      clearTimeout(lastTapTimer.current);
      onTapSelect(entry);
    } else {
      // Single tap — wait to see if double tap follows
      clearTimeout(lastTapTimer.current);
      lastTapTimer.current = setTimeout(() => {
        onOpen(meal);
      }, 300);
    }
  };

  return (
    <div className="relative group">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart(entry);
        }}
        onDragEnd={onDragEnd}
        onClick={handleClick}
        className="text-left rounded-xl overflow-hidden w-full cursor-grab active:cursor-grabbing select-none"
        style={{
          background: C.card,
          border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? C.primary : C.line}`,
          opacity: isDragging ? 0.4 : 1,
          transform: isDragging
            ? "scale(0.97)"
            : isSelected
              ? "scale(1.02)"
              : "scale(1)",
          transition: "opacity 0.15s, transform 0.15s",
          userSelect: "none",
          WebkitUserSelect: "none",
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
          className="absolute top-1 right-1 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex z-10"
          style={{ background: "rgba(255,251,245,0.9)" }}
        >
          <X size={10} color={C.charcoal} />
        </button>
      )}
    </div>
  );
}

// ── Meal Time Group ───────────────────────────
// Groups cards under a labelled section per meal time

function MealTimeGroup({
  mealTime,
  entries,
  onOpenRecipe,
  onRemoveEntry,
  dragState,
  onDragStart,
  onDragEnd,
  onDrop,
  onAddClick,
  selectedEntry, // ✅ new
  onTapSelect, // ✅ new
  onTapDrop, // ✅ new
}) {
  const meta = MEAL_META[mealTime] || {
    label: mealTime,
    emoji: "🍽",
    order: 99,
  };
  const [isOver, setIsOver] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      {/* Meal time label */}
      <div className="flex items-center justify-between">
        <p
          className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
          style={{ ...sans, color: C.faint }}
        >
          <span>{meta.emoji}</span> {meta.label}
        </p>
        {/* Small + button to add another recipe to this meal time */}
        <button
          onClick={() => onAddClick(mealTime)}
          className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: C.sand }}
          title={`Add another ${meta.label}`}
        >
          <Plus size={9} color={C.muted} />
        </button>
      </div>

      {/* Cards for this meal time */}
      {entries.map((entry) =>
        entry.recipes ? (
          <MealCard
            key={entry.id}
            meal={entry.recipes}
            entry={entry}
            onOpen={onOpenRecipe}
            onRemove={onRemoveEntry}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={dragState.dragging?.id === entry.id}
            isSelected={selectedEntry?.id === entry.id} // ✅ new
            onTapSelect={onTapSelect}
          />
        ) : null,
      )}

      {/* Drop zone for desktop drag */}
      {dragState.dragging && (
        <div
          data-mealtime={mealTime}
          data-dropzone="true"
          className="rounded-xl flex items-center justify-center transition-all duration-150"
          style={{
            height: isOver ? 36 : 20,
            border: `1px dashed ${isOver ? C.primary : C.line}`,
            background: isOver ? `${C.primary}10` : "transparent",
            color: isOver ? C.primary : C.faint,
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsOver(false);
            onDrop(mealTime);
          }}
        >
          {isOver && (
            <p className="text-[9px]" style={{ ...sans }}>
              Drop here
            </p>
          )}
        </div>
      )}

      {/* Mobile tap target when entry selected */}
      {/* Mobile tap target when entry selected */}
      {selectedEntry && window.innerWidth < 768 && (
        <button
          onClick={() => onTapDrop(mealTime)}
          className="rounded-xl flex items-center justify-center w-full transition-all"
          style={{
            height: 36,
            border: `1px dashed ${C.primary}`,
            background: `${C.primary}10`,
            color: C.primary,
          }}
        >
          <p className="text-[9px] font-semibold" style={{ ...sans }}>
            Move here
          </p>
        </button>
      )}
    </div>
  );
}

// ── Day Column ────────────────────────────────

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
  onAddClick,
  selectedEntry, // ✅ new
  onTapSelect, // ✅ new
  onTapDrop,
}) {
  // Sort entries by meal time order and group them
  const grouped = {};
  MEAL_TIMES.forEach((mt) => {
    grouped[mt] = [];
  });
  for (const entry of entries) {
    if (grouped[entry.meal_time]) {
      grouped[entry.meal_time].push(entry);
    }
  }

  // Only show meal time sections that have entries or are breakfast/lunch/dinner
  const activeMealTimes = MEAL_TIMES.filter(
    (mt) =>
      grouped[mt].length > 0 || ["breakfast", "lunch", "dinner"].includes(mt),
  );

  return (
    <div
      data-daykey={dayKey}
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
          onRemoveEntry={onRemoveEntry}
          dragState={dragState}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrop={(mealTime) => onDrop(dayKey, mealTime)}
          onAddClick={(mealTime) => onAddClick(dayKey, mealTime)}
          selectedEntry={selectedEntry} // ✅ new
          onTapSelect={onTapSelect} // ✅ new
          onTapDrop={(mealTime) => onTapDrop(dayKey, mealTime)} // ✅ new
        />
      ))}

      {/* Divider before other meal times */}
      {MEAL_TIMES.filter(
        (mt) =>
          !["breakfast", "lunch", "dinner"].includes(mt) &&
          grouped[mt].length === 0,
      ).length > 0 && (
        <button
          onClick={() => onAddClick(dayKey, "snack")}
          className="rounded-xl flex items-center justify-center h-8 w-full transition-colors mt-auto"
          style={{ border: `1px dashed ${C.line}`, color: C.faint }}
        >
          <Plus size={13} />
        </button>
      )}
    </div>
  );
}

// ── Add to Week Modal ─────────────────────────

function AddToWeekModal({
  recipe,
  userId,
  defaultDay,
  defaultMealTime,
  onClose,
  onAdded,
  weekStart,
}) {
  const [selectedDay, setSelectedDay] = useState(defaultDay || DAYS[0]);
  const [selectedMealTime, setSelectedMealTime] = useState(
    defaultMealTime || MEAL_TIMES[0],
  );
  const [selectedRecipe, setSelectedRecipe] = useState(recipe || null);
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load recipes if none passed in
  useEffect(() => {
    if (!recipe) {
      setLoadingRecipes(true);
      fetchRecipes(userId)
        .then(setRecipes)
        .catch(console.error)
        .finally(() => setLoadingRecipes(false));
    }
  }, []);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async () => {
    setSaving(true);
    setError("");
    try {
      await addMealPlanEntry(
        userId,
        recipe.id,
        selectedDay,
        selectedMealTime,
        weekStart,
      ); // ✅
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
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(43,43,43,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-5 shadow-2xl overflow-y-auto"
        style={{
          background: C.card,
          maxHeight: "85vh",
          width: recipe ? 320 : 380,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
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

        {/* ── Recipe picker — only shown when no recipe passed in ── */}
        {!recipe && (
          <div className="mb-4">
            <p
              className="text-xs font-semibold mb-1.5 uppercase tracking-widest"
              style={{ ...sans, color: C.faint }}
            >
              Recipe
            </p>

            {/* Search */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 mb-2"
              style={{ background: C.bg, border: `1px solid ${C.line}` }}
            >
              <input
                type="text"
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none"
                style={{ ...sans, color: C.charcoal }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Recipe list */}
            <div
              className="flex flex-col gap-1 overflow-y-auto rounded-xl"
              style={{ maxHeight: 180, border: `1px solid ${C.line}` }}
            >
              {loadingRecipes ? (
                <p className="text-xs p-3" style={{ ...sans, color: C.faint }}>
                  Loading recipes...
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-xs p-3" style={{ ...sans, color: C.faint }}>
                  No recipes found
                </p>
              ) : (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecipe(r);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: selectedRecipe?.id === r.id ? C.sand : C.card,
                      borderBottom: `1px solid ${C.line}`,
                    }}
                  >
                    <img
                      src={
                        r.photo_url ||
                        "https://images.unsplash.com/photo-1614548540093-6f7dfceed46b?w=100&q=80"
                      }
                      alt={r.name}
                      className="rounded-lg object-cover flex-shrink-0"
                      style={{ width: 36, height: 36 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ ...sans, color: C.charcoal }}
                      >
                        {r.name}
                      </p>
                      {r.calories_per_serving && (
                        <p
                          className="text-[10px]"
                          style={{ ...sans, color: C.faint }}
                        >
                          {r.calories_per_serving} cal
                        </p>
                      )}
                    </div>
                    {selectedRecipe?.id === r.id && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: C.primary }}
                      >
                        <Check size={9} color={C.onPrimary} />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Selected recipe confirmation */}
            {selectedRecipe && (
              <p
                className="text-xs mt-2 font-semibold"
                style={{ ...sans, color: C.green }}
              >
                ✓ {selectedRecipe.name} selected
              </p>
            )}
          </div>
        )}

        {/* Recipe name — shown when recipe passed in */}
        {recipe?.name && (
          <p className="text-xs mb-3" style={{ ...sans, color: C.muted }}>
            Adding <strong style={{ color: C.charcoal }}>{recipe.name}</strong>
          </p>
        )}

        {/* Day picker */}
        <p
          className="text-xs font-semibold mb-1.5 uppercase tracking-widest"
          style={{ ...sans, color: C.faint }}
        >
          Day
        </p>
        <div className="grid grid-cols-7 gap-1 mb-3">
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

        {/* Meal time picker */}
        <p
          className="text-xs font-semibold mb-1.5 uppercase tracking-widest"
          style={{ ...sans, color: C.faint }}
        >
          Meal
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {MEAL_TIMES.map((mt) => (
            <button
              key={mt}
              onClick={() => setSelectedMealTime(mt)}
              className="py-2 rounded-xl text-xs font-semibold capitalize transition-colors flex items-center justify-center gap-1"
              style={{
                ...sans,
                background: selectedMealTime === mt ? C.charcoal : C.sand,
                color: selectedMealTime === mt ? "#FFFBF5" : C.muted,
              }}
            >
              {MEAL_META[mt]?.emoji} {mt}
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
          disabled={saving || (!recipe && !selectedRecipe)}
          className="w-full py-2.5 rounded-full text-sm font-semibold transition-opacity"
          style={{
            ...sans,
            background: C.primary,
            color: C.onPrimary,
            opacity: saving || (!recipe && !selectedRecipe) ? 0.5 : 1,
          }}
        >
          {saving ? "Adding..." : "Add to plan"}
        </button>
      </div>
    </div>
  );
}

// ── This Week Screen ──────────────────────────

export function ThisWeekScreen({
  onOpenRecipe,
  userId,
  weekOffset,
  setWeekOffset,
}) {
  console.log("ThisWeekScreen rendering");
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(null); // { day, mealTime, recipe? }
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [dragState, setDragState] = useState({ dragging: null, overDay: null });
  const [selectedEntry, setSelectedEntry] = useState(null); // mobile tap-to-move

  // ✅ Week offset — 0 = current week, 1 = next week, -1 = last week etc
  // const [weekOffset, setWeekOffset] = useState(0);

  // ✅ Calculate monday for any offset
  const getMonday = (offset = 0) => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const currentMonday = getMonday(weekOffset);
  const currentSunday = new Date(currentMonday);
  currentSunday.setDate(currentMonday.getDate() + 6);

  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekLabel = `${fmt(currentMonday)} – ${fmt(currentSunday)}`;
  const weekStartISO = currentMonday.toISOString();

  // ✅ Limits
  const isCurrentWeek = weekOffset === 0;
  const canGoBack = weekOffset > -4; // up to 4 weeks back
  const canGoForward = weekOffset < 4; // up to 4 weeks forward

  const loadPlan = () => {
    if (!userId) return;
    fetchMealPlan(userId, weekStartISO)
      .then(setMealPlan)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlan();
  }, [userId, weekOffset]); // ✅ reload when week changes

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

  console.log("mealPlan:", mealPlan);
  console.log("entriesByDay:", entriesByDay);

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
      await generateGroceryList(userId, weekStartISO); // ✅ pass weekStart
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

    const sourceDay = sourceEntry.day_of_week;
    const sourceMealTime = sourceEntry.meal_time;

    if (sourceDay === targetDay && sourceMealTime === targetMealTime) {
      setDragState({ dragging: null, overDay: null });
      return;
    }

    try {
      // Always add to target slot
      await addMealPlanEntry(
        userId,
        sourceEntry.recipe_id,
        targetDay,
        targetMealTime,
        weekStartISO,
      );

      // Remove from source
      await removeMealPlanEntry(sourceEntry.id);
      loadPlan();
    } catch (err) {
      console.error("Failed to move meal:", err);
    }

    setDragState({ dragging: null, overDay: null });
  };

  const handleTapSelect = (entry) => {
    if (window.innerWidth >= 768) return;
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry(null); // tap same card to deselect
    } else {
      setSelectedEntry(entry);
    }
  };

  const handleTapDrop = async (targetDay, targetMealTime) => {
    if (!selectedEntry) return;
    const sourceDay = selectedEntry.day_of_week;
    const sourceMealTime = selectedEntry.meal_time;

    if (sourceDay === targetDay && sourceMealTime === targetMealTime) {
      setSelectedEntry(null);
      return;
    }

    try {
      await addMealPlanEntry(
        userId,
        selectedEntry.recipe_id,
        targetDay,
        targetMealTime,
        weekStartISO,
      );
      await removeMealPlanEntry(selectedEntry.id);
      loadPlan();
    } catch (err) {
      console.error("Failed to move meal:", err);
    }
    setSelectedEntry(null);
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
            {isCurrentWeek
              ? "This Week"
              : weekOffset > 0
                ? `In ${weekOffset} Week${weekOffset > 1 ? "s" : ""}`
                : `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? "s" : ""} Ago`}
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setWeekOffset((w) => w - 1);
                setMealPlan(null);
                setLoading(true);
              }}
              disabled={!canGoBack}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-opacity flex-shrink-0"
              style={{ background: C.sand, opacity: canGoBack ? 1 : 0.3 }}
            >
              <ChevronLeft size={11} color={C.charcoal} />
            </button>
            <p
              className="text-xs whitespace-nowrap"
              style={{ ...sans, color: C.muted }}
            >
              {weekLabel}
            </p>
            <button
              onClick={() => {
                setWeekOffset((w) => w + 1);
                setMealPlan(null);
                setLoading(true);
              }}
              disabled={!canGoForward}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-opacity flex-shrink-0"
              style={{ background: C.sand, opacity: canGoForward ? 1 : 0.3 }}
            >
              <ChevronRight size={11} color={C.charcoal} />
            </button>
          </div>
          <p className="text-xs md:hidden" style={{ ...sans, color: C.faint }}>
            Double tap a meal to move it
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dragState.dragging && (
            <p className="text-xs" style={{ ...sans, color: C.muted }}>
              Drop on a meal slot to move
            </p>
          )}
          {selectedEntry && (
            <p
              className="text-xs font-semibold"
              style={{ ...sans, color: C.primary }}
            >
              Tap "Move here" to relocate · tap card again to cancel
            </p>
          )}
          <button
            onClick={handleGenerateGroceryList}
            disabled={generating}
            className="px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
            style={{
              ...sans,
              background: generated ? C.green : C.primary,
              color: C.onPrimary,
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? (
              "..."
            ) : generated ? (
              "✓ Ready!"
            ) : (
              <>
                <span className="md:hidden">🛒 Generate</span>
                <span className="hidden md:inline">Generate grocery list</span>
              </>
            )}
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
              <div
                className="h-20 rounded-xl mb-2"
                style={{ background: C.sand }}
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
              onAddClick={(day, mealTime) => setAddModal({ day, mealTime })}
              selectedEntry={selectedEntry} // ✅ new
              onTapSelect={handleTapSelect} // ✅ new
              onTapDrop={handleTapDrop} // ✅ new
            />
          ))}
        </div>
      )}

      {/* Add to week modal — opened from + buttons in day columns */}
      {addModal && (
        <AddToWeekModal
          recipe={addModal.recipe || null}
          userId={userId}
          defaultDay={addModal.day}
          defaultMealTime={addModal.mealTime}
          onClose={() => setAddModal(null)}
          weekStart={weekStartISO}
          onAdded={() => {
            setAddModal(null);
            loadPlan();
          }}
        />
      )}
    </div>
  );
}

// ── Recipe Detail Modal ───────────────────────

export function RecipeDetailModal({ recipe: recipeProp, onClose, userId }) {
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState({});
  const [showAddToWeek, setShowAddToWeek] = useState(false);
  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const recipe = recipeProp || {};
  const baseServings = recipe.servings || 1;
  const [servings, setServings] = useState(baseServings);
  const title = recipe.name || "Recipe";
  const [currentPhoto, setCurrentPhoto] = useState(
    recipe.photo_url || DEFAULT_RECIPE_PHOTO,
  );
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
      className="fixed md:absolute inset-0 z-40 flex items-end md:items-center justify-center md:p-8"
      style={{ background: "rgba(43,43,43,0.45)" }}
    >
      <div
        className="relative w-full md:max-w-4xl rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:grid"
        style={{
          gridTemplateColumns: "360px 1fr",
          maxHeight: "85vh",
          background: C.bg,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-50"
          style={{ background: "rgba(255,251,245,0.9)" }}
        >
          <X size={16} color={C.charcoal} />
        </button>

        {/* Left */}
        <div
          className="p-4 md:p-6 overflow-y-auto"
          style={{
            borderRight: "none",
            borderBottom: `1px solid ${C.line}`,
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          <div className="relative w-full mb-4">
            <img
              src={currentPhoto}
              alt={title}
              className="w-full h-44 object-cover rounded-xl"
            />
            <EditPhotoButton
              recipeId={recipe.id}
              userId={userId}
              currentPhoto={currentPhoto}
              onUpdated={setCurrentPhoto}
            />
          </div>
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
          {/* Time + calories + macros row */}
          {/* Time + calories */}
          <div
            className="flex items-center gap-4 mb-2"
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

          {/* Macros row — only shown if ingredient macro data exists */}
          {(() => {
            const totals = ingredients.reduce(
              (acc, ing) => ({
                protein: acc.protein + (parseFloat(ing.protein) || 0),
                carbs: acc.carbs + (parseFloat(ing.carbs) || 0),
                fat: acc.fat + (parseFloat(ing.fat) || 0),
                sugar: acc.sugar + (parseFloat(ing.sugar) || 0),
              }),
              { protein: 0, carbs: 0, fat: 0, sugar: 0 },
            );

            const hasMacros = Object.values(totals).some((v) => v > 0);
            if (!hasMacros) return null;

            const ratio = servings / baseServings;

            return (
              <div
                className="flex items-center gap-4 mb-5"
                style={{ ...sans, color: C.muted }}
              >
                {[
                  { label: "Protein", value: totals.protein, color: C.green },
                  { label: "Carbs", value: totals.carbs, color: "#f59e0b" },
                  { label: "Fat", value: totals.fat, color: "#8b5cf6" },
                  { label: "Sugar", value: totals.sugar, color: "#ec4899" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-1 text-xs">
                    <span style={{ fontWeight: 700, color }}>
                      {Math.round(value * ratio)}g
                    </span>
                    <span style={{ color: C.faint }}>{label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4"
            style={{ background: C.sand }}
          >
            <div>
              <span
                className="text-xs font-semibold"
                style={{ ...sans, color: C.charcoal }}
              >
                Servings
              </span>
              {servings !== baseServings && (
                <p className="text-[10px]" style={{ ...sans, color: C.faint }}>
                  Base: {baseServings}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: C.bg, opacity: servings <= 1 ? 0.4 : 1 }}
              >
                <Minus size={12} color={C.charcoal} />
              </button>
              <span
                className="text-sm font-semibold w-4 text-center"
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
        </div>

        {/* Right */}
        <div
          className="p-4 md:p-6 overflow-y-auto"
          style={{ maxHeight: "45vh", flex: 1, overflowY: "auto" }}
        >
          <h3
            className="text-sm font-bold mb-3"
            style={{
              ...serif,
              fontWeight: 600,
              color: C.charcoal,
            }}
          >
            Ingredients
          </h3>
          <div className="mb-6">
            {ingredients.length === 0 && (
              <p className="text-sm" style={{ ...sans, color: C.faint }}>
                No ingredients listed.
              </p>
            )}
            {ingredients.map((ing) => {
              const ratio = servings / baseServings;
              const rawQty = parseFloat(ing.quantity);
              const scaledQty = !isNaN(rawQty)
                ? parseFloat((rawQty * ratio).toFixed(2))
                : null;

              return (
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
                    style={{
                      ...sans,
                      color: servings !== baseServings ? C.primary : C.muted,
                    }}
                  >
                    {scaledQty !== null
                      ? `${scaledQty}${ing.unit ? ` ${ing.unit}` : ""}`
                      : ing.qty || "—"}
                  </span>
                </div>
              );
            })}
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
