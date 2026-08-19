import prisma from "../db/prisma.js";

export async function getHealth(_req, res) {
  res.json({ status: "ok" });
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// ── RECIPES ───────────────────────────────────

export async function getRecipes(_req, res, next) {
  try {
    const recipes = await prisma.recipes.findMany({
      include: {
        categories: true,
        cuisines: true,
        meal_types: true,
        recipe_tags: { include: { tags: true } },
        recipe_diet_preferences: { include: { diet_preferences: true } },
        ingredients: { orderBy: { id: "asc" } },
        preparation_steps: { orderBy: { step_number: "asc" } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(recipes);
  } catch (error) {
    next(error);
  }
}

export async function getRecipeById(req, res, next) {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipes.findUnique({
      where: { id: BigInt(id) },
      include: {
        categories: true,
        cuisines: true,
        meal_types: true,
        recipe_tags: { include: { tags: true } },
        recipe_diet_preferences: { include: { diet_preferences: true } },
        ingredients: { orderBy: { id: "asc" } },
        preparation_steps: { orderBy: { step_number: "asc" } },
      },
    });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    next(error);
  }
}

// ── MEAL PLANS ────────────────────────────────

export async function getMealPlan(req, res, next) {
  try {
    const { userId } = req.params;

    // Get Monday of the current week
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const mealPlan = await prisma.meal_plans.findFirst({
      where: {
        user_id: userId,
        week_start: monday,
      },
      include: {
        meal_plan_entries: {
          include: {
            recipes: {
              include: {
                categories: true,
                cuisines: true,
                meal_types: true,
                ingredients: true,
                preparation_steps: { orderBy: { step_number: "asc" } },
                recipe_tags: { include: { tags: true } },
              },
            },
          },
        },
      },
    });

    if (!mealPlan) {
      return res.json(null);
    }

    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
}

export async function addMealPlanEntry(req, res, next) {
  try {
    const { userId, recipeId, dayOfWeek, mealTime } = req.body;

    if (!userId || !recipeId || !dayOfWeek || !mealTime) {
      return res.status(400).json({ message: "userId, recipeId, dayOfWeek and mealTime are required" });
    }

    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    let mealPlan = await prisma.meal_plans.findFirst({
      where: { user_id: userId, week_start: monday },
    });

    if (!mealPlan) {
      mealPlan = await prisma.meal_plans.create({
        data: { user_id: userId, week_start: monday },
      });
    }

    // ✅ create instead of upsert — allows multiple per slot
    const entry = await prisma.meal_plan_entries.create({
      data: {
        meal_plan_id: mealPlan.id,
        recipe_id: BigInt(recipeId),
        day_of_week: dayOfWeek,
        meal_time: mealTime,
        servings: 1,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
}

export async function removeMealPlanEntry(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.meal_plan_entries.delete({
      where: { id: BigInt(id) },
    });
    res.json({ message: "Entry removed" });
  } catch (error) {
    next(error);
  }
}

// ── GROCERY LIST ──────────────────────────────

export async function getGroceryList(req, res, next) {
  try {
    const { userId } = req.params;

    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const mealPlan = await prisma.meal_plans.findFirst({
      where: { user_id: userId, week_start: monday },
    });

    if (!mealPlan) return res.json(null);

    const groceryList = await prisma.grocery_lists.findFirst({
      where: { meal_plan_id: mealPlan.id },
      include: {
        grocery_list_items: { orderBy: { id: "asc" } },
      },
    });

    res.json(groceryList);
  } catch (error) {
    next(error);
  }
}

export async function generateGroceryList(req, res, next) {
  try {
    const { userId } = req.body;

    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    // Get meal plan with all recipe ingredients
    const mealPlan = await prisma.meal_plans.findFirst({
      where: { user_id: userId, week_start: monday },
      include: {
        meal_plan_entries: {
          include: {
            recipes: {
              include: { ingredients: true },
            },
          },
        },
      },
    });

    if (!mealPlan) {
      return res.status(404).json({ message: "No meal plan found for this week" });
    }

    // Collect and deduplicate all ingredients
    const ingredientMap = {};
    for (const entry of mealPlan.meal_plan_entries) {
      const servings = entry.servings || 1;
      for (const ing of entry.recipes?.ingredients || []) {
        const key = `${ing.name.toLowerCase()}__${ing.unit || ""}`;
        if (ingredientMap[key]) {
          ingredientMap[key].total_quantity =
            (parseFloat(ingredientMap[key].total_quantity) || 0) +
            (parseFloat(ing.quantity) || 0) * servings;
        } else {
          ingredientMap[key] = {
            ingredient_name: ing.name,
            total_quantity: (parseFloat(ing.quantity) || 0) * servings,
            unit: ing.unit || null,
            notes: ing.notes || null,
            is_checked: false,
          };
        }
      }
    }

    const items = Object.values(ingredientMap);

    // Delete existing grocery list and recreate
    await prisma.grocery_lists.deleteMany({
      where: { meal_plan_id: mealPlan.id },
    });

    const groceryList = await prisma.grocery_lists.create({
      data: {
        meal_plan_id: mealPlan.id,
        grocery_list_items: { create: items },
      },
      include: {
        grocery_list_items: { orderBy: { id: "asc" } },
      },
    });

    res.status(201).json(groceryList);
  } catch (error) {
    next(error);
  }
}

export async function toggleGroceryItem(req, res, next) {
  try {
    const { id } = req.params;
    const item = await prisma.grocery_list_items.findUnique({
      where: { id: BigInt(id) },
    });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const updated = await prisma.grocery_list_items.update({
      where: { id: BigInt(id) },
      data: { is_checked: !item.is_checked },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function addGroceryItem(req, res, next) {
  try {
    const { groceryListId, ingredientName, quantity, unit } = req.body;
    if (!groceryListId || !ingredientName) {
      return res.status(400).json({ message: "groceryListId and ingredientName are required" });
    }
    const item = await prisma.grocery_list_items.create({
      data: {
        grocery_list_id: BigInt(groceryListId),
        ingredient_name: ingredientName,
        total_quantity: quantity ? parseFloat(quantity) : null,
        unit: unit || null,
        is_checked: false,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function deleteGroceryItem(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.grocery_list_items.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
}

// ── SAVED RECIPES ─────────────────────────────

export async function getSavedRecipes(req, res, next) {
  try {
    const { userId } = req.params;
    const saved = await prisma.saved_recipes.findMany({
      where: { user_id: userId },
      include: {
        recipes: {
          include: {
            categories: true,
            cuisines: true,
            meal_types: true,
            recipe_tags: { include: { tags: true } },
            ingredients: true,
            preparation_steps: { orderBy: { step_number: "asc" } },
          },
        },
      },
      orderBy: { saved_at: "desc" },
    });
    res.json(saved.map((s) => ({ ...s.recipes, saved_at: s.saved_at })));
  } catch (error) {
    next(error);
  }
}

export async function saveRecipe(req, res, next) {
  try {
    const { userId, recipeId } = req.body;
    if (!userId || !recipeId) {
      return res.status(400).json({ message: "userId and recipeId are required" });
    }
    const saved = await prisma.saved_recipes.create({
      data: { user_id: userId, recipe_id: BigInt(recipeId) },
    });
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Recipe already saved" });
    }
    next(error);
  }
}

export async function unsaveRecipe(req, res, next) {
  try {
    const { userId, recipeId } = req.params;
    await prisma.saved_recipes.deleteMany({
      where: { user_id: userId, recipe_id: BigInt(recipeId) },
    });
    res.json({ message: "Recipe unsaved" });
  } catch (error) {
    next(error);
  }
}

// ── LOOKUP TABLES ─────────────────────────────

export async function getTags(_req, res, next) {
  try {
    const tags = await prisma.tags.findMany({ orderBy: { name: "asc" } });
    res.json(tags);
  } catch (error) {
    next(error);
  }
}

export async function getCategories(_req, res, next) {
  try {
    const categories = await prisma.categories.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCuisines(_req, res, next) {
  try {
    const cuisines = await prisma.cuisines.findMany({ orderBy: { name: "asc" } });
    res.json(cuisines);
  } catch (error) {
    next(error);
  }
}

export async function getDietPreferences(_req, res, next) {
  try {
    const prefs = await prisma.diet_preferences.findMany({ orderBy: { name: "asc" } });
    res.json(prefs);
  } catch (error) {
    next(error);
  }
}

// ── PROFILES ──────────────────────────────────

export async function getOrCreateProfile(req, res, next) {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ message: "userId and email are required" });
    }
    const profile = await prisma.profiles.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email },
    });
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

