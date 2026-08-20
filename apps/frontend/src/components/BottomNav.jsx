import React from "react";
import {
  Calendar,
  BookOpen,
  ShoppingBasket,
  Heart,
  Settings,
} from "lucide-react";
import { C } from "../theme/tokens";

const sans = { fontFamily: "Inter, sans-serif" };

const items = [
  { key: "week", label: "This Week", icon: Calendar },
  { key: "recipes", label: "Recipes", icon: BookOpen },
  { key: "grocery", label: "Grocery", icon: ShoppingBasket },
  { key: "saved", label: "Saved", icon: Heart },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pt-2 pb-safe"
      style={{
        background: C.sidebarBg,
        borderTop: `1px solid ${C.line}`,
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {items.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors flex-1"
            style={{
              background: isActive ? C.sand : "transparent",
            }}
          >
            <Icon
              size={20}
              color={isActive ? C.primary : C.muted}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              className="text-[10px] font-semibold"
              style={{
                ...sans,
                color: isActive ? C.primary : C.muted,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
