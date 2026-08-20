import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  ChevronRight,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { fetchMealPlan } from "../api/items";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const C = {
  bg: "#f7f8ef",
  card: "#FFFFFF",
  sand: "#F0E6D8",
  line: "#E9DCC5",
  charcoal: "#2B2B2B",
  muted: "#8A7F6D",
  faint: "#B9AD98",
  primary: "#ff3131",
  onPrimary: "#2B2B2B",
  green: "#154202",
};

const serif = { fontFamily: "Fraunces, serif" };
const sans = { fontFamily: "Inter, sans-serif" };

const MACRO_COLORS = {
  protein: "#154202",
  carbs: "#f59e0b",
  fat: "#8b5cf6",
  sugar: "#ec4899",
};

const CUISINE_COLORS = [
  "#ff3131",
  "#154202",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

// ── Goal targets ──────────────────────────────
const GOAL_TARGETS = {
  "Weight Loss": { calories: 1500, protein: 100, carbs: 150, fat: 50 },
  "Weight Gain": { calories: 2800, protein: 160, carbs: 350, fat: 90 },
  "Muscle Building": { calories: 2500, protein: 180, carbs: 280, fat: 70 },
  Maintenance: { calories: 2000, protein: 120, carbs: 250, fat: 65 },
  "Meal Prep": { calories: 2000, protein: 120, carbs: 250, fat: 65 },
  "Family Meals": { calories: 2200, protein: 130, carbs: 270, fat: 70 },
};

// ── Chart components ──────────────────────────

function DonutChart({ data, title, subtitle }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.datasets[0].data.some((v) => v > 0)) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}g`,
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [JSON.stringify(data)]);

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 140, height: 140, position: "relative" }}>
        <canvas ref={canvasRef} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            className="text-lg font-bold"
            style={{ ...sans, color: C.charcoal }}
          >
            {title}
          </p>
          <p className="text-[10px]" style={{ ...sans, color: C.faint }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, title }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} cal`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "Inter", size: 11 }, color: C.muted },
          },
          y: {
            grid: { color: C.line },
            ticks: { font: { family: "Inter", size: 11 }, color: C.muted },
            beginAtZero: true,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [JSON.stringify(data)]);

  return (
    <div>
      <p
        className="text-xs font-semibold mb-3"
        style={{ ...sans, color: C.muted }}
      >
        {title}
      </p>
      <div style={{ height: 160 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function GoalProgressBar({ label, current, target, color, unit = "g" }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const over = current > target;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-semibold"
          style={{ ...sans, color: C.charcoal }}
        >
          {label}
        </span>
        <span
          className="text-xs"
          style={{ ...sans, color: over ? C.primary : C.muted }}
        >
          {Math.round(current)}
          {unit} / {target}
          {unit}
          {over && " ⚠️"}
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 8, background: C.line }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: over ? C.primary : color,
          }}
        />
      </div>
      <p
        className="text-[10px] mt-0.5 text-right"
        style={{ ...sans, color: C.faint }}
      >
        {pct}% of daily goal
      </p>
    </div>
  );
}

