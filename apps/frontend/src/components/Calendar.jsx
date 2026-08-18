import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin to draw text in the center of the doughnut chart
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    const {
      ctx,
      chartArea: { top, left, width, height },
    } = chart;
    ctx.save();
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Meal Planner", left + width / 2, top + height / 2);
    ctx.restore();
  },
};

export default function Calendar() {
  const [mealData, setMealData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from your API
    const fetchMeals = async () => {
      try {
        // Replace with your actual API endpoint: fetch('/api/meals')
        const response = await mockApiCall();
        setMealData(response);
      } catch (error) {
        console.error("Error fetching meal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) return <div>Loading your meal plan...</div>;
  if (!mealData) return <div>No meal data available.</div>;

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Weekly Meals",
        data: [1, 1, 1, 1, 1, 1, 1], // 7 equal slices
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
        ],
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dayIndex = context.dataIndex;
            const dayMeals = mealData[dayIndex];

            if (dayMeals) {
              return [
                `B: ${dayMeals.breakfast}`,
                `L: ${dayMeals.lunch}`,
                `D: ${dayMeals.dinner}`,
              ];
            }
            return "No meals planned";
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        position: "relative",
        width: "400px",
        height: "400px",
        margin: "0 auto",
      }}
    >
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

// Mock API function mimicking the JSON structure you should return from your backend
function mockApiCall() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { breakfast: "Oatmeal", lunch: "Salad", dinner: "Salmon" }, // Mon (Index 0)
        { breakfast: "Smoothie", lunch: "Wrap", dinner: "Stir Fry" }, // Tue
        { breakfast: "Eggs", lunch: "Soup", dinner: "Tacos" }, // Wed
        { breakfast: "Oatmeal", lunch: "Salad", dinner: "Pasta" }, // Thu
        { breakfast: "Pancakes", lunch: "Leftovers", dinner: "Pizza" }, // Fri
        { breakfast: "Waffles", lunch: "Burger", dinner: "BBQ" }, // Sat
        { breakfast: "Eggs", lunch: "Sandwich", dinner: "Roast" }, // Sun
      ]);
    }, 1000);
  });
}
