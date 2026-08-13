import { Router } from "express";
import {
  createItem,
  getCalorieRanges,
  getCategories,
  getChangeLog,
  getCookingTimes,
  getCuisines,
  getDietPreferences,
  getGroceryListItems,
  getGroceryLists,
  getHealth,
  getHealthGoals,
  getIngredients,
  getItems,
  getMealPlanEntries,
  getMealPlans,
  getMealTypes,
  getPreparationSteps,
  getProfiles,
  getRecipeDietPreferences,
  getRecipeTags,
  getTags,
  getUserCaloriePreferences,
  getUserCookingTimePreferences,
  getUserCuisinePreferences,
  getUserDietPreferences,
  getUserHealthGoals,
} from "../controllers/itemController.js";

const router = Router();

router.get("/health", getHealth);
router.get("/items", getItems);
router.post("/items", createItem);
router.get("/categories", getCategories);
router.get("/calorie-ranges", getCalorieRanges);
router.get("/change-log", getChangeLog);
router.get("/cooking-times", getCookingTimes);
router.get("/cuisines", getCuisines);
router.get("/diet-preferences", getDietPreferences);
router.get("/grocery-list-items", getGroceryListItems);
router.get("/grocery-lists", getGroceryLists);
router.get("/health-goals", getHealthGoals);
router.get("/ingredients", getIngredients);
router.get("/meal-plan-entries", getMealPlanEntries);
router.get("/meal-plans", getMealPlans);
router.get("/meal-types", getMealTypes);
router.get("/preparation-steps", getPreparationSteps);
router.get("/profiles", getProfiles);
router.get("/recipe-diet-preferences", getRecipeDietPreferences);
router.get("/recipe-tags", getRecipeTags);
router.get("/tags", getTags);
router.get("/user-calorie-preferences", getUserCaloriePreferences);
router.get("/user-cooking-time-preferences", getUserCookingTimePreferences);
router.get("/user-cuisine-preferences", getUserCuisinePreferences);
router.get("/user-diet-preferences", getUserDietPreferences);
router.get("/user-health-goals", getUserHealthGoals);

export default router;
