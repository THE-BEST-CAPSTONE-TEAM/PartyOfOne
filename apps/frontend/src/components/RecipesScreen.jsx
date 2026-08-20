import React, { useState, useEffect } from "react";
import { Search, Heart, Plus, Clock, Flame, X, Trash2 } from "lucide-react";
import {
  fetchRecipes,
  fetchTags,
  fetchCategories,
  fetchCuisines,
  saveRecipe,
  unsaveRecipe,
  fetchSavedRecipes,
  addMealPlanEntry,
  deleteRecipe,
} from "../api/items";
import { useApi } from "../hooks/useApi";
import CreateRecipeModal from "./CreateRecipeModal";

const C = {
  bg: "#f7f8ef",
  card: "#FFFFFF",
  sand: "#F0E6D8",
  line: "#E9DCC5",
  charcoal: "#2B2B2B",
  muted: "#8A7F6D",
  faint: "#B9AD98",
  primary: "#ff3131",
  onPrimary: "#2B2B2B",
  green: "#154202",
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
  breakfast: { emoji: "🍳" },
  lunch: { emoji: "🥪" },
  dinner: { emoji: "🍝" },
  snack: { emoji: "🍎" },
  dessert: { emoji: "🍰" },
  drinks: { emoji: "☕" },
};

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(43,43,43,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-5 w-80 shadow-2xl overflow-y-auto"
        style={{ background: C.card, maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
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
        <p className="text-xs mb-3" style={{ ...sans, color: C.muted }}>
          Adding <strong style={{ color: C.charcoal }}>{recipe.name}</strong>
        </p>
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

// ── Delete confirm modal ──────────────────────

function DeleteConfirmModal({ recipe, onConfirm, onClose, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(43,43,43,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-72 shadow-2xl"
        style={{ background: C.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-base font-semibold mb-2"
          style={{ ...serif, color: C.charcoal }}
        >
          Delete recipe?
        </h3>
        <p className="text-sm mb-5" style={{ ...sans, color: C.muted }}>
          <strong style={{ color: C.charcoal }}>{recipe.name}</strong> will be
          permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold"
            style={{ ...sans, border: `1.5px solid ${C.line}`, color: C.muted }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-opacity"
            style={{
              ...sans,
              background: C.primary,
              color: C.onPrimary,
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Recipe Card ───────────────────────────────

function RecipeCard({
  recipe,
  isSaved,
  onSaveToggle,
  onOpen,
  onAddToWeek,
  onDelete,
  userId,
}) {
  const [hovering, setHovering] = useState(false);
  const [savePending, setSavePending] = useState(false);

  const isOwner = String(recipe.user_id) === String(userId); // ✅

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (savePending) return;
    setSavePending(true);
    await onSaveToggle(recipe);
    setSavePending(false);
  };

  const cookTime = recipe.cook_time
    ? `${recipe.cook_time} min`
    : recipe.prep_time
      ? `${recipe.prep_time} min`
      : null;
  const calories = recipe.calories_per_serving
    ? `${recipe.calories_per_serving} cal`
    : null;
  const photo =
    recipe.photo_url ||
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80";

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onTouchStart={() => setHovering(true)}
      onClick={() => onOpen(recipe)}
    >
      <div className="relative h-36 md:h-44 overflow-hidden">
        {" "}
        <img
          src={photo}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hovering && (
          <div
            className="absolute inset-0 flex items-end justify-between p-2 md:p-3"
            style={{
              background:
                "linear-gradient(to top, rgba(43,43,43,0.5), transparent)",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToWeek(recipe);
              }}
              className="px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{ ...sans, background: C.primary, color: C.onPrimary }}
            >
              + Add to week
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,251,245,0.9)" }}
              >
                <Trash2 size={13} color={C.primary} />
              </button>
              <button
                onClick={handleSaveToggle}
                disabled={savePending}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,251,245,0.9)" }}
              >
                <Heart
                  size={14}
                  color={isSaved ? C.primary : C.charcoal}
                  fill={isSaved ? C.primary : "none"}
                />
              </button>
            </div>
          </div>
        )}
        {isSaved && !hovering && (
          <div
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,251,245,0.9)" }}
          >
            <Heart size={12} color={C.primary} fill={C.primary} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p
          className="text-sm font-semibold mb-2 leading-snug"
          style={{ ...serif, color: C.charcoal }}
        >
          {recipe.name}
        </p>
        <div
          className="flex items-center gap-3"
          style={{ ...sans, color: C.muted }}
        >
          {cookTime && (
            <span className="flex items-center gap-1 text-xs">
              <Clock size={11} /> {cookTime}
            </span>
          )}
          {calories && (
            <span className="flex items-center gap-1 text-xs">
              <Flame size={11} /> {calories}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <div className="h-44 w-full" style={{ background: C.sand }} />
          <div className="p-3">
            <div
              className="h-4 rounded mb-2"
              style={{ background: C.sand, width: "70%" }}
            />
            <div
              className="h-3 rounded"
              style={{ background: C.sand, width: "40%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Recipes Screen ────────────────────────────

export default function RecipesScreen({ onOpenRecipe, userId }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [savedIds, setSavedIds] = useState(new Set());
  const [addToWeekRecipe, setAddToWeekRecipe] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState(null);

  const { data: tags, loading: tagsLoading } = useApi(fetchTags);
  const { data: categories } = useApi(fetchCategories);
  const { data: cuisines } = useApi(fetchCuisines);
  const { data: savedRecipes } = useApi(
    () => fetchSavedRecipes(userId),
    [userId],
  );

  // Fetch meals types for create modal
  const [mealTypes, setMealTypes] = useState([]);
  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/meal-types`,
    )
      .then((r) => r.json())
      .then(setMealTypes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    setRecipesLoading(true);
    fetchRecipes(userId)
      .then(setRecipes)
      .catch((err) => setRecipesError(err.message))
      .finally(() => setRecipesLoading(false));
  };

  useEffect(() => {
    if (savedRecipes) {
      setSavedIds(new Set(savedRecipes.map((r) => String(r.id))));
    }
  }, [savedRecipes]);

  const filters = ["All", ...(tags?.map((t) => t.name) || [])];

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const recipeTags = r.recipe_tags?.map((rt) => rt.tags?.name) || [];
    const matchesFilter =
      activeFilter === "All" || recipeTags.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  const handleSaveToggle = async (recipe) => {
    const id = String(recipe.id);
    const alreadySaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      alreadySaved ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      alreadySaved
        ? await unsaveRecipe(userId, recipe.id)
        : await saveRecipe(userId, recipe.id);
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        alreadySaved ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecipe(deleteTarget.id, userId);
      setRecipes((prev) =>
        prev.filter((r) => String(r.id) !== String(deleteTarget.id)),
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreated = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-7"
      style={{ background: C.bg }}
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1
            className="text-2xl mb-1"
            style={{ ...serif, fontWeight: 600, color: C.charcoal }}
          >
            Recipes
          </h1>
          <p className="text-sm" style={{ ...sans, color: C.muted }}>
            {recipesLoading
              ? "Loading..."
              : `${recipes.length} recipes in your library`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-sm whitespace-nowrap"
          style={{ ...sans, background: C.primary, color: C.onPrimary }}
        >
          <Plus size={15} /> Add recipe
        </button>
      </div>

      <div className="mb-6">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <Search size={15} color={C.faint} />
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ ...sans, color: C.charcoal }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} color={C.faint} />
            </button>
          )}
        </div>
        {!tagsLoading && (
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            {" "}
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  ...sans,
                  background: activeFilter === f ? C.charcoal : C.card,
                  color: activeFilter === f ? "#FFFBF5" : C.muted,
                  border: `1px solid ${activeFilter === f ? C.charcoal : C.line}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {recipesError && (
        <div className="rounded-xl p-4 mb-4" style={{ background: "#FFF0F0" }}>
          <p className="text-sm" style={{ ...sans, color: C.primary }}>
            Failed to load recipes: {recipesError}
          </p>
        </div>
      )}

      {recipesLoading ? (
        <LoadingGrid />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg mb-1" style={{ ...serif, color: C.charcoal }}>
            No recipes found
          </p>
          <p className="text-sm" style={{ ...sans, color: C.muted }}>
            Try a different search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              userId={userId}
              isSaved={savedIds.has(String(r.id))}
              onSaveToggle={handleSaveToggle}
              onOpen={onOpenRecipe}
              onAddToWeek={setAddToWeekRecipe}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {addToWeekRecipe && (
        <AddToWeekModal
          recipe={addToWeekRecipe}
          userId={userId}
          onClose={() => setAddToWeekRecipe(null)}
          onAdded={() => setAddToWeekRecipe(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          recipe={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {showCreate && (
        <CreateRecipeModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
          categories={categories || []}
          cuisines={cuisines || []}
          mealTypes={mealTypes || []}
          tags={tags || []}
          userId={userId}
        />
      )}
    </div>
  );
}
