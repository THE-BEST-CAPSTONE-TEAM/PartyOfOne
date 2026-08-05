import "dotenv/config";
import prisma from "../server/db/prisma.js";

async function main() {
  // ── LOOKUP TABLES ─────────────────────────────
  console.log("Seeding lookup tables...");

  await prisma.diet_preferences.createMany({
    data: [
      { name: "Vegetarian", emoji: "🥗" },
      { name: "Vegan", emoji: "🌱" },
      { name: "High Protein", emoji: "🥩" },
      { name: "Keto", emoji: "🥑" },
      { name: "Low Carb", emoji: "🍚" },
      { name: "Gluten-Free", emoji: "🌾" },
      { name: "Dairy-Free", emoji: "🥛" },
      { name: "Nut-Free", emoji: "🌰" },
      { name: "Pescatarian", emoji: "🐟" },
      { name: "Plant-Based", emoji: "🌿" },
      { name: "Paleo", emoji: "🍎" },
      { name: "Mediterranean", emoji: "🥣" },
      { name: "Low Sugar", emoji: "🍬" },
      { name: "Heart Healthy", emoji: "❤️" },
    ],
    skipDuplicates: true,
  });

  await prisma.meal_types.createMany({
    data: [
      { name: "Breakfast", emoji: "🍳" },
      { name: "Lunch", emoji: "🥪" },
      { name: "Dinner", emoji: "🍝" },
      { name: "Snack", emoji: "🍎" },
      { name: "Dessert", emoji: "🍰" },
      { name: "Drinks", emoji: "☕" },
    ],
    skipDuplicates: true,
  });

  await prisma.health_goals.createMany({
    data: [
      { name: "Weight Loss" },
      { name: "Weight Gain" },
      { name: "Muscle Building" },
      { name: "Maintenance" },
      { name: "Meal Prep" },
      { name: "Family Meals" },
    ],
    skipDuplicates: true,
  });

  await prisma.cuisines.createMany({
    data: [
      { name: "Italian" },
      { name: "Ethiopian" },
      { name: "Mexican" },
      { name: "Chinese" },
      { name: "Japanese" },
      { name: "Indian" },
      { name: "Thai" },
      { name: "Mediterranean" },
      { name: "American" },
      { name: "Korean" },
      { name: "African" },
    ],
    skipDuplicates: true,
  });

  await prisma.cooking_times.createMany({
    data: [
      { label: "Under 15 minutes", max_minutes: 15 },
      { label: "Under 30 minutes", max_minutes: 30 },
      { label: "Under 1 hour", max_minutes: 60 },
      { label: "1+ hours", max_minutes: null },
    ],
    skipDuplicates: true,
  });

  await prisma.calorie_ranges.createMany({
    data: [
      { label: "Under 300", min_calories: null, max_calories: 300 },
      { label: "300–500", min_calories: 300, max_calories: 500 },
      { label: "500–700", min_calories: 500, max_calories: 700 },
      { label: "700+", min_calories: 700, max_calories: null },
    ],
    skipDuplicates: true,
  });

  await prisma.categories.createMany({
    data: [
      { name: "Breakfast" },
      { name: "Lunch" },
      { name: "Dinner" },
      { name: "Snack" },
      { name: "Dessert" },
      { name: "Soup & Salad" },
      { name: "Side Dish" },
    ],
    skipDuplicates: true,
  });

  await prisma.tags.createMany({
    data: [
      { name: "quick" },
      { name: "vegetarian" },
      { name: "vegan" },
      { name: "gluten-free" },
      { name: "dairy-free" },
      { name: "meal-prep" },
      { name: "budget-friendly" },
      { name: "high-protein" },
      { name: "low-carb" },
      { name: "comfort-food" },
    ],
    skipDuplicates: true,
  });

  // ── FETCH LOOKUP IDS ──────────────────────────
  console.log("Fetching lookup IDs...");

  const [
    breakfast, lunch, dinner
  ] = await Promise.all([
    prisma.meal_types.findUnique({ where: { name: "Breakfast" } }),
    prisma.meal_types.findUnique({ where: { name: "Lunch" } }),
    prisma.meal_types.findUnique({ where: { name: "Dinner" } }),
  ]);

  const [
    italian, mexican, american, japanese, indian, mediterranean
  ] = await Promise.all([
    prisma.cuisines.findUnique({ where: { name: "Italian" } }),
    prisma.cuisines.findUnique({ where: { name: "Mexican" } }),
    prisma.cuisines.findUnique({ where: { name: "American" } }),
    prisma.cuisines.findUnique({ where: { name: "Japanese" } }),
    prisma.cuisines.findUnique({ where: { name: "Indian" } }),
    prisma.cuisines.findUnique({ where: { name: "Mediterranean" } }),
  ]);

  const [
    breakfastCat, lunchCat, dinnerCat, sideDishCat
  ] = await Promise.all([
    prisma.categories.findUnique({ where: { name: "Breakfast" } }),
    prisma.categories.findUnique({ where: { name: "Lunch" } }),
    prisma.categories.findUnique({ where: { name: "Dinner" } }),
    prisma.categories.findUnique({ where: { name: "Side Dish" } }),
  ]);

  const [
    tagQuick, tagVegetarian, tagVegan, tagGlutenFree,
    tagMealPrep, tagHighProtein, tagLowCarb,
    tagComfortFood, tagBudgetFriendly
  ] = await Promise.all([
    prisma.tags.findUnique({ where: { name: "quick" } }),
    prisma.tags.findUnique({ where: { name: "vegetarian" } }),
    prisma.tags.findUnique({ where: { name: "vegan" } }),
    prisma.tags.findUnique({ where: { name: "gluten-free" } }),
    prisma.tags.findUnique({ where: { name: "meal-prep" } }),
    prisma.tags.findUnique({ where: { name: "high-protein" } }),
    prisma.tags.findUnique({ where: { name: "low-carb" } }),
    prisma.tags.findUnique({ where: { name: "comfort-food" } }),
    prisma.tags.findUnique({ where: { name: "budget-friendly" } }),
  ]);

  const [
    dietVegetarian, dietVegan, dietHighProtein,
    dietGlutenFree, dietLowCarb, dietPescatarian
  ] = await Promise.all([
    prisma.diet_preferences.findUnique({ where: { name: "Vegetarian" } }),
    prisma.diet_preferences.findUnique({ where: { name: "Vegan" } }),
    prisma.diet_preferences.findUnique({ where: { name: "High Protein" } }),
    prisma.diet_preferences.findUnique({ where: { name: "Gluten-Free" } }),
    prisma.diet_preferences.findUnique({ where: { name: "Low Carb" } }),
    prisma.diet_preferences.findUnique({ where: { name: "Pescatarian" } }),
  ]);

  // ── RECIPES ───────────────────────────────────
  console.log("Seeding recipes...");

  // 1. Southern Mac and Cheese
  await prisma.recipes.create({
    data: {
      category_id: dinnerCat.id,
      cuisine_id: american.id,
      meal_type_id: dinner.id,
      name: "Southern Mac and Cheese",
      description: "Classic Southern baked mac and cheese with a rich cheesy sauce and golden breadcrumb topping.",
      cook_time: 35,
      prep_time: 15,
      servings: 1,
      calories_per_serving: 580,
      difficulty: "medium",
      is_public: true,
      ingredients: {
        create: [
          { name: "Elbow macaroni", quantity: 100, unit: "g" },
          { name: "Sharp cheddar cheese", quantity: 100, unit: "g", notes: "freshly grated" },
          { name: "Gruyere cheese", quantity: 50, unit: "g", notes: "freshly grated" },
          { name: "Whole milk", quantity: 200, unit: "ml" },
          { name: "Heavy cream", quantity: 60, unit: "ml" },
          { name: "Butter", quantity: 1, unit: "tbsp" },
          { name: "All purpose flour", quantity: 1, unit: "tbsp" },
          { name: "Dijon mustard", quantity: 0.5, unit: "tsp" },
          { name: "Smoked paprika", quantity: 0.25, unit: "tsp" },
          { name: "Garlic powder", quantity: 0.25, unit: "tsp" },
          { name: "Salt", quantity: null, unit: null, notes: "to taste" },
          { name: "Black pepper", quantity: null, unit: null, notes: "to taste" },
          { name: "Breadcrumbs", quantity: 2, unit: "tbsp", notes: "optional topping" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Cook macaroni according to package instructions until al dente, drain and set aside." },
          { step_number: 2, instruction: "Melt butter in a saucepan over medium heat, whisk in flour and cook for 1 minute." },
          { step_number: 3, instruction: "Gradually whisk in milk and cream, stirring constantly until thickened about 3-4 minutes." },
          { step_number: 4, instruction: "Remove from heat and stir in cheddar, gruyere, mustard, paprika and garlic powder until smooth." },
          { step_number: 5, instruction: "Season with salt and pepper then fold in cooked macaroni." },
          { step_number: 6, instruction: "Transfer to a baking dish, top with breadcrumbs if using and bake at 375°F for 20 minutes until golden and bubbling." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagComfortFood.id },
          { tag_id: tagVegetarian.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietVegetarian.id },
        ]
      }
    }
  });

  // 2. Southern Collard Greens
  await prisma.recipes.create({
    data: {
      category_id: sideDishCat.id,
      cuisine_id: american.id,
      meal_type_id: dinner.id,
      name: "Southern Collard Greens",
      description: "Slow simmered Southern collard greens with smoked turkey and a touch of vinegar.",
      cook_time: 45,
      prep_time: 10,
      servings: 1,
      calories_per_serving: 180,
      difficulty: "easy",
      is_public: true,
      ingredients: {
        create: [
          { name: "Collard greens", quantity: 200, unit: "g", notes: "stems removed, roughly chopped" },
          { name: "Smoked turkey leg", quantity: 100, unit: "g", notes: "or smoked ham hock" },
          { name: "Chicken broth", quantity: 300, unit: "ml" },
          { name: "Onion", quantity: 0.5, unit: null, notes: "diced" },
          { name: "Garlic", quantity: 2, unit: "cloves", notes: "minced" },
          { name: "Apple cider vinegar", quantity: 1, unit: "tbsp" },
          { name: "Red pepper flakes", quantity: 0.5, unit: "tsp" },
          { name: "Sugar", quantity: 0.5, unit: "tsp" },
          { name: "Vegetable oil", quantity: 1, unit: "tbsp" },
          { name: "Salt", quantity: null, unit: null, notes: "to taste" },
          { name: "Black pepper", quantity: null, unit: null, notes: "to taste" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Heat oil in a large pot over medium heat, add onion and cook until softened about 5 minutes." },
          { step_number: 2, instruction: "Add garlic and red pepper flakes and cook for 1 minute." },
          { step_number: 3, instruction: "Add smoked turkey leg and chicken broth and bring to a simmer." },
          { step_number: 4, instruction: "Add collard greens in batches, stirring to wilt each batch before adding more." },
          { step_number: 5, instruction: "Add apple cider vinegar and sugar, season with salt and pepper." },
          { step_number: 6, instruction: "Cover and simmer on low heat for 40 minutes until greens are tender and flavorful." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagComfortFood.id },
          { tag_id: tagBudgetFriendly.id },
          { tag_id: tagGlutenFree.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietGlutenFree.id },
        ]
      }
    }
  });

  // 3. Buttermilk Biscuits
  await prisma.recipes.create({
    data: {
      category_id: breakfastCat.id,
      cuisine_id: american.id,
      meal_type_id: breakfast.id,
      name: "Buttermilk Biscuits",
      description: "Flaky and buttery Southern style buttermilk biscuits perfect for breakfast.",
      cook_time: 15,
      prep_time: 15,
      servings: 1,
      calories_per_serving: 320,
      difficulty: "easy",
      is_public: true,
      ingredients: {
        create: [
          { name: "All purpose flour", quantity: 1, unit: "cup", notes: "plus extra for dusting" },
          { name: "Baking powder", quantity: 1.5, unit: "tsp" },
          { name: "Baking soda", quantity: 0.25, unit: "tsp" },
          { name: "Salt", quantity: 0.5, unit: "tsp" },
          { name: "Cold butter", quantity: 4, unit: "tbsp", notes: "cubed" },
          { name: "Buttermilk", quantity: 0.4, unit: "cup", notes: "cold" },
          { name: "Honey", quantity: 1, unit: "tsp", notes: "optional, to serve" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Preheat oven to 425°F and line a baking sheet with parchment paper." },
          { step_number: 2, instruction: "Whisk together flour, baking powder, baking soda and salt in a bowl." },
          { step_number: 3, instruction: "Work cold butter into the flour mixture using your fingertips until it resembles coarse crumbs." },
          { step_number: 4, instruction: "Add cold buttermilk and stir just until the dough comes together — do not overmix." },
          { step_number: 5, instruction: "Turn dough onto a floured surface, gently pat to 1 inch thickness and cut out rounds." },
          { step_number: 6, instruction: "Place on baking sheet and bake for 12-15 minutes until golden brown. Serve warm with honey." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagComfortFood.id },
          { tag_id: tagVegetarian.id },
          { tag_id: tagBudgetFriendly.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietVegetarian.id },
        ]
      }
    }
  });

  // 4. Southern Shrimp and Grits
  await prisma.recipes.create({
    data: {
      category_id: dinnerCat.id,
      cuisine_id: american.id,
      meal_type_id: dinner.id,
      name: "Southern Shrimp and Grits",
      description: "A Southern classic — creamy cheesy grits topped with savory shrimp and crispy bacon.",
      cook_time: 25,
      prep_time: 10,
      servings: 1,
      calories_per_serving: 540,
      difficulty: "medium",
      is_public: true,
      ingredients: {
        create: [
          { name: "Large shrimp", quantity: 150, unit: "g", notes: "peeled and deveined" },
          { name: "Stone ground grits", quantity: 0.25, unit: "cup" },
          { name: "Chicken broth", quantity: 300, unit: "ml" },
          { name: "Sharp cheddar", quantity: 50, unit: "g", notes: "grated" },
          { name: "Butter", quantity: 1, unit: "tbsp" },
          { name: "Bacon", quantity: 2, unit: "strips", notes: "diced" },
          { name: "Garlic", quantity: 2, unit: "cloves", notes: "minced" },
          { name: "Green onions", quantity: 2, unit: null, notes: "sliced" },
          { name: "Lemon juice", quantity: 1, unit: "tsp" },
          { name: "Hot sauce", quantity: 0.5, unit: "tsp", notes: "to taste" },
          { name: "Salt", quantity: null, unit: null, notes: "to taste" },
          { name: "Black pepper", quantity: null, unit: null, notes: "to taste" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Bring chicken broth to a boil, slowly whisk in grits and reduce heat to low. Cook stirring occasionally for 20 minutes." },
          { step_number: 2, instruction: "Stir butter and cheddar into grits, season with salt and pepper and keep warm." },
          { step_number: 3, instruction: "Cook bacon in a skillet until crispy, remove and set aside leaving drippings in pan." },
          { step_number: 4, instruction: "Add garlic to the pan and cook for 30 seconds, then add shrimp and cook 2 minutes per side." },
          { step_number: 5, instruction: "Add lemon juice and hot sauce, toss to coat." },
          { step_number: 6, instruction: "Serve shrimp over cheesy grits topped with crispy bacon and green onions." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagComfortFood.id },
          { tag_id: tagHighProtein.id },
          { tag_id: tagGlutenFree.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietHighProtein.id },
          { diet_preference_id: dietGlutenFree.id },
          { diet_preference_id: dietPescatarian.id },
        ]
      }
    }
  });

  // 5. Grilled Chicken Salad
  await prisma.recipes.create({
    data: {
      category_id: lunchCat.id,
      cuisine_id: mediterranean.id,
      meal_type_id: lunch.id,
      name: "Grilled Chicken Salad",
      description: "Light and protein packed grilled chicken salad with a lemon vinaigrette.",
      cook_time: 15,
      prep_time: 10,
      servings: 1,
      calories_per_serving: 420,
      difficulty: "easy",
      is_public: true,
      ingredients: {
        create: [
          { name: "Chicken breast", quantity: 150, unit: "g" },
          { name: "Mixed salad greens", quantity: 2, unit: "cups" },
          { name: "Cherry tomatoes", quantity: 8, unit: null, notes: "halved" },
          { name: "Cucumber", quantity: 0.5, unit: null, notes: "sliced" },
          { name: "Red onion", quantity: 0.25, unit: null, notes: "thinly sliced" },
          { name: "Olive oil", quantity: 2, unit: "tbsp" },
          { name: "Lemon juice", quantity: 1, unit: "tbsp" },
          { name: "Dijon mustard", quantity: 1, unit: "tsp" },
          { name: "Salt", quantity: null, unit: null, notes: "to taste" },
          { name: "Black pepper", quantity: null, unit: null, notes: "to taste" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Season chicken breast with salt and pepper." },
          { step_number: 2, instruction: "Grill chicken over medium-high heat for 6-7 minutes per side until cooked through." },
          { step_number: 3, instruction: "Whisk together olive oil, lemon juice and dijon mustard for the dressing." },
          { step_number: 4, instruction: "Slice chicken and arrange over salad greens with tomatoes, cucumber and red onion." },
          { step_number: 5, instruction: "Drizzle with dressing and serve immediately." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagHighProtein.id },
          { tag_id: tagLowCarb.id },
          { tag_id: tagGlutenFree.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietHighProtein.id },
          { diet_preference_id: dietGlutenFree.id },
          { diet_preference_id: dietLowCarb.id },
        ]
      }
    }
  });

  // 6. Spaghetti Bolognese
  await prisma.recipes.create({
    data: {
      category_id: dinnerCat.id,
      cuisine_id: italian.id,
      meal_type_id: dinner.id,
      name: "Spaghetti Bolognese",
      description: "A classic Italian meat sauce served over spaghetti.",
      cook_time: 45,
      prep_time: 15,
      servings: 1,
      calories_per_serving: 620,
      difficulty: "medium",
      is_public: true,
      ingredients: {
        create: [
          { name: "Spaghetti", quantity: 100, unit: "g" },
          { name: "Ground beef", quantity: 150, unit: "g" },
          { name: "Crushed tomatoes", quantity: 200, unit: "g" },
          { name: "Onion", quantity: 0.5, unit: null, notes: "finely diced" },
          { name: "Garlic", quantity: 2, unit: "cloves", notes: "minced" },
          { name: "Carrot", quantity: 0.5, unit: null, notes: "finely diced" },
          { name: "Celery", quantity: 1, unit: "stalk", notes: "finely diced" },
          { name: "Olive oil", quantity: 1, unit: "tbsp" },
          { name: "Tomato paste", quantity: 1, unit: "tbsp" },
          { name: "Red wine", quantity: 60, unit: "ml", notes: "optional" },
          { name: "Parmesan", quantity: 2, unit: "tbsp", notes: "grated, to serve" },
          { name: "Salt", quantity: null, unit: null, notes: "to taste" },
          { name: "Black pepper", quantity: null, unit: null, notes: "to taste" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Heat olive oil in a pan over medium heat. Add onion, carrot and celery and cook for 5 minutes until softened." },
          { step_number: 2, instruction: "Add garlic and cook for 1 minute, then add ground beef and brown well." },
          { step_number: 3, instruction: "Add tomato paste and stir for 1 minute, then pour in red wine if using and let it reduce." },
          { step_number: 4, instruction: "Add crushed tomatoes, season with salt and pepper and simmer on low heat for 30 minutes." },
          { step_number: 5, instruction: "Cook spaghetti according to package instructions, drain and serve topped with bolognese sauce and parmesan." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagComfortFood.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietHighProtein.id },
        ]
      }
    }
  });

  // 7. Veggie Stir Fry
  await prisma.recipes.create({
    data: {
      category_id: dinnerCat.id,
      cuisine_id: japanese.id,
      meal_type_id: dinner.id,
      name: "Veggie Stir Fry",
      description: "Quick and colourful vegetable stir fry with a savoury sauce over rice.",
      cook_time: 15,
      prep_time: 10,
      servings: 1,
      calories_per_serving: 340,
      difficulty: "easy",
      is_public: true,
      ingredients: {
        create: [
          { name: "Jasmine rice", quantity: 0.5, unit: "cup" },
          { name: "Broccoli florets", quantity: 1, unit: "cup" },
          { name: "Bell pepper", quantity: 0.5, unit: null, notes: "sliced" },
          { name: "Snap peas", quantity: 0.5, unit: "cup" },
          { name: "Carrot", quantity: 0.5, unit: null, notes: "julienned" },
          { name: "Garlic", quantity: 2, unit: "cloves", notes: "minced" },
          { name: "Ginger", quantity: 1, unit: "tsp", notes: "freshly grated" },
          { name: "Soy sauce", quantity: 2, unit: "tbsp" },
          { name: "Sesame oil", quantity: 1, unit: "tsp" },
          { name: "Vegetable oil", quantity: 1, unit: "tbsp" },
          { name: "Sesame seeds", quantity: 1, unit: "tsp", notes: "to garnish" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Cook rice according to package instructions." },
          { step_number: 2, instruction: "Heat vegetable oil in a wok or large pan over high heat." },
          { step_number: 3, instruction: "Add garlic and ginger and stir fry for 30 seconds." },
          { step_number: 4, instruction: "Add vegetables and stir fry for 5-6 minutes until tender-crisp." },
          { step_number: 5, instruction: "Add soy sauce and sesame oil, toss to coat and serve over rice garnished with sesame seeds." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagQuick.id },
          { tag_id: tagVegan.id },
          { tag_id: tagVegetarian.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietVegan.id },
          { diet_preference_id: dietVegetarian.id },
        ]
      }
    }
  });

  // 8. Chicken Tikka Masala
  await prisma.recipes.create({
    data: {
      category_id: dinnerCat.id,
      cuisine_id: indian.id,
      meal_type_id: dinner.id,
      name: "Chicken Tikka Masala",
      description: "Rich and creamy Indian curry with tender marinated chicken.",
      cook_time: 40,
      prep_time: 20,
      servings: 1,
      calories_per_serving: 580,
      difficulty: "medium",
      is_public: true,
      ingredients: {
        create: [
          { name: "Chicken breast", quantity: 200, unit: "g", notes: "cut into chunks" },
          { name: "Plain yogurt", quantity: 3, unit: "tbsp" },
          { name: "Tikka masala paste", quantity: 2, unit: "tbsp" },
          { name: "Crushed tomatoes", quantity: 150, unit: "g" },
          { name: "Heavy cream", quantity: 3, unit: "tbsp" },
          { name: "Onion", quantity: 0.5, unit: null, notes: "diced" },
          { name: "Garlic", quantity: 2, unit: "cloves", notes: "minced" },
          { name: "Ginger", quantity: 1, unit: "tsp", notes: "grated" },
          { name: "Vegetable oil", quantity: 1, unit: "tbsp" },
          { name: "Fresh coriander", quantity: null, unit: null, notes: "to garnish" },
          { name: "Basmati rice", quantity: 0.5, unit: "cup", notes: "to serve" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Marinate chicken in yogurt and half the tikka paste for at least 30 minutes." },
          { step_number: 2, instruction: "Grill or pan fry the marinated chicken until slightly charred, set aside." },
          { step_number: 3, instruction: "Heat oil in a pan, cook onion until golden then add garlic, ginger and remaining paste." },
          { step_number: 4, instruction: "Add crushed tomatoes and simmer for 10 minutes, then stir in cream." },
          { step_number: 5, instruction: "Add grilled chicken to the sauce and simmer for 10 more minutes." },
          { step_number: 6, instruction: "Serve over basmati rice garnished with fresh coriander." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagHighProtein.id },
          { tag_id: tagComfortFood.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietHighProtein.id },
        ]
      }
    }
  });

  // 9. Black Bean Tacos
  await prisma.recipes.create({
    data: {
      category_id: lunchCat.id,
      cuisine_id: mexican.id,
      meal_type_id: lunch.id,
      name: "Black Bean Tacos",
      description: "Quick and satisfying vegetarian tacos with spiced black beans.",
      cook_time: 10,
      prep_time: 10,
      servings: 1,
      calories_per_serving: 450,
      difficulty: "easy",
      is_public: true,
      ingredients: {
        create: [
          { name: "Corn tortillas", quantity: 3, unit: null },
          { name: "Black beans", quantity: 200, unit: "g", notes: "drained and rinsed" },
          { name: "Cumin", quantity: 1, unit: "tsp" },
          { name: "Smoked paprika", quantity: 0.5, unit: "tsp" },
          { name: "Garlic powder", quantity: 0.5, unit: "tsp" },
          { name: "Avocado", quantity: 0.5, unit: null, notes: "sliced" },
          { name: "Cherry tomatoes", quantity: 6, unit: null, notes: "halved" },
          { name: "Red cabbage", quantity: 0.25, unit: "cup", notes: "shredded" },
          { name: "Lime", quantity: 0.5, unit: null, notes: "juiced" },
          { name: "Fresh coriander", quantity: null, unit: null, notes: "to garnish" },
        ]
      },
      preparation_steps: {
        create: [
          { step_number: 1, instruction: "Heat beans in a pan with cumin, smoked paprika, garlic powder and a splash of water for 5 minutes." },
          { step_number: 2, instruction: "Warm tortillas in a dry pan or directly over a gas flame." },
          { step_number: 3, instruction: "Fill tortillas with spiced beans, avocado, tomatoes and red cabbage." },
          { step_number: 4, instruction: "Squeeze lime juice over and garnish with fresh coriander." },
        ]
      },
      recipe_tags: {
        create: [
          { tag_id: tagQuick.id },
          { tag_id: tagVegan.id },
          { tag_id: tagVegetarian.id },
        ]
      },
      recipe_diet_preferences: {
        create: [
          { diet_preference_id: dietVegan.id },
          { diet_preference_id: dietVegetarian.id },
          { diet_preference_id: dietGlutenFree.id },
        ]
      }
    }
  });

  console.log("✅ All done!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
