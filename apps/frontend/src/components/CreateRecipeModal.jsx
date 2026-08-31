import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Scan,
  Search,
  ChevronLeft,
  Loader,
} from "lucide-react";
import { createRecipe } from "../api/items";
import BarcodeScanner from "./BarcodeScanner";
import { PhotoUploadField, DEFAULT_RECIPE_PHOTO } from "./PhotoUpload";

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
const DIFFICULTIES = ["easy", "medium", "hard"];

const emptyIngredient = () => ({
  name: "",
  quantity: "",
  unit: "",
  notes: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  sugar: "",
});
const emptyStep = () => ({ instruction: "" });

const SPOONACULAR_KEY = import.meta.env.VITE_SPOONACULAR_KEY;

// ── Spoonacular helpers ───────────────────────

async function searchSpoonacular(query) {
  const res = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=10&addRecipeInformation=true&fillIngredients=true&apiKey=${SPOONACULAR_KEY}`,
  );
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results || [];
}

async function getSpoonacularRecipe(id) {
  const res = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${SPOONACULAR_KEY}`,
  );
  if (!res.ok) throw new Error("Failed to fetch recipe details");
  return res.json();
}

function mapSpoonacularToForm(recipe) {
  // Map ingredients
  const ingredients = (recipe.extendedIngredients || []).map((ing) => ({
    name: ing.name || ing.originalName || "",
    quantity: ing.amount ? String(ing.amount) : "",
    unit: ing.unit || "",
    notes: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    sugar: "",
  }));

  // Map steps
  const steps = [];
  if (recipe.analyzedInstructions?.length > 0) {
    for (const section of recipe.analyzedInstructions) {
      for (const step of section.steps || []) {
        steps.push({ instruction: step.step });
      }
    }
  }

  // Map nutrition
  const nutrients = recipe.nutrition?.nutrients || [];
  const getNutrient = (name) => {
    const n = nutrients.find(
      (n) => n.name.toLowerCase() === name.toLowerCase(),
    );
    return n ? String(Math.round(n.amount)) : "";
  };

  return {
    form: {
      name: recipe.title || "",
      description: recipe.summary
        ? recipe.summary.replace(/<[^>]*>/g, "").slice(0, 300)
        : "",
      cook_time:
        recipe.cookingMinutes > 0
          ? String(recipe.cookingMinutes)
          : String(recipe.readyInMinutes || ""),
      prep_time:
        recipe.preparationMinutes > 0 ? String(recipe.preparationMinutes) : "",
      servings: String(recipe.servings || 1),
      calories_per_serving: getNutrient("calories"),
      difficulty:
        recipe.readyInMinutes <= 30
          ? "easy"
          : recipe.readyInMinutes <= 60
            ? "medium"
            : "hard",
      category_id: "",
      cuisine_id: "",
      meal_type_id: "",
      photo_url: recipe.image || "",
      is_public: true,
    },
    ingredients: ingredients.length > 0 ? ingredients : [emptyIngredient()],
    steps: steps.length > 0 ? steps : [emptyStep()],
  };
}

// ── Search screen ─────────────────────────────

