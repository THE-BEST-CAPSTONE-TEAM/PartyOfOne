import prisma from "../db/prisma.js";

function safeNumber(value) {
  if (typeof value === "bigint") {
    return Number(value);
  }

  return value;
}

function toItemShape(record) {
  const category = record.categories ?? record.category ?? null;

  return {
    id: safeNumber(record.id),
    name: record.name,
    description: record.description ?? "",
    categoryId: safeNumber(category?.id ?? record.category_id ?? null),
    category: category
      ? { id: safeNumber(category.id), name: category.name }
      : null,
  };
}

function toCalorieRangeShape(record) {
  return {
    id: safeNumber(record.id),
    label: record.label,
    minCalories: safeNumber(record.min_calories),
    maxCalories: safeNumber(record.max_calories),
  };
}

function toCookingTimeShape(record) {
  return {
    id: safeNumber(record.id),
    label: record.label,
    maxMinutes: safeNumber(record.max_minutes),
  };
}

function toCuisineShape(record) {
  return {
    id: safeNumber(record.id),
    name: record.name,
    emoji: record.emoji ?? null,
  };
}

function toDietPreferenceShape(record) {
  return {
    id: safeNumber(record.id),
    name: record.name,
    emoji: record.emoji ?? null,
    description: record.description ?? null,
  };
}

function toChangeLogShape(record) {
  return {
    id: safeNumber(record.id),
    recipeId: safeNumber(record.recipe_id),
    changedBy: record.changed_by,
    changedByEmail: record.changed_by_email,
    changedAt: record.changed_at,
    changes: record.changes,
    profile: record.profiles
      ? {
          id: record.profiles.id,
          email: record.profiles.email,
          displayName: record.profiles.display_name,
        }
      : null,
    recipe: record.recipes
      ? {
          id: safeNumber(record.recipes.id),
          name: record.recipes.name,
        }
      : null,
  };
}

function toGroceryListItemShape(record) {
  return {
    id: safeNumber(record.id),
    groceryListId: safeNumber(record.grocery_list_id),
    ingredientName: record.ingredient_name,
    totalQuantity: record.total_quantity ? Number(record.total_quantity) : null,
    unit: record.unit ?? null,
    isChecked: Boolean(record.is_checked),
    notes: record.notes ?? null,
  };
}

function toGroceryListShape(record) {
  return {
    id: safeNumber(record.id),
    mealPlanId: safeNumber(record.meal_plan_id),
    generatedAt: record.generated_at,
    updatedAt: record.updated_at,
  };
}

function toHealthGoalShape(record) {
  return {
    id: safeNumber(record.id),
    name: record.name,
    description: record.description ?? null,
  };
}

function toIngredientShape(record) {
  return {
    id: safeNumber(record.id),
    recipeId: safeNumber(record.recipe_id),
    name: record.name,
    quantity: record.quantity ? Number(record.quantity) : null,
    unit: record.unit ?? null,
    notes: record.notes ?? null,
  };
}

function toMealPlanEntryShape(record) {
  return {
    id: safeNumber(record.id),
    mealPlanId: safeNumber(record.meal_plan_id),
    recipeId: record.recipe_id ? safeNumber(record.recipe_id) : null,
    dayOfWeek: record.day_of_week,
    mealTime: record.meal_time,
    servings: record.servings ?? null,
    notes: record.notes ?? null,
  };
}

function toMealPlanShape(record) {
  return {
    id: safeNumber(record.id),
    userId: record.user_id,
    weekStart: record.week_start,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function toPreparationStepShape(record) {
  return {
    id: safeNumber(record.id),
    recipeId: safeNumber(record.recipe_id),
    stepNumber: safeNumber(record.step_number),
    instruction: record.instruction,
  };
}

function toRecipeTagShape(record) {
  return {
    recipeId: safeNumber(record.recipe_id),
    tagId: safeNumber(record.tag_id),
  };
}

function toMealTypeShape(record) {
  return {
    id: safeNumber(record.id),
    name: record.name,
    emoji: record.emoji ?? null,
  };
}

function toProfileShape(record) {
  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name ?? null,
    createdAt: record.created_at,
  };
}

function toRecipeDietPreferenceShape(record) {
  return {
    recipeId: safeNumber(record.recipe_id),
    dietPreferenceId: safeNumber(record.diet_preference_id),
  };
}

function toTagShape(record) {
  return {
    id: safeNumber(record.id),
    name: record.name,
  };
}

function toUserCaloriePreferenceShape(record) {
  return {
    userId: record.user_id,
    calorieRangeId: safeNumber(record.calorie_range_id),
  };
}

function toUserCookingTimePreferenceShape(record) {
  return {
    userId: record.user_id,
    cookingTimeId: safeNumber(record.cooking_time_id),
  };
}

function toUserCuisinePreferenceShape(record) {
  return {
    userId: record.user_id,
    cuisineId: safeNumber(record.cuisine_id),
  };
}

function toUserDietPreferenceShape(record) {
  return {
    userId: record.user_id,
    dietPreferenceId: safeNumber(record.diet_preference_id),
  };
}

function toUserHealthGoalShape(record) {
  return {
    userId: record.user_id,
    healthGoalId: safeNumber(record.health_goal_id),
  };
}

export async function getHealth(_req, res) {
  res.json({ status: "ok" });
}

export async function getCategories(_req, res, next) {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCalorieRanges(_req, res, next) {
  try {
    const data = await prisma.calorie_ranges.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toCalorieRangeShape));
  } catch (error) {
    next(error);
  }
}

