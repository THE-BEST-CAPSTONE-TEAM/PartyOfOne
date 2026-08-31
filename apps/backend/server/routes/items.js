import { Router } from "express";
import {
  getHealth,
  getRecipes,
  getRecipeById,
  getMealPlan,
  addMealPlanEntry,
  removeMealPlanEntry,
  generateGroceryList,
  toggleGroceryItem,
  addGroceryItem,
  deleteGroceryItem,
  getSavedRecipes,
  saveRecipe,
  unsaveRecipe,
  getTags,
  getCategories,
  getCuisines,
  getDietPreferences,
  getOrCreateProfile,
  getGroceryList,
  createRecipe,
  deleteRecipe,
  getMealTypes,
  updateRecipePhoto
} from "../controllers/itemController.js";

const router = Router();

router.get("/health", getHealth);

// ── RECIPES ───────────────────────────────────
router.get("/recipes", getRecipes);
router.get("/recipes/:id", getRecipeById);
router.post("/recipes", createRecipe);
router.delete("/recipes/:id", deleteRecipe);

// ── MEAL PLAN ─────────────────────────────────
router.get("/meal-plan/:userId", getMealPlan);
router.post("/meal-plan/entry", addMealPlanEntry);
router.delete("/meal-plan/entry/:id", removeMealPlanEntry);

router.get("/meal-types", getMealTypes);

// ── GROCERY LIST ──────────────────────────────
router.get("/grocery/:userId", getGroceryList);
router.post("/grocery/generate", generateGroceryList);
router.patch("/grocery/item/:id/toggle", toggleGroceryItem);
router.post("/grocery/item", addGroceryItem);
router.delete("/grocery/item/:id", deleteGroceryItem);

// ── SAVED RECIPES ─────────────────────────────
router.get("/saved/:userId", getSavedRecipes);
router.post("/saved", saveRecipe);
router.delete("/saved/:userId/:recipeId", unsaveRecipe);

// ── LOOKUP TABLES ─────────────────────────────
router.get("/tags", getTags);
router.get("/categories", getCategories);
router.get("/cuisines", getCuisines);
router.get("/diet-preferences", getDietPreferences);

// ── PROFILES ──────────────────────────────────
router.post("/profile", getOrCreateProfile);

router.patch("/recipes/:id/photo", updateRecipePhoto);

export default router;