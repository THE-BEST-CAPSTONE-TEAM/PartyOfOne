import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import React, { useState } from "react";
import {
  Calendar, BookOpen, ShoppingBasket, Heart, Settings,
  X, Clock, Flame, Plus, Minus, Check, ChefHat,
} from "lucide-react";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
`;

// ---- design tokens ----
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
  brightRed: "#ff3131",
};

const serif = { fontFamily: "Fraunces, serif" };
const sans = { fontFamily: "Inter, sans-serif" };

// ---- sample data ----
const RECIPE = {
  title: "Chickpea & Feta Salad",
  tags: ["Vegetarian", "Mediterranean"],
  time: "20 min",
  cal: "340 cal",
  photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80",
  ingredients: [
    { id: 1, name: "Baby spinach", qty: "3 cups" },
    { id: 2, name: "Cherry tomatoes, halved", qty: "1 cup" },
    { id: 3, name: "Feta, crumbled", qty: "1/2 cup" },
    { id: 4, name: "Chickpeas, drained", qty: "1 can" },
    { id: 5, name: "Red onion, thin sliced", qty: "1/4 cup" },
    { id: 6, name: "Lemon, juiced", qty: "1" },
  ],
  steps: [
    "Rinse and drain the chickpeas, then pat dry with a towel.",
    "Whisk lemon juice, olive oil, salt and pepper in a small bowl for the dressing.",
    "Combine spinach, tomatoes, onion and chickpeas in a large bowl. Toss with dressing.",
    "Top with crumbled feta and serve immediately.",
  ],
};

const WEEK = [
  { day: "MON", meals: [{ title: "Chickpea & Feta Salad", photo: RECIPE.photo }] },
  { day: "TUE", meals: [] },
  { day: "WED", meals: [{ title: "Miso Glazed Salmon", photo: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80" }, { title: "Garlic Noodles", photo: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80" }] },
  { day: "THU", meals: [] },
  { day: "FRI", meals: [{ title: "Sheet-Pan Fajitas", photo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" }] },
  { day: "SAT", meals: [{ title: "Weekend Pancakes", photo: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" }] },
  { day: "SUN", meals: [] },
];

function TagPill({ children, tone = "primary" }) {
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

function Checkbox({ checked, onClick, tone = "primary" }) {
  const fill = tone === "primary" ? C.primary : C.green;
  const mark = tone === "primary" ? C.onPrimary : "#FFFBF5";
  return (
    <button
      onClick={onClick}
      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
      style={{ borderColor: checked ? fill : "#D8CDBB", background: checked ? fill : "transparent" }}
    >
      {checked && <Check size={12} strokeWidth={3} color={mark} />}
    </button>
  );
}

function Sidebar({ active, onNavigate }) {
  const items = [
    { key: "week", label: "This Week", icon: Calendar },
    { key: "recipes", label: "Recipes", icon: BookOpen },
    { key: "grocery", label: "Grocery List", icon: ShoppingBasket },
    { key: "saved", label: "Saved", icon: Heart },
  ];
  return (
    <div
      className="flex flex-col gap-1 py-6 px-4 flex-shrink-0"
      style={{ width: 210, background: C.sidebarBg, borderRight: `1px solid ${C.line}` }}
    >
      <div className="flex items-center gap-2 px-2 mb-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: C.primary }}
        >
          <ChefHat size={16} color={C.onPrimary} />
        </div>
        <span className="text-base font-semibold" style={{ ...serif, fontWeight: 600, color: C.charcoal }}>
          Table
        </span>
      </div>
      <p className="px-2 text-[11px] leading-snug mb-6" style={{ ...sans, color: C.muted }}>
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
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
        style={{ ...sans, color: C.muted }}
      >
        <Settings size={16} />
        Settings
      </button>
    </div>
  );
}

function MealCard({ meal, onOpen }) {
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

function EmptySlot({ onClick }) {
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

function ThisWeekScreen({ onOpenRecipe }) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-7" style={{ background: C.bg }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-1" style={{ ...serif, fontWeight: 600, color: C.charcoal }}>
            This Week
          </h1>
          <p className="text-sm" style={{ ...sans, color: C.muted }}>Aug 10 – Aug 16</p>
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
          <div key={d.day} className="rounded-2xl p-2.5 flex flex-col gap-2" style={{ background: C.card, border: `1px solid ${C.line}`, minHeight: 320 }}>
            <p className="text-[10px] font-bold text-center tracking-widest" style={{ ...sans, color: C.muted }}>
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

function RecipeDetailModal({ onClose }) {
  const [servings, setServings] = useState(2);
  const [saved, setSaved] = useState(true);
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-8" style={{ background: "rgba(43,43,43,0.45)" }}>
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl grid"
        style={{ gridTemplateColumns: "360px 1fr", maxHeight: "88vh", background: C.bg }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,251,245,0.9)" }}
        >
          <X size={16} color={C.charcoal} />
        </button>

        {/* left: photo + actions, pinned */}
        <div className="p-6 overflow-y-auto" style={{ borderRight: `1px solid ${C.line}` }}>
          <img src={RECIPE.photo} alt={RECIPE.title} className="w-full h-44 object-cover rounded-xl mb-4" />
          <h2 className="text-xl mb-2 leading-tight" style={{ ...serif, fontWeight: 600, color: C.charcoal }}>
            {RECIPE.title}
          </h2>
          <div className="flex gap-2 mb-4">
            <TagPill tone="green">{RECIPE.tags[0]}</TagPill>
            <TagPill tone="primary">{RECIPE.tags[1]}</TagPill>
          </div>
          <div className="flex items-center gap-4 mb-5" style={{ ...sans, color: C.muted }}>
            <div className="flex items-center gap-1.5 text-xs"><Clock size={13} /> {RECIPE.time}</div>
            <div className="flex items-center gap-1.5 text-xs"><Flame size={13} /> {RECIPE.cal}</div>
          </div>

          <div className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4" style={{ background: C.sand }}>
            <span className="text-xs font-semibold" style={{ ...sans, color: C.charcoal }}>Servings</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setServings((s) => Math.max(1, s - 1))} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.bg }}>
                <Minus size={12} color={C.charcoal} />
              </button>
              <span className="text-sm font-semibold w-3 text-center" style={{ ...sans, color: C.charcoal }}>{servings}</span>
              <button onClick={() => setServings((s) => s + 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.primary }}>
                <Plus size={12} color={C.onPrimary} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setSaved((s) => !s)}
            className="w-full py-2.5 rounded-full text-xs font-semibold mb-2 flex items-center justify-center gap-2"
            style={{ ...sans, border: `1.5px solid ${C.line}`, color: C.charcoal }}
          >
            <Heart size={13} color={saved ? C.coral : C.charcoal} fill={saved ? C.coral : "none"} />
            {saved ? "Saved" : "Save recipe"}
          </button>
          <button
            className="w-full py-2.5 rounded-full text-xs font-semibold shadow-sm"
            style={{ ...sans, background: C.primary, color: C.onPrimary }}
          >
            Add ingredients to grocery list
          </button>
        </div>

        {/* right: ingredients + steps, scrolls independently */}
        <div className="p-6 overflow-y-auto">
          <h3 className="text-sm font-bold mb-3" style={{ ...serif, fontWeight: 600, color: C.charcoal }}>
            Ingredients
          </h3>
          <div className="mb-6">
            {RECIPE.ingredients.map((ing) => (
              <div key={ing.id} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: C.line }}>
                <Checkbox checked={!!checked[ing.id]} onClick={() => toggle(ing.id)} />
                <span
                  className="flex-1 text-sm"
                  style={{ ...sans, color: checked[ing.id] ? C.faint : C.charcoal, textDecoration: checked[ing.id] ? "line-through" : "none" }}
                >
                  {ing.name}
                </span>
                <span className="text-xs font-medium" style={{ ...sans, color: C.muted }}>{ing.qty}</span>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold mb-3" style={{ ...serif, fontWeight: 600, color: C.charcoal }}>
            Steps
          </h3>
          <div className="flex flex-col gap-4">
            {RECIPE.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ border: `1.5px solid ${C.charcoal}`, color: C.charcoal, ...sans }}
                >
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed" style={{ ...sans, color: C.charcoal }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("week");
  const [recipeOpen, setRecipeOpen] = useState(false);

  return (
    <div className="w-full flex justify-center py-6" style={{ background: "#EDE4D3" }}>
      <style>{FONT_IMPORT}</style>
      <div
        className="relative flex rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: 1180, height: 720, background: C.bg }}
      >
        <Sidebar active={active} onNavigate={setActive} />
        <ThisWeekScreen onOpenRecipe={() => setRecipeOpen(true)} />
        {recipeOpen && <RecipeDetailModal onClose={() => setRecipeOpen(false)} />}
      </div>
    </div>
  );
}