export async function getCookingTimes(_req, res, next) {
  try {
    const data = await prisma.cooking_times.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toCookingTimeShape));
  } catch (error) {
    next(error);
  }
}

export async function getCuisines(_req, res, next) {
  try {
    const data = await prisma.cuisines.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toCuisineShape));
  } catch (error) {
    next(error);
  }
}

export async function getDietPreferences(_req, res, next) {
  try {
    const data = await prisma.diet_preferences.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toDietPreferenceShape));
  } catch (error) {
    next(error);
  }
}

export async function getChangeLog(_req, res, next) {
  try {
    const data = await prisma.change_log.findMany({
      include: {
        profiles: true,
        recipes: true,
      },
      orderBy: { changed_at: "desc" },
    });

    return res.json(data.map(toChangeLogShape));
  } catch (error) {
    next(error);
  }
}

export async function getGroceryListItems(_req, res, next) {
  try {
    const data = await prisma.grocery_list_items.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toGroceryListItemShape));
  } catch (error) {
    next(error);
  }
}

export async function getGroceryLists(_req, res, next) {
  try {
    const data = await prisma.grocery_lists.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toGroceryListShape));
  } catch (error) {
    next(error);
  }
}

export async function getHealthGoals(_req, res, next) {
  try {
    const data = await prisma.health_goals.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toHealthGoalShape));
  } catch (error) {
    next(error);
  }
}

export async function getIngredients(_req, res, next) {
  try {
    const data = await prisma.ingredients.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toIngredientShape));
  } catch (error) {
    next(error);
  }
}

export async function getMealPlanEntries(_req, res, next) {
  try {
    const data = await prisma.meal_plan_entries.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toMealPlanEntryShape));
  } catch (error) {
    next(error);
  }
}

export async function getMealPlans(_req, res, next) {
  try {
    const data = await prisma.meal_plans.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toMealPlanShape));
  } catch (error) {
    next(error);
  }
}

export async function getMealTypes(_req, res, next) {
  try {
    const data = await prisma.meal_types.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toMealTypeShape));
  } catch (error) {
    next(error);
  }
}

export async function getPreparationSteps(_req, res, next) {
  try {
    const data = await prisma.preparation_steps.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toPreparationStepShape));
  } catch (error) {
    next(error);
  }
}

export async function getProfiles(_req, res, next) {
  try {
    const data = await prisma.profiles.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toProfileShape));
  } catch (error) {
    next(error);
  }
}

export async function getRecipeDietPreferences(_req, res, next) {
  try {
    const data = await prisma.recipe_diet_preferences.findMany({
      orderBy: [{ recipe_id: "asc" }, { diet_preference_id: "asc" }],
    });

    return res.json(data.map(toRecipeDietPreferenceShape));
  } catch (error) {
    next(error);
  }
}

export async function getRecipeTags(_req, res, next) {
  try {
    const data = await prisma.recipe_tags.findMany({
      orderBy: [{ recipe_id: "asc" }, { tag_id: "asc" }],
    });

    return res.json(data.map(toRecipeTagShape));
  } catch (error) {
    next(error);
  }
}

export async function getTags(_req, res, next) {
  try {
    const data = await prisma.tags.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(data.map(toTagShape));
  } catch (error) {
    next(error);
  }
}

export async function getUserCaloriePreferences(_req, res, next) {
  try {
    const data = await prisma.user_calorie_preferences.findMany({
      orderBy: [{ user_id: "asc" }, { calorie_range_id: "asc" }],
    });

    return res.json(data.map(toUserCaloriePreferenceShape));
  } catch (error) {
    next(error);
  }
}

export async function getUserCookingTimePreferences(_req, res, next) {
  try {
    const data = await prisma.user_cooking_time_preferences.findMany({
      orderBy: [{ user_id: "asc" }, { cooking_time_id: "asc" }],
    });

    return res.json(data.map(toUserCookingTimePreferenceShape));
  } catch (error) {
    next(error);
  }
}

export async function getUserCuisinePreferences(_req, res, next) {
  try {
    const data = await prisma.user_cuisine_preferences.findMany({
      orderBy: [{ user_id: "asc" }, { cuisine_id: "asc" }],
    });

    return res.json(data.map(toUserCuisinePreferenceShape));
  } catch (error) {
    next(error);
  }
}

export async function getUserDietPreferences(_req, res, next) {
  try {
    const data = await prisma.user_diet_preferences.findMany({
      orderBy: [{ user_id: "asc" }, { diet_preference_id: "asc" }],
    });

    return res.json(data.map(toUserDietPreferenceShape));
  } catch (error) {
    next(error);
  }
}

export async function getUserHealthGoals(_req, res, next) {
  try {
    const data = await prisma.user_health_goals.findMany({
      orderBy: [{ user_id: "asc" }, { health_goal_id: "asc" }],
    });

    return res.json(data.map(toUserHealthGoalShape));
  } catch (error) {
    next(error);
  }
}

export async function getItems(_req, res, next) {
  try {
    const items = await prisma.recipes.findMany({
      include: {
        categories: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json(items.map(toItemShape));
  } catch (error) {
    next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    const { name, description, categoryId } = req.body ?? {};

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required.",
      });
    }

    const createdRecipe = await prisma.recipes.create({
      data: {
        name,
        description,
        category_id: categoryId ? Number(categoryId) : null,
      },
      include: {
        categories: true,
      },
    });

    return res.status(201).json(toItemShape(createdRecipe));
  } catch (error) {
    next(error);
  }
}
