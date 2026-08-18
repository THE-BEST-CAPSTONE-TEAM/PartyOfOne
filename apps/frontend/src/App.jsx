import { useEffect, useState } from "react";
import { getOrCreateProfile } from "./api/items";
import {
  Sidebar,
  ThisWeekScreen,
  RecipeDetailModal,
} from "./components/HomeScreen.jsx";
import RecipesScreen from "./components/RecipesScreen.jsx";
import GroceryListScreen from "./components/GroceryListScreen.jsx";
import SavedScreen from "./components/SavedScreen.jsx";
import SettingsScreen from "./components/SettingsScreen.jsx";
import LoginPage from "./components/LoginPage";
import { supabase } from "./lib/supabase";
import { C } from "./theme/tokens";
import "tailwindcss";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
`;

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [active, setActive] = useState("week");
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Extract userId once so it can be passed to every screen
  const userId = session?.user?.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        getOrCreateProfile(session.user.id, session.user.email).catch(
          console.error,
        );
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        getOrCreateProfile(session.user.id, session.user.email).catch(
          console.error,
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActive("week");
    setRecipeOpen(false);
    setSelectedRecipe(null);
  };

  const handleOpenRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setRecipeOpen(true);
  };

  if (authLoading) return null;
  if (!session) return <LoginPage />;

  function renderScreen() {
    switch (active) {
      case "week":
        return (
          <ThisWeekScreen onOpenRecipe={handleOpenRecipe} userId={userId} />
        );
      case "recipes":
        return (
          <RecipesScreen onOpenRecipe={handleOpenRecipe} userId={userId} />
        );
      case "grocery":
        return <GroceryListScreen userId={userId} />;
      case "saved":
        return <SavedScreen onOpenRecipe={handleOpenRecipe} userId={userId} />;
      case "settings":
        return <SettingsScreen session={session} onLogout={handleLogout} />;
      default:
        return (
          <ThisWeekScreen onOpenRecipe={handleOpenRecipe} userId={userId} />
        );
    }
  }

  return (
    <div
      className="w-full flex justify-center py-6"
      style={{ background: "#EDE4D3" }}
    >
      <style>{FONT_IMPORT}</style>
      <div
        className="relative flex rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: 1180, height: 720, background: C.bg }}
      >
        <Sidebar
          active={active}
          onNavigate={setActive}
          onLogout={handleLogout}
        />
        {renderScreen()}
        {recipeOpen && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            userId={userId}
            onClose={() => {
              setRecipeOpen(false);
              setSelectedRecipe(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