function RecipeSearchScreen({ onSelect, onBack }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(null); // id of recipe being loaded
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResults([]);
    try {
      const data = await searchSpoonacular(query);
      setResults(data);
      if (data.length === 0)
        setError("No recipes found. Try a different search.");
    } catch {
      setError("Search failed. Check your API key or try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (result) => {
    setLoading(result.id);
    try {
      const full = await getSpoonacularRecipe(result.id);
      onSelect(full);
    } catch {
      setError("Failed to load recipe details.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
      {" "}
      {/* Search header */}
      <div
        className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${C.line}` }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: C.sand }}
        >
          <ChevronLeft size={16} color={C.charcoal} />
        </button>
        <h2
          className="text-lg font-semibold"
          style={{ ...serif, color: C.charcoal }}
        >
          Search Recipes
        </h2>
      </div>
      {/* Search input */}
      <div className="px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: C.bg, border: `1px solid ${C.line}` }}
          >
            <Search size={15} color={C.faint} />
            <input
              type="text"
              placeholder="Search e.g. chicken tikka, pasta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ ...sans, color: C.charcoal }}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
            style={{
              ...sans,
              background: C.primary,
              color: C.onPrimary,
              opacity: searching ? 0.7 : 1,
            }}
          >
            {searching ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="text-xs mt-2" style={{ ...sans, color: C.primary }}>
            {error}
          </p>
        )}
      </div>
      {/* Results */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-4"
        style={{ minHeight: 0 }}
      >
        {" "}
        {searching && (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader size={18} color={C.muted} className="animate-spin" />
            <p style={{ ...sans, color: C.muted, fontSize: 13 }}>
              Searching...
            </p>
          </div>
        )}
        {!searching && results.length > 0 && (
          <div className="flex flex-col gap-3">
            <p
              className="text-xs font-semibold"
              style={{ ...sans, color: C.faint }}
            >
              {results.length} results — tap to import
            </p>
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                disabled={loading === result.id}
                className="flex items-center gap-3 rounded-2xl overflow-hidden text-left transition-opacity"
                style={{
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  opacity: loading === result.id ? 0.7 : 1,
                }}
              >
                {result.image && (
                  <img
                    src={result.image}
                    alt={result.title}
                    className="object-cover flex-shrink-0"
                    style={{ width: 80, height: 80 }}
                  />
                )}
                <div className="flex-1 p-3 min-w-0">
                  <p
                    className="text-sm font-semibold mb-1 leading-snug"
                    style={{ ...sans, color: C.charcoal }}
                  >
                    {result.title}
                  </p>
                  <div
                    className="flex items-center gap-3"
                    style={{ ...sans, color: C.muted }}
                  >
                    {result.readyInMinutes && (
                      <span className="text-xs">
                        ⏱ {result.readyInMinutes} min
                      </span>
                    )}
                    {result.servings && (
                      <span className="text-xs">
                        🍽 {result.servings} servings
                      </span>
                    )}
                  </div>
                  {result.cuisines?.length > 0 && (
                    <p
                      className="text-xs mt-1"
                      style={{ ...sans, color: C.faint }}
                    >
                      {result.cuisines.join(", ")}
                    </p>
                  )}
                </div>
                {loading === result.id ? (
                  <div className="pr-4">
                    <Loader
                      size={16}
                      color={C.muted}
                      className="animate-spin"
                    />
                  </div>
                ) : (
                  <div className="pr-4">
                    <div
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: C.primary, color: C.onPrimary }}
                    >
                      Import
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {!searching && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p
              className="text-base font-semibold mb-1"
              style={{ ...serif, color: C.charcoal }}
            >
              Search for a recipe
            </p>
            <p className="text-sm" style={{ ...sans, color: C.muted }}>
              Search Spoonacular's database of 380,000+ recipes and import with
              one tap
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────

export default function CreateRecipeModal({
  onClose,
  onCreated,
  categories,
  cuisines,
  mealTypes,
  tags,
  userId,
}) {
  const [mode, setMode] = useState("choose"); // "choose" | "search" | "manual"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scanningFor, setScanningFor] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    cook_time: "",
    prep_time: "",
    servings: "1",
    calories_per_serving: "",
    difficulty: "easy",
    category_id: "",
    cuisine_id: "",
    meal_type_id: "",
    photo_url: "",
    is_public: true,
  });
  const [ingredients, setIngredients] = useState([emptyIngredient()]);
  const [steps, setSteps] = useState([emptyStep()]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedMacros, setExpandedMacros] = useState({});

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleIngredientChange = (idx, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)),
    );
  };

  const addIngredient = () =>
    setIngredients((prev) => [...prev, emptyIngredient()]);
  const removeIngredient = (idx) =>
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  const toggleMacros = (idx) =>
    setExpandedMacros((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const handleScanResult = (nutrition) => {
    if (scanningFor === null) return;
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === scanningFor
          ? {
              ...ing,
              name: ing.name || nutrition.name || ing.name,
              calories:
                nutrition.calories !== null
                  ? String(Math.round(nutrition.calories))
                  : ing.calories,
              protein:
                nutrition.protein !== null
                  ? String(Math.round(nutrition.protein))
                  : ing.protein,
              carbs:
                nutrition.carbs !== null
                  ? String(Math.round(nutrition.carbs))
                  : ing.carbs,
              fat:
                nutrition.fat !== null
                  ? String(Math.round(nutrition.fat))
                  : ing.fat,
              sugar:
                nutrition.sugar !== null
                  ? String(Math.round(nutrition.sugar))
                  : ing.sugar,
            }
          : ing,
      ),
    );
    setExpandedMacros((prev) => ({ ...prev, [scanningFor]: true }));
    setScanningFor(null);
  };

  const handleStepChange = (idx, value) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === idx ? { instruction: value } : s)),
    );
  };
  const addStep = () => setSteps((prev) => [...prev, emptyStep()]);
  const removeStep = (idx) =>
    setSteps((prev) => prev.filter((_, i) => i !== idx));

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  // ✅ Called when user picks a recipe from search
  const handleImport = (spoonacularRecipe) => {
    const {
      form: importedForm,
      ingredients: importedIngredients,
      steps: importedSteps,
    } = mapSpoonacularToForm(spoonacularRecipe);
    setForm(importedForm);
    setIngredients(importedIngredients);
    setSteps(importedSteps);
    setMode("manual"); // switch to form to review/edit before saving
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Recipe name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        cook_time: form.cook_time ? Number(form.cook_time) : null,
        prep_time: form.prep_time ? Number(form.prep_time) : null,
        servings: form.servings ? Number(form.servings) : 1,
        calories_per_serving: form.calories_per_serving
          ? Number(form.calories_per_serving)
          : null,
        category_id: form.category_id ? Number(form.category_id) : null,
        cuisine_id: form.cuisine_id ? Number(form.cuisine_id) : null,
        meal_type_id: form.meal_type_id ? Number(form.meal_type_id) : null,
        ingredients: ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name,
            quantity: i.quantity ? parseFloat(i.quantity) : null,
            unit: i.unit || null,
            notes: i.notes || null,
            calories: i.calories ? parseFloat(i.calories) : null,
            protein: i.protein ? parseFloat(i.protein) : null,
            carbs: i.carbs ? parseFloat(i.carbs) : null,
            fat: i.fat ? parseFloat(i.fat) : null,
            sugar: i.sugar ? parseFloat(i.sugar) : null,
          })),
        preparation_steps: steps
          .filter((s) => s.instruction.trim())
          .map((s, idx) => ({ ...s, step_number: idx + 1 })),
        tags: selectedTags,
        updated_by: userId,
      };
      const created = await createRecipe(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create recipe");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    ...sans,
    fontSize: 13,
    color: C.charcoal,
    background: C.bg,
    border: `1px solid ${C.line}`,
    borderRadius: 8,
    padding: "7px 10px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = {
    ...sans,
    fontSize: 11,
    fontWeight: 600,
    color: C.faint,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: 4,
  };
  const sectionStyle = {
    ...sans,
    fontSize: 13,
    fontWeight: 600,
    color: C.charcoal,
    borderBottom: `1px solid ${C.line}`,
    paddingBottom: 6,
    marginBottom: 12,
    marginTop: 4,
  };
  const macroInputStyle = {
    ...sans,
    fontSize: 12,
    color: C.charcoal,
    background: C.bg,
    border: `1px solid ${C.line}`,
    borderRadius: 6,
    padding: "5px 8px",
    width: "100%",
    outline: "none",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(43,43,43,0.45)" }}
      >
        <div
          className="relative w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col"
          style={{ background: C.bg, maxHeight: "90vh" }}
        >
          {/* ── Choose mode screen ── */}
          {mode === "choose" && (
            <>
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: `1px solid ${C.line}` }}
              >
                <h2
                  className="text-xl"
                  style={{ ...serif, fontWeight: 600, color: C.charcoal }}
                >
                  Add Recipe
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: C.sand }}
                >
                  <X size={16} color={C.charcoal} />
                </button>
              </div>
              <div className="flex flex-col gap-4 p-6">
                <p className="text-sm" style={{ ...sans, color: C.muted }}>
                  How would you like to add a recipe?
                </p>

                {/* Search option */}
                <button
                  onClick={() => setMode("search")}
                  className="flex items-center gap-4 rounded-2xl p-5 text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: C.card,
                    border: `2px solid ${C.primary}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: C.primary }}
                  >
                    <Search size={22} color={C.onPrimary} />
                  </div>
                  <div>
                    <p
                      className="text-base font-semibold mb-0.5"
                      style={{ ...serif, color: C.charcoal }}
                    >
                      Search & Import
                    </p>
                    <p className="text-xs" style={{ ...sans, color: C.muted }}>
                      Search 380,000+ recipes from Spoonacular and import with
                      one tap. Ingredients, steps and nutrition auto-filled.
                    </p>
                  </div>
                </button>

                {/* Manual option */}
                <button
                  onClick={() => setMode("manual")}
                  className="flex items-center gap-4 rounded-2xl p-5 text-left transition-all hover:scale-[1.01]"
                  style={{ background: C.card, border: `1px solid ${C.line}` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: C.sand }}
                  >
                    <Plus size={22} color={C.muted} />
                  </div>
                  <div>
                    <p
                      className="text-base font-semibold mb-0.5"
                      style={{ ...serif, color: C.charcoal }}
                    >
                      Enter Manually
                    </p>
                    <p className="text-xs" style={{ ...sans, color: C.muted }}>
                      Create a recipe from scratch. Use the barcode scanner to
                      fill in nutrition info for each ingredient.
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── Search screen ── */}
          {mode === "search" && (
            <RecipeSearchScreen
              onSelect={handleImport}
              onBack={() => setMode("choose")}
            />
          )}

          {/* ── Manual form ── */}
          {mode === "manual" && (
            <>
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0"
                style={{ borderBottom: `1px solid ${C.line}` }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMode("choose")}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: C.sand }}
                  >
                    <ChevronLeft size={16} color={C.charcoal} />
                  </button>
                  <h2
                    className="text-xl"
                    style={{ ...serif, fontWeight: 600, color: C.charcoal }}
                  >
                    {form.name ? form.name : "New Recipe"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: C.sand }}
                >
                  <X size={16} color={C.charcoal} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto px-3 md:px-6 py-4 flex flex-col gap-4">
                {/* Basic info */}
                <div>
                  <p style={sectionStyle}>Basic Info</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label style={labelStyle}>Recipe Name *</label>
                      <input
                        style={{
                          ...inputStyle,
                          borderColor: error && !form.name ? C.primary : C.line,
                        }}
                        placeholder="e.g. Avocado Toast"
                        value={form.name}
                        onChange={handleFormChange("name")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        style={{ ...inputStyle, resize: "none", height: 72 }}
                        placeholder="A short description..."
                        value={form.description}
                        onChange={handleFormChange("description")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Photo</label>
                      <PhotoUploadField
                        value={form.photo_url}
                        onChange={(url) =>
                          setForm((prev) => ({ ...prev, photo_url: url }))
                        }
                        userId={userId}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label style={labelStyle}>Prep (mins)</label>
                        <input
                          style={inputStyle}
                          type="number"
                          placeholder="10"
                          value={form.prep_time}
                          onChange={handleFormChange("prep_time")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Cook (mins)</label>
                        <input
                          style={inputStyle}
                          type="number"
                          placeholder="20"
                          value={form.cook_time}
                          onChange={handleFormChange("cook_time")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Servings</label>
                        <input
                          style={inputStyle}
                          type="number"
                          placeholder="1"
                          value={form.servings}
                          onChange={handleFormChange("servings")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Calories</label>
                        <input
                          style={inputStyle}
                          type="number"
                          placeholder="350"
                          value={form.calories_per_serving}
                          onChange={handleFormChange("calories_per_serving")}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label style={labelStyle}>Difficulty</label>
                        <select
                          style={inputStyle}
                          value={form.difficulty}
                          onChange={handleFormChange("difficulty")}
                        >
                          {DIFFICULTIES.map((d) => (
                            <option key={d} value={d}>
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Category</label>
                        <select
                          style={inputStyle}
                          value={form.category_id}
                          onChange={handleFormChange("category_id")}
                        >
                          <option value="">Select...</option>
                          {(categories || []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Cuisine</label>
                        <select
                          style={inputStyle}
                          value={form.cuisine_id}
                          onChange={handleFormChange("cuisine_id")}
                        >
                          <option value="">Select...</option>
                          {(cuisines || []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <p style={sectionStyle}>Ingredients</p>
                  <div className="flex flex-col gap-3">
                    {ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl p-3 overflow-x-auto"
                        style={{
                          background: C.card,
                          border: `1px solid ${C.line}`,
                        }}
                      >
                        <div
                          className="grid gap-1.5 items-center mb-2"
                          style={{
                            gridTemplateColumns: "2fr 1fr 1fr 2fr auto auto",
                            minWidth: 400,
                          }}
                        >
                          <input
                            style={inputStyle}
                            placeholder="Ingredient"
                            value={ing.name}
                            onChange={(e) =>
                              handleIngredientChange(
                                idx,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            placeholder="Qty"
                            value={ing.quantity}
                            onChange={(e) =>
                              handleIngredientChange(
                                idx,
                                "quantity",
                                e.target.value,
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            placeholder="Unit"
                            value={ing.unit}
                            onChange={(e) =>
                              handleIngredientChange(
                                idx,
                                "unit",
                                e.target.value,
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            placeholder="Notes"
                            value={ing.notes}
                            onChange={(e) =>
                              handleIngredientChange(
                                idx,
                                "notes",
                                e.target.value,
                              )
                            }
                          />
                          <button
                            onClick={() => setScanningFor(idx)}
                            title="Scan barcode to fill macros"
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: C.sand }}
                          >
                            <Scan size={14} color={C.muted} />
                          </button>
                          <button
                            onClick={() => removeIngredient(idx)}
                            disabled={ingredients.length === 1}
                          >
                            <Trash2
                              size={14}
                              color={
                                ingredients.length === 1 ? C.faint : C.muted
                              }
                            />
                          </button>
                        </div>
                        <button
                          onClick={() => toggleMacros(idx)}
                          className="flex items-center gap-1.5 text-xs"
                          style={{ ...sans, color: C.faint }}
                        >
                          <span>{expandedMacros[idx] ? "▾" : "▸"}</span>
                          {expandedMacros[idx] ? "Hide macros" : "Add macros"}
                          {(ing.calories ||
                            ing.protein ||
                            ing.carbs ||
                            ing.fat ||
                            ing.sugar) && (
                            <span
                              className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                              style={{ background: C.green, color: "#FFFBF5" }}
                            >
                              filled
                            </span>
                          )}
                        </button>
                        {expandedMacros[idx] && (
                          <div className="grid grid-cols-5 gap-1.5 mt-2">
                            {[
                              {
                                field: "calories",
                                label: "Cal",
                                placeholder: "kcal",
                                color: C.primary,
                              },
                              {
                                field: "protein",
                                label: "Protein",
                                placeholder: "g",
                                color: C.green,
                              },
                              {
                                field: "carbs",
                                label: "Carbs",
                                placeholder: "g",
                                color: "#f59e0b",
                              },
                              {
                                field: "fat",
                                label: "Fat",
                                placeholder: "g",
                                color: "#8b5cf6",
                              },
                              {
                                field: "sugar",
                                label: "Sugar",
                                placeholder: "g",
                                color: "#ec4899",
                              },
                            ].map(({ field, label, placeholder, color }) => (
                              <div key={field}>
                                <label
                                  style={{
                                    ...sans,
                                    fontSize: 9,
                                    fontWeight: 600,
                                    color,
                                    display: "block",
                                    marginBottom: 2,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  {label}
                                </label>
                                <input
                                  style={macroInputStyle}
                                  type="number"
                                  placeholder={placeholder}
                                  value={ing[field]}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      idx,
                                      field,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addIngredient}
                      className="flex items-center gap-1.5 text-xs font-semibold mt-1 self-start"
                      style={{ ...sans, color: C.muted }}
                    >
                      <Plus size={13} /> Add ingredient
                    </button>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <p style={sectionStyle}>Preparation Steps</p>
                  <div className="flex flex-col gap-2">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1.5"
                          style={{
                            border: `1.5px solid ${C.charcoal}`,
                            color: C.charcoal,
                            ...sans,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <textarea
                          style={{
                            ...inputStyle,
                            resize: "none",
                            height: 56,
                            flex: 1,
                          }}
                          placeholder={`Step ${idx + 1}...`}
                          value={step.instruction}
                          onChange={(e) =>
                            handleStepChange(idx, e.target.value)
                          }
                        />
                        <button
                          onClick={() => removeStep(idx)}
                          disabled={steps.length === 1}
                          className="mt-1.5"
                        >
                          <Trash2
                            size={14}
                            color={steps.length === 1 ? C.faint : C.muted}
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addStep}
                      className="flex items-center gap-1.5 text-xs font-semibold mt-1 self-start"
                      style={{ ...sans, color: C.muted }}
                    >
                      <Plus size={13} /> Add step
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p style={sectionStyle}>Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(tags || []).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          ...sans,
                          background: selectedTags.includes(tag.id)
                            ? C.charcoal
                            : C.sand,
                          color: selectedTags.includes(tag.id)
                            ? "#FFFBF5"
                            : C.muted,
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                {error ? (
                  <p className="text-xs" style={{ ...sans, color: C.primary }}>
                    {error}
                  </p>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold"
                    style={{
                      ...sans,
                      border: `1.5px solid ${C.line}`,
                      color: C.muted,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity"
                    style={{
                      ...sans,
                      background: C.primary,
                      color: C.onPrimary,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save Recipe"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {scanningFor !== null && (
        <BarcodeScanner
          onResult={handleScanResult}
          onClose={() => setScanningFor(null)}
        />
      )}
    </>
  );
}
