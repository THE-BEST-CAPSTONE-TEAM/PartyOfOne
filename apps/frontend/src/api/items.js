const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ── RECIPES ───────────────────────────────────

// export async function fetchRecipes() {
//   const res = await fetch(`${API_BASE_URL}/recipes`);
//   if (!res.ok) throw new Error("Failed to fetch recipes");
//   return res.json();
// }

// ✅ Pass userId as query param
export async function fetchRecipes(userId) {
  const url = userId
    ? `${API_BASE_URL}/recipes?userId=${userId}`
    : `${API_BASE_URL}/recipes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

// ✅ Pass userId so backend can verify ownership
export async function deleteRecipe(id, userId) {
  const res = await fetch(`${API_BASE_URL}/recipes/${id}?userId=${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete recipe");
  return res.json();
}

export async function fetchRecipeById(id) {
  const res = await fetch(`${API_BASE_URL}/recipes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch recipe");
  return res.json();
}

export async function createRecipe(data) {
  const res = await fetch(`${API_BASE_URL}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create recipe");
  return res.json();
}

// export async function deleteRecipe(id) {
//   const res = await fetch(`${API_BASE_URL}/recipes/${id}`, {
//     method: "DELETE",
//   });
//   if (!res.ok) throw new Error("Failed to delete recipe");
//   return res.json();
// }

// ── MEAL PLAN ─────────────────────────────────

export async function fetchMealPlan(userId, weekStart) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  const res = await fetch(`${API_BASE_URL}/meal-plan/${userId}${params}`);
  if (!res.ok) throw new Error("Failed to fetch meal plan");
  return res.json();
}

export async function addMealPlanEntry(userId, recipeId, dayOfWeek, mealTime, weekStart) {
  const res = await fetch(`${API_BASE_URL}/meal-plan/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, recipeId, dayOfWeek, mealTime, weekStart }),
  });
  if (!res.ok) throw new Error("Failed to add meal plan entry");
  return res.json();
}

export async function removeMealPlanEntry(entryId) {
  const res = await fetch(`${API_BASE_URL}/meal-plan/entry/${entryId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove meal plan entry");
  return res.json();
}

// ── GROCERY LIST ──────────────────────────────

export async function fetchGroceryList(userId, weekStart) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  const res = await fetch(`${API_BASE_URL}/grocery/${userId}${params}`);
  if (!res.ok) throw new Error("Failed to fetch grocery list");
  return res.json();
}

export async function generateGroceryList(userId, weekStart) {
  const res = await fetch(`${API_BASE_URL}/grocery/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, weekStart }),
  });
  if (!res.ok) throw new Error("Failed to generate grocery list");
  return res.json();
}

export async function toggleGroceryItem(itemId) {
  const res = await fetch(`${API_BASE_URL}/grocery/item/${itemId}/toggle`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle item");
  return res.json();
}

export async function addGroceryItem(groceryListId, ingredientName, quantity, unit) {
  const res = await fetch(`${API_BASE_URL}/grocery/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groceryListId, ingredientName, quantity, unit }),
  });
  if (!res.ok) throw new Error("Failed to add grocery item");
  return res.json();
}

export async function deleteGroceryItem(itemId) {
  const res = await fetch(`${API_BASE_URL}/grocery/item/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete grocery item");
  return res.json();
}

// ── SAVED RECIPES ─────────────────────────────

export async function fetchSavedRecipes(userId) {
  const res = await fetch(`${API_BASE_URL}/saved/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch saved recipes");
  return res.json();
}

export async function saveRecipe(userId, recipeId) {
  const res = await fetch(`${API_BASE_URL}/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, recipeId }),
  });
  if (!res.ok && res.status !== 409) throw new Error("Failed to save recipe");
  return res.json();
}

export async function unsaveRecipe(userId, recipeId) {
  const res = await fetch(`${API_BASE_URL}/saved/${userId}/${recipeId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to unsave recipe");
  return res.json();
}

// ── LOOKUP TABLES ─────────────────────────────

export async function fetchTags() {
  const res = await fetch(`${API_BASE_URL}/tags`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchCuisines() {
  const res = await fetch(`${API_BASE_URL}/cuisines`);
  if (!res.ok) throw new Error("Failed to fetch cuisines");
  return res.json();
}

export async function fetchDietPreferences() {
  const res = await fetch(`${API_BASE_URL}/diet-preferences`);
  if (!res.ok) throw new Error("Failed to fetch diet preferences");
  return res.json();
}

// ── PROFILES ──────────────────────────────────

export async function getOrCreateProfile(userId, email) {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email }),
  });
  if (!res.ok) throw new Error("Failed to get or create profile");
  return res.json();
}