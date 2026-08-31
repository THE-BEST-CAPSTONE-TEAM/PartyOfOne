import prisma from "../db/prisma.js";

export async function getHealth(_req, res) {
  res.json({ status: "ok" });
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// ── RECIPES ───────────────────────────────────
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
export async function getRecipes(req, res, next) {
  try {
    const { userId } = req.query;

    const recipes = await prisma.recipes.findMany({
      where: userId ? {
        OR: [
          { user_id: userId },   // ✅ their own recipes
          { user_id: null },     // ✅ base/seed recipes visible to everyone
        ]
      } : undefined,
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

export async function deleteRecipe(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.query; // ✅ pass userId to verify ownership

    const existing = await prisma.recipes.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // ✅ Only allow delete if this user owns the recipe
    if (existing.user_id !== userId) {
      return res.status(403).json({ message: "You can only delete your own recipes" });
    }

    await prisma.recipes.delete({ where: { id: BigInt(id) } });
    res.json({ message: `Recipe ${id} deleted` });
  } catch (error) {
    next(error);
  }
}

export async function createRecipe(req, res, next) {
  try {
    const {
      name, description, cook_time, prep_time, servings,
      calories_per_serving, difficulty, category_id, cuisine_id,
      meal_type_id, photo_url, is_public, updated_by,
      ingredients, preparation_steps, tags,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Recipe name is required" });

    const recipe = await prisma.recipes.create({
      data: {
        name,
        description,
        cook_time: cook_time ? Number(cook_time) : null,
        prep_time: prep_time ? Number(prep_time) : null,
        servings: servings ? Number(servings) : 1,
        calories_per_serving: calories_per_serving ? Number(calories_per_serving) : null,
        difficulty,
        category_id: category_id ? Number(category_id) : null,
        cuisine_id: cuisine_id ? Number(cuisine_id) : null,
        meal_type_id: meal_type_id ? Number(meal_type_id) : null,
        photo_url: photo_url || null,
        is_public: is_public ?? false,
        user_id: updated_by || null, // ✅ store who created it
        updated_by: updated_by || null,
        ingredients: ingredients?.length ? {
          create: ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity ? parseFloat(i.quantity) : null,
            unit: i.unit || null,
            notes: i.notes || null,
          }))
        } : undefined,
        preparation_steps: preparation_steps?.length ? {
          create: preparation_steps.map((s) => ({
            step_number: s.step_number,
            instruction: s.instruction,
          }))
        } : undefined,
        recipe_tags: tags?.length ? {
          create: tags.map((tag_id) => ({
            tags: { connect: { id: Number(tag_id) } }
          }))
        } : undefined,
      },
      include: {
        categories: true,
        cuisines: true,
        meal_types: true,
        ingredients: true,
        preparation_steps: { orderBy: { step_number: "asc" } },
        recipe_tags: { include: { tags: true } },
      },
    });

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
}

// ── MEAL PLANS ────────────────────────────────

export async function getMealPlan(req, res, next) {
  try {
    const { userId } = req.params;
    const { weekStart } = req.query; // ✅ accept specific week

    let monday;
    if (weekStart) {
      monday = new Date(weekStart);
      monday.setHours(0, 0, 0, 0);
    } else {
      const today = new Date();
      const day = today.getDay();
      monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
    }

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

    if (!mealPlan) return res.json(null);
    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
}

export async function addMealPlanEntry(req, res, next) {
  try {
    const { userId, recipeId, dayOfWeek, mealTime, weekStart } = req.body;

    let monday;
    if (weekStart) {
      monday = new Date(weekStart);
      monday.setHours(0, 0, 0, 0);
    } else {
      const today = new Date();
      const day = today.getDay();
      monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
    }

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

export async function getMealTypes(_req, res, next) {
  try {
    const mealTypes = await prisma.meal_types.findMany({ orderBy: { id: "asc" } });
    res.json(mealTypes);
  } catch (error) {
    next(error);
  }
}

// ── GROCERY LIST ──────────────────────────────

export async function generateGroceryList(req, res, next) {
  try {
    const { userId, weekStart } = req.body; // ✅ accept weekStart

    let monday;
    if (weekStart) {
      monday = new Date(weekStart);
      monday.setHours(0, 0, 0, 0);
    } else {
      const today = new Date();
      const day = today.getDay();
      monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
    }

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

export async function getGroceryList(req, res, next) {
  try {
    const { userId } = req.params;
    const { weekStart } = req.query; // ✅ accept weekStart

    let monday;
    if (weekStart) {
      monday = new Date(weekStart);
      monday.setHours(0, 0, 0, 0);
    } else {
      const today = new Date();
      const day = today.getDay();
      monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
    }

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

export async function updateRecipePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const { photo_url } = req.body;

    const recipe = await prisma.recipes.update({
      where: { id: BigInt(id) },
      data: { photo_url },
    });

    res.json(recipe);
  } catch (error) {
    next(error);
  }
}

