import { useEffect, useState } from "react";
import { createItem, fetchCategories, fetchItems } from "./api/items.js";
import ItemList from "./components/ItemList.jsx";

import { C } from "./theme/tokens";
import Sidebar from "./components/Sidebar";
import ThisWeekScreen from "./components/ThisWeekScreen";
import RecipeDetailModal from "./components/RecipeDetailModal";
import LoginPage from "./components/LoginPage";

export default function App() {
  // Placeholder auth state. Replace with your real auth check (e.g. a token
  // in localStorage, a session cookie check, or a call to your backend) once
  // that exists — for now this just tracks whether LoginPage has been submitted.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [active, setActive] = useState("week");
  const [recipeOpen, setRecipeOpen] = useState(false);

  const handleLogin = ({ username, password }) => {
    // TODO: replace with a real call to your backend, e.g.:
    // const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) })
    // For now, any non-empty username/password "logs in".
    if (username.trim() && password.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActive("week");
    setRecipeOpen(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onSubmit={handleLogin} />;
  }

  return (
    <div className="flex w-full h-screen" style={{ background: C.bg }}>
      <Sidebar active={active} onNavigate={setActive} onLogout={handleLogout} />

      {/* Swap this for a router/switch once you add Recipes, Grocery List, Saved */}
      {active === "week" && <ThisWeekScreen onOpenRecipe={() => setRecipeOpen(true)} />}

      {recipeOpen && <RecipeDetailModal onClose={() => setRecipeOpen(false)} />}
    </div>
  );
}

const emptyForm = {
  name: "",
  description: "",
  categoryId: ""
};

// 
  useEffect(() => {
    async function loadData() {
      try {
        const [itemData, categoryData] = await Promise.all([
          fetchItems(),
          fetchCategories()
        ]);

        setItems(itemData);
        setCategories(categoryData);
        setStatus("");
      } catch (error) {
        setStatus(error.message);
      }
    }

    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Saving item...");

    try {
      const savedItem = await createItem(form);
      setItems((currentItems) => [...currentItems, savedItem]);
      setForm(emptyForm);
      setStatus("Item created successfully.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">React + Express + PostgreSQL + Prisma</p>
        <h1>Student Full Stack Template</h1>
        <p>
          This starter includes a small example with categories and items so
          students can see how the frontend, backend, and database connect.
        </p>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Create an item</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Item name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Build a new feature"
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the task"
                rows="4"
                required
              />
            </label>

            <label>
              Category
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit">Create item</button>
          </form>
        </article>

        <article className="panel">
          <h2>Example items</h2>
          {status ? <p className="status">{status}</p> : null}
          <ItemList items={items} />
        </article>
      </section>
    </main>
  );

