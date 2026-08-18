import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ShoppingBasket,
} from "lucide-react";
import {
  fetchGroceryList,
  toggleGroceryItem,
  addGroceryItem,
  deleteGroceryItem,
  generateGroceryList,
} from "../api/items";
import { Checkbox } from "./HomeScreen.jsx";

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

// Group flat items array into categories
// Since our DB doesn't have a category column on grocery items yet,
// we group by first word of ingredient name as a simple heuristic —
// your colleague can add a category column later and update this
const CATEGORY_KEYWORDS = {
  Produce: [
    "spinach",
    "tomato",
    "onion",
    "garlic",
    "lemon",
    "lime",
    "avocado",
    "banana",
    "carrot",
    "celery",
    "pepper",
    "mushroom",
    "broccoli",
    "cucumber",
    "cabbage",
    "greens",
    "herb",
    "parsley",
    "coriander",
    "chive",
    "ginger",
  ],
  Protein: [
    "chicken",
    "beef",
    "tofu",
    "shrimp",
    "salmon",
    "fish",
    "turkey",
    "pork",
    "egg",
    "lentil",
    "chickpea",
    "bean",
  ],
  Dairy: [
    "milk",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "feta",
    "cheddar",
    "gruyere",
    "mozzarella",
  ],
  Pantry: [
    "oil",
    "sauce",
    "paste",
    "flour",
    "oat",
    "rice",
    "pasta",
    "noodle",
    "broth",
    "coconut",
    "soy",
    "cumin",
    "paprika",
    "turmeric",
    "curry",
    "salt",
    "pepper",
    "vinegar",
    "maple",
    "honey",
    "peanut",
    "tahini",
    "yeast",
  ],
};

function categoriseItem(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "Other";
}

