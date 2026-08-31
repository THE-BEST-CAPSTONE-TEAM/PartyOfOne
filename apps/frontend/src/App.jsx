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
import BottomNav from "./components/BottomNav.jsx";
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

  const [weekOffset, setWeekOffset] = useState(0);

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
          <ThisWeekScreen
            onOpenRecipe={handleOpenRecipe}
            userId={userId}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
          />
        );
      case "recipes":
        return (
          <RecipesScreen onOpenRecipe={handleOpenRecipe} userId={userId} />
        );
      case "grocery":
        return <GroceryListScreen userId={userId} weekOffset={weekOffset} />;
      case "saved":
        return <SavedScreen onOpenRecipe={handleOpenRecipe} userId={userId} />;
      case "settings":
        return (
          <SettingsScreen
            session={session}
            onLogout={handleLogout}
            userId={userId}
            weekOffset={weekOffset}
          />
        );
      default:
        return (
          <ThisWeekScreen onOpenRecipe={handleOpenRecipe} userId={userId} />
        );
    }
  }

  return (
    // ── Outer shell ──────────────────────────────────────────────
    // Mobile: full screen, no padding, no rounded corners
    // Desktop: centered card with padding, rounded corners, shadow
    <div
      className="min-h-screen w-full md:flex md:items-center md:justify-center md:py-6"
      style={{ background: "#EDE4D3" }}
    >
      <style>{FONT_IMPORT}</style>
      <div
        className={[
          // Mobile: full screen stack
          "relative flex flex-col w-full min-h-screen",
          // Desktop: fixed card
          "md:flex-row md:rounded-2xl md:overflow-hidden md:shadow-2xl md:min-h-0",
        ].join(" ")}
        style={{
          background: C.bg,
          // Desktop fixed dimensions
          ...(typeof window !== "undefined" && window.innerWidth >= 768
            ? { width: 1180, height: 720, minHeight: "unset" }
            : {}),
        }}
      >
        {/* Sidebar — hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <Sidebar
            active={active}
            onNavigate={setActive}
            onLogout={handleLogout}
          />
        </div>

        {/* Main content — takes remaining space */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Add bottom padding on mobile so content isn't hidden behind bottom nav */}
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {renderScreen()}
          </div>
        </div>

        {/* Recipe modal */}
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

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <BottomNav active={active} onNavigate={setActive} />
      </div>
    </div>
  );
}
