import React from "react";
import {
  Calendar,
  BookOpen,
  ShoppingBasket,
  Heart,
  Settings,
  ChefHat,
  LogOut,
} from "lucide-react";
import { C, serif, sans } from "../theme/tokens";

const NAV_ITEMS = [
  { key: "week", label: "This Week", icon: Calendar },
  { key: "recipes", label: "Recipes", icon: BookOpen },
  { key: "grocery", label: "Grocery List", icon: ShoppingBasket },
  { key: "saved", label: "Saved", icon: Heart },
];

export default function Sidebar({ active, onNavigate, onLogout }) {
  return (
    <div
      className="flex flex-col gap-1 py-6 px-4 flex-shrink-0"
      style={{
        width: 210,
        background: C.sidebarBg,
        borderRight: `1px solid ${C.line}`,
      }}
    >
      <div className="flex items-center gap-2 px-2 mb-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: C.primary }}
        >
          <ChefHat size={16} color={C.onPrimary} />
        </div>
        {/* <span className="text-base font-semibold" style={{ ...serif, fontWeight: 600, color: C.charcoal }}>
          Table
        </span> */}
      </div>
      <p
        className="px-2 text-[11px] leading-snug mb-6"
        style={{ ...sans, color: C.muted }}
      >
        Stop negotiating with your fridge.
      </p>

      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onNavigate(key)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
          style={{
            ...sans,
            fontWeight: active === key ? 600 : 500,
            background: active === key ? C.sand : "transparent",
            color: active === key ? C.charcoal : C.muted,
          }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}

      <div className="flex-1" />
      <button
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
        style={{ ...sans, color: C.muted }}
      >
        <Settings size={16} />
        Settings
      </button>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
        style={{ ...sans, color: C.muted }}
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
}