function LegendDot({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="text-xs" style={{ ...sans, color: C.muted }}>
        {label}
      </span>
      {value !== undefined && (
        <span
          className="text-xs font-semibold ml-auto"
          style={{ ...sans, color: C.charcoal }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

// ── Stats card ────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <p
        className="text-2xl font-bold mb-1"
        style={{ ...sans, color: color || C.charcoal }}
      >
        {value}
      </p>
      <p
        className="text-xs font-semibold"
        style={{ ...sans, color: C.charcoal }}
      >
        {label}
      </p>
      {sub && (
        <p className="text-[10px] mt-0.5" style={{ ...sans, color: C.faint }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Main settings screen ──────────────────────

export default function SettingsScreen({ session, onLogout, userId }) {
  const [tab, setTab] = useState("insights");
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user;
  const email = user?.email || "—";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const initials = email.slice(0, 2).toUpperCase();

  //   useEffect(() => {
  //     if (!userId) return;
  //     fetchMealPlan(userId)
  //       .then(setMealPlan)
  //       .catch(console.error)
  //       .finally(() => setLoading(false));
  //   }, [userId]);

  useEffect(() => {
    if (!userId) {
      console.log("No userId yet");
      return;
    }
    console.log("Fetching meal plan for userId:", userId);
    fetchMealPlan(userId)
      .then((data) => {
        console.log("Meal plan data:", data);
        setMealPlan(data);
      })
      .catch((err) => console.error("Meal plan error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Derive data from meal plan ──
  const entries = mealPlan?.meal_plan_entries || [];
  const recipes = entries.map((e) => e.recipes).filter(Boolean);

  // Macros totals across the week
  const weeklyMacros = { protein: 0, carbs: 0, fat: 0, sugar: 0, calories: 0 };
  const caloriesByDay = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };
  const cuisineCounts = {};
  const mealTypeCounts = {};

  for (const entry of entries) {
    const recipe = entry.recipes;
    if (!recipe) continue;

    // Calories per day
    const cal = recipe.calories_per_serving || 0;
    if (caloriesByDay[entry.day_of_week] !== undefined) {
      caloriesByDay[entry.day_of_week] += cal;
    }

    // Cuisine counts
    const cuisine = recipe.cuisines?.name || "Other";
    cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;

    // Meal type counts
    const mt = entry.meal_time || "other";
    mealTypeCounts[mt] = (mealTypeCounts[mt] || 0) + 1;

    // Macros from ingredients
    for (const ing of recipe.ingredients || []) {
      weeklyMacros.protein += parseFloat(ing.protein) || 0;
      weeklyMacros.carbs += parseFloat(ing.carbs) || 0;
      weeklyMacros.fat += parseFloat(ing.fat) || 0;
      weeklyMacros.sugar += parseFloat(ing.sugar) || 0;
    }
    weeklyMacros.calories += cal;
  }

  // Daily averages
  const daysWithMeals =
    Object.values(caloriesByDay).filter((v) => v > 0).length || 1;
  const avgCalories = Math.round(weeklyMacros.calories / daysWithMeals);
  const avgProtein = Math.round(weeklyMacros.protein / 7);
  const avgCarbs = Math.round(weeklyMacros.carbs / 7);
  const avgFat = Math.round(weeklyMacros.fat / 7);

  // Total meals planned
  const totalMeals = entries.length;
  const totalRecipes = new Set(recipes.map((r) => r.id)).size;

  // ── Chart data ──
  const macroDonutData = {
    labels: ["Protein", "Carbs", "Fat", "Sugar"],
    datasets: [
      {
        data: [
          Math.round(weeklyMacros.protein),
          Math.round(weeklyMacros.carbs),
          Math.round(weeklyMacros.fat),
          Math.round(weeklyMacros.sugar),
        ],
        backgroundColor: [
          MACRO_COLORS.protein,
          MACRO_COLORS.carbs,
          MACRO_COLORS.fat,
          MACRO_COLORS.sugar,
        ],
        borderWidth: 0,
      },
    ],
  };

  const totalMacrosG =
    weeklyMacros.protein +
    weeklyMacros.carbs +
    weeklyMacros.fat +
    weeklyMacros.sugar;

  const caloriesBarData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: Object.values(caloriesByDay),
        backgroundColor: Object.values(caloriesByDay).map((v) =>
          v > 2000 ? C.primary : v > 0 ? C.green : C.line,
        ),
        borderRadius: 6,
      },
    ],
  };

  const cuisineLabels = Object.keys(cuisineCounts);
  const cuisineDonutData = {
    labels: cuisineLabels,
    datasets: [
      {
        data: Object.values(cuisineCounts),
        backgroundColor: CUISINE_COLORS.slice(0, cuisineLabels.length),
        borderWidth: 0,
      },
    ],
  };

  const TABS = ["insights", "account", "preferences"];

  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-7"
      style={{ background: C.bg }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1
          className="text-2xl mb-6"
          style={{ ...serif, fontWeight: 600, color: C.charcoal }}
        >
          Settings
        </h1>

        {/* Tab bar */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ background: C.sand }}
        >
          {[
            { key: "insights", label: "📊 Insights" },
            { key: "account", label: "👤 Account" },
            { key: "preferences", label: "⚙️ Preferences" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                ...sans,
                background: tab === key ? C.card : "transparent",
                color: tab === key ? C.charcoal : C.muted,
                boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── INSIGHTS TAB ── */}
        {tab === "insights" && (
          <div className="flex flex-col gap-5">
            {loading ? (
              <div
                className="rounded-2xl p-8 flex items-center justify-center"
                style={{ background: C.card, border: `1px solid ${C.line}` }}
              >
                <p style={{ ...sans, color: C.muted }}>Loading your data...</p>
              </div>
            ) : totalMeals === 0 ? (
              <div
                className="rounded-2xl p-8 flex flex-col items-center text-center"
                style={{ background: C.card, border: `1px solid ${C.line}` }}
              >
                <TrendingUp size={32} color={C.faint} className="mb-3" />
                <p
                  className="text-lg mb-1"
                  style={{ ...serif, fontWeight: 600, color: C.charcoal }}
                >
                  No data yet
                </p>
                <p className="text-sm" style={{ ...sans, color: C.muted }}>
                  Add meals to your weekly plan to start seeing insights about
                  your eating habits.
                </p>
              </div>
            ) : (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-4 gap-3">
                  <StatCard
                    label="Meals planned"
                    value={totalMeals}
                    sub="this week"
                    color={C.primary}
                  />
                  <StatCard
                    label="Avg calories"
                    value={avgCalories}
                    sub="per day"
                    color={C.green}
                  />
                  <StatCard
                    label="Avg protein"
                    value={`${avgProtein}g`}
                    sub="per day"
                    color={MACRO_COLORS.protein}
                  />
                  <StatCard
                    label="Unique recipes"
                    value={totalRecipes}
                    sub="this week"
                    color="#8b5cf6"
                  />
                </div>

                {/* Calories per day */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: C.card, border: `1px solid ${C.line}` }}
                >
                  <BarChart
                    data={caloriesBarData}
                    title="Calories by day this week"
                  />
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: C.green }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ ...sans, color: C.muted }}
                      >
                        On track
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: C.primary }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ ...sans, color: C.muted }}
                      >
                        Over 2000 cal
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: C.line }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ ...sans, color: C.muted }}
                      >
                        No meals planned
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macros + Cuisine side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Macro breakdown */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-4"
                      style={{ ...sans, color: C.muted }}
                    >
                      Weekly macro breakdown
                    </p>
                    <div className="flex items-center gap-4">
                      <DonutChart
                        data={macroDonutData}
                        title={`${Math.round(totalMacrosG)}g`}
                        subtitle="total"
                      />
                      <div className="flex flex-col gap-2 flex-1">
                        {[
                          {
                            label: "Protein",
                            value: `${Math.round(weeklyMacros.protein)}g`,
                            color: MACRO_COLORS.protein,
                          },
                          {
                            label: "Carbs",
                            value: `${Math.round(weeklyMacros.carbs)}g`,
                            color: MACRO_COLORS.carbs,
                          },
                          {
                            label: "Fat",
                            value: `${Math.round(weeklyMacros.fat)}g`,
                            color: MACRO_COLORS.fat,
                          },
                          {
                            label: "Sugar",
                            value: `${Math.round(weeklyMacros.sugar)}g`,
                            color: MACRO_COLORS.sugar,
                          },
                        ].map(({ label, value, color }) => (
                          <LegendDot
                            key={label}
                            color={color}
                            label={label}
                            value={value}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cuisine variety */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-4"
                      style={{ ...sans, color: C.muted }}
                    >
                      Cuisine variety
                    </p>
                    {cuisineLabels.length === 0 ? (
                      <p
                        className="text-xs"
                        style={{ ...sans, color: C.faint }}
                      >
                        No data yet
                      </p>
                    ) : (
                      <div className="flex items-center gap-4">
                        <DonutChart
                          data={cuisineDonutData}
                          title={cuisineLabels.length.toString()}
                          subtitle="cuisines"
                        />
                        <div className="flex flex-col gap-2 flex-1">
                          {cuisineLabels.slice(0, 5).map((label, i) => (
                            <LegendDot
                              key={label}
                              color={CUISINE_COLORS[i]}
                              label={label}
                              value={cuisineCounts[label]}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meal type breakdown */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: C.card, border: `1px solid ${C.line}` }}
                >
                  <p
                    className="text-xs font-semibold mb-4"
                    style={{ ...sans, color: C.muted }}
                  >
                    Meal type distribution
                  </p>
                  <div className="flex gap-3">
                    {[
                      { key: "breakfast", emoji: "🍳", color: "#f59e0b" },
                      { key: "lunch", emoji: "🥪", color: C.green },
                      { key: "dinner", emoji: "🍝", color: C.primary },
                      { key: "snack", emoji: "🍎", color: "#06b6d4" },
                      { key: "dessert", emoji: "🍰", color: "#ec4899" },
                      { key: "drinks", emoji: "☕", color: "#8b5cf6" },
                    ].map(({ key, emoji, color }) => {
                      const count = mealTypeCounts[key] || 0;
                      const pct =
                        totalMeals > 0
                          ? Math.round((count / totalMeals) * 100)
                          : 0;
                      return (
                        <div
                          key={key}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-full rounded-xl flex items-end justify-center pb-1"
                            style={{
                              height: 80,
                              background: C.bg,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="w-full rounded-lg transition-all duration-700"
                              style={{
                                height: `${Math.max(pct, count > 0 ? 10 : 0)}%`,
                                background: color,
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                              }}
                            />
                            {count > 0 && (
                              <span
                                className="text-xs font-bold relative z-10"
                                style={{
                                  ...sans,
                                  color: count > 0 ? "#fff" : C.faint,
                                }}
                              >
                                {count}
                              </span>
                            )}
                          </div>
                          <span className="text-base">{emoji}</span>
                          <span
                            className="text-[9px] font-semibold capitalize"
                            style={{ ...sans, color: C.muted }}
                          >
                            {key}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Goal progress */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: C.card, border: `1px solid ${C.line}` }}
                >
                  <p
                    className="text-xs font-semibold mb-4"
                    style={{ ...sans, color: C.muted }}
                  >
                    Daily goal progress — based on Maintenance targets
                  </p>
                  <GoalProgressBar
                    label="Calories"
                    current={avgCalories}
                    target={2000}
                    color={C.primary}
                    unit=" cal"
                  />
                  <GoalProgressBar
                    label="Protein"
                    current={avgProtein}
                    target={120}
                    color={MACRO_COLORS.protein}
                  />
                  <GoalProgressBar
                    label="Carbohydrates"
                    current={avgCarbs}
                    target={250}
                    color={MACRO_COLORS.carbs}
                  />
                  <GoalProgressBar
                    label="Fat"
                    current={avgFat}
                    target={65}
                    color={MACRO_COLORS.fat}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {tab === "account" && (
          <div className="flex flex-col gap-4">
            {/* Avatar */}
            <div
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: C.card, border: `1px solid ${C.line}` }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: C.primary }}
              >
                <span
                  className="text-lg font-semibold"
                  style={{ ...sans, color: C.onPrimary }}
                >
                  {initials}
                </span>
              </div>
              <div>
                <p
                  className="text-base font-semibold"
                  style={{ ...serif, color: C.charcoal }}
                >
                  {email}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ ...sans, color: C.muted }}
                >
                  Member since {createdAt}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.line}` }}
            >
              {[
                { label: "Email", value: email },
                {
                  label: "User ID",
                  value: user?.id ? `${user.id.slice(0, 8)}...` : "—",
                },
                { label: "Member since", value: createdAt },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3 px-4"
                  style={{
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${C.line}` : "none",
                  }}
                >
                  <span className="text-sm" style={{ ...sans, color: C.muted }}>
                    {label}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ ...sans, color: C.charcoal }}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between py-3 px-4"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                <span className="text-sm" style={{ ...sans, color: C.muted }}>
                  Email verified
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    ...sans,
                    background: user?.email_confirmed_at ? "#E8F5E0" : C.sand,
                    color: user?.email_confirmed_at ? C.green : C.muted,
                  }}
                >
                  {user?.email_confirmed_at ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            {/* Sign out */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.line}` }}
            >
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full py-3 px-4 text-left"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FFF0F0" }}
                >
                  <LogOut size={15} color={C.primary} />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ ...sans, color: C.primary }}
                >
                  Sign out
                </p>
              </button>
            </div>

            <p
              className="text-center text-xs"
              style={{ ...sans, color: C.faint }}
            >
              Party of One · v0.1.0
            </p>
          </div>
        )}

        {/* ── PREFERENCES TAB ── */}
        {tab === "preferences" && (
          <div className="flex flex-col gap-4">
            {[
              {
                icon: User,
                label: "Diet preferences",
                sublabel: "Coming soon — set dietary restrictions and goals",
              },
              {
                icon: Bell,
                label: "Notifications",
                sublabel: "Coming soon — meal planning reminders",
              },
              {
                icon: Palette,
                label: "Appearance",
                sublabel: "Coming soon — theme and display options",
              },
              { icon: Lock, label: "Change password", sublabel: "Coming soon" },
              {
                icon: HelpCircle,
                label: "Help & support",
                sublabel: "Coming soon",
              },
            ].map(({ icon: Icon, label, sublabel }) => (
              <div
                key={label}
                className="flex items-center gap-3 w-full py-3 px-4 rounded-2xl"
                style={{ background: C.card, border: `1px solid ${C.line}` }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.sand }}
                >
                  <Icon size={15} color={C.muted} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ ...sans, color: C.charcoal }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ ...sans, color: C.faint }}
                  >
                    {sublabel}
                  </p>
                </div>
                <ChevronRight size={15} color={C.faint} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
