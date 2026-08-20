import React, { useState, useEffect } from "react";
import { Heart, Clock, Flame } from "lucide-react";
import { fetchSavedRecipes, unsaveRecipe } from "../api/items";

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

function SavedCard({ recipe, onUnsave, onOpen }) {
  const [hovering, setHovering] = useState(false);
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
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ ...sans, background: C.primary, color: C.onPrimary }}
            >
              + Add to week
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnsave(recipe);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,251,245,0.9)" }}
            >
              <Heart size={14} color={C.primary} fill={C.primary} />
            </button>
          </div>
        )}
        {!hovering && (
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

export default function SavedScreen({ onOpenRecipe, userId }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSavedRecipes(userId);
        setSaved(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleUnsave = async (recipe) => {
    // Optimistic remove
    setSaved((prev) => prev.filter((r) => r.id !== recipe.id));
    try {
      await unsaveRecipe(userId, recipe.id);
    } catch {
      setSaved((prev) => [...prev, recipe]);
    }
  };

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p style={{ ...sans, color: C.muted }}>Loading saved recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p style={{ ...sans, color: C.primary }}>Failed to load: {error}</p>
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ background: C.bg }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: C.sand }}
        >
          <Heart size={28} color={C.faint} />
        </div>
        <p
          className="text-xl mb-2"
          style={{ ...serif, fontWeight: 600, color: C.charcoal }}
        >
          No saved recipes yet
        </p>
        <p
          className="text-sm text-center max-w-xs"
          style={{ ...sans, color: C.muted }}
        >
          Tap the heart on any recipe to save it here for quick access later.
        </p>
      </div>
    );
  }

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
            Saved
          </h1>
          <p className="text-sm" style={{ ...sans, color: C.muted }}>
            {saved.length} saved recipe{saved.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {saved.map((r) => (
          <SavedCard
            key={r.id}
            recipe={r}
            onUnsave={handleUnsave}
            onOpen={onOpenRecipe}
          />
        ))}
      </div>
    </div>
  );
}