function groupItems(items) {
  const groups = {};
  for (const item of items) {
    const cat = categoriseItem(item.ingredient_name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return Object.entries(groups).map(([category, items]) => ({
    category,
    items,
  }));
}

function CategorySection({
  category,
  items,
  onToggle,
  onDelete,
  collapsed,
  onToggleCollapse,
}) {
  const checkedCount = items.filter((i) => i.is_checked).length;
  return (
    <div className="mb-4">
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 w-full mb-2"
      >
        {collapsed ? (
          <ChevronRight size={14} color={C.muted} />
        ) : (
          <ChevronDown size={14} color={C.muted} />
        )}
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ ...sans, color: C.muted }}
        >
          {category}
        </span>
        <span className="text-xs ml-1" style={{ ...sans, color: C.faint }}>
          {checkedCount}/{items.length}
        </span>
        <div className="flex-1 h-px ml-2" style={{ background: C.line }} />
      </button>
      {!collapsed && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 group/item"
              style={{
                borderBottom:
                  idx < items.length - 1 ? `1px solid ${C.line}` : "none",
                background: item.is_checked ? "#FAFAF5" : C.card,
              }}
            >
              <Checkbox
                checked={item.is_checked}
                onClick={() => onToggle(item)}
                tone="primary"
              />
              <span
                className="flex-1 text-sm"
                style={{
                  ...sans,
                  color: item.is_checked ? C.faint : C.charcoal,
                  textDecoration: item.is_checked ? "line-through" : "none",
                }}
              >
                {item.ingredient_name}
              </span>
              {item.total_quantity && (
                <span
                  className="text-xs mr-2"
                  style={{ ...sans, color: C.muted }}
                >
                  {item.total_quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                </span>
              )}
              <button
                onClick={() => onDelete(item)}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <Trash2 size={13} color={C.faint} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GroceryListScreen({ userId }) {
  const [groceryList, setGroceryList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadGroceryList();
  }, [userId]);

  async function loadGroceryList() {
    setLoading(true);
    try {
      const data = await fetchGroceryList(userId);
      setGroceryList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await generateGroceryList(userId);
      setGroceryList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggle(item) {
    // Optimistic update
    setGroceryList((prev) => ({
      ...prev,
      grocery_list_items: prev.grocery_list_items.map((i) =>
        i.id === item.id ? { ...i, is_checked: !i.is_checked } : i,
      ),
    }));
    try {
      await toggleGroceryItem(item.id);
    } catch {
      // Revert
      setGroceryList((prev) => ({
        ...prev,
        grocery_list_items: prev.grocery_list_items.map((i) =>
          i.id === item.id ? { ...i, is_checked: item.is_checked } : i,
        ),
      }));
    }
  }

  async function handleDelete(item) {
    setGroceryList((prev) => ({
      ...prev,
      grocery_list_items: prev.grocery_list_items.filter(
        (i) => i.id !== item.id,
      ),
    }));
    try {
      await deleteGroceryItem(item.id);
    } catch {
      loadGroceryList();
    }
  }

  async function handleAddItem() {
    if (!newItem.trim() || !groceryList) return;
    try {
      const added = await addGroceryItem(
        groceryList.id,
        newItem.trim(),
        null,
        null,
      );
      setGroceryList((prev) => ({
        ...prev,
        grocery_list_items: [...prev.grocery_list_items, added],
      }));
      setNewItem("");
      setAdding(false);
    } catch (err) {
      setError(err.message);
    }
  }

  const items = groceryList?.grocery_list_items || [];
  const checkedTotal = items.filter((i) => i.is_checked).length;
  const progress = items.length > 0 ? (checkedTotal / items.length) * 100 : 0;
  const allDone = items.length > 0 && checkedTotal === items.length;
  const groups = groupItems(items);

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p style={{ ...sans, color: C.muted }}>Loading grocery list...</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-7 relative"
      style={{ background: C.bg }}
    >
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1
              className="text-2xl"
              style={{ ...serif, fontWeight: 600, color: C.charcoal }}
            >
              Grocery List
            </h1>
            {!groceryList && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  ...sans,
                  background: C.primary,
                  color: C.onPrimary,
                  opacity: generating ? 0.7 : 1,
                }}
              >
                {generating ? "Generating..." : "Generate from plan"}
              </button>
            )}
          </div>
          <p className="text-sm mb-4" style={{ ...sans, color: C.muted }}>
            Week of Aug 10 – Aug 16
          </p>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 6, background: C.line }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: allDone ? C.green : C.primary,
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ ...sans, color: C.muted }}
              >
                {checkedTotal}/{items.length}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: "#FFF0F0" }}
          >
            <p className="text-sm" style={{ ...sans, color: C.primary }}>
              {error}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!groceryList && !error && (
          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center"
            style={{ background: C.card, border: `1px solid ${C.line}` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: C.sand }}
            >
              <ShoppingBasket size={24} color={C.muted} />
            </div>
            <p
              className="text-lg mb-1"
              style={{ ...serif, fontWeight: 600, color: C.charcoal }}
            >
              No grocery list yet
            </p>
            <p className="text-sm mb-4" style={{ ...sans, color: C.muted }}>
              Add meals to your week then generate your list automatically.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ ...sans, background: C.primary, color: C.onPrimary }}
            >
              {generating ? "Generating..." : "Generate grocery list"}
            </button>
          </div>
        )}

        {/* All done */}
        {allDone && (
          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center mb-6"
            style={{ background: C.card, border: `1px solid ${C.line}` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#E8F5E0" }}
            >
              <ShoppingBasket size={24} color={C.green} />
            </div>
            <p
              className="text-lg mb-1"
              style={{ ...serif, fontWeight: 600, color: C.charcoal }}
            >
              All done!
            </p>
            <p className="text-sm" style={{ ...sans, color: C.muted }}>
              You've checked everything off. Enjoy cooking!
            </p>
          </div>
        )}

        {/* Groups */}
        {groceryList &&
          !allDone &&
          groups.map((g) => (
            <CategorySection
              key={g.category}
              category={g.category}
              items={g.items}
              onToggle={handleToggle}
              onDelete={handleDelete}
              collapsed={!!collapsed[g.category]}
              onToggleCollapse={() =>
                setCollapsed((c) => ({ ...c, [g.category]: !c[g.category] }))
              }
            />
          ))}

        {/* Add item */}
        {adding && groceryList && (
          <div
            className="rounded-2xl flex items-center gap-3 px-4 py-3 mb-4"
            style={{ background: C.card, border: `1.5px solid ${C.primary}` }}
          >
            <input
              autoFocus
              type="text"
              placeholder="Add an item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewItem("");
                }
              }}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ ...sans, color: C.charcoal }}
            />
            <button
              onClick={handleAddItem}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ ...sans, background: C.primary, color: C.onPrimary }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewItem("");
              }}
              className="text-xs"
              style={{ ...sans, color: C.muted }}
            >
              Cancel
            </button>
          </div>
        )}

        {groceryList && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="fixed bottom-8 right-8 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: C.primary }}
          >
            <Plus size={20} color={C.onPrimary} />
          </button>
        )}
      </div>
    </div>
  );
}
