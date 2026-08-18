import React, { useState } from "react";
import logo from "../assets/Logo.png";
import { supabase } from "../lib/supabase";

const BRAND = {
  cream: "#F5F2E4",
  coral: "#FA4A3D",
  white: "#F7F5EA",
  forest: "#173309",
  forestDeep: "#122806",
  leaf: "#7CBF3F",
};

const fredoka = { fontFamily: "'Fredoka', sans-serif" };
const sans = { fontFamily: "Inter, sans-serif" };

function TiledBackground() {
  const rows = 4;
  const cols = 6;
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        padding: "24px 12px",
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <img
          key={i}
          src={logo}
          alt=""
          className="w-full h-full object-contain"
          style={{ maxWidth: 140, opacity: 0.97 }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ background: BRAND.cream }}
    >
      <TiledBackground />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 rounded-2xl px-9 py-8 flex flex-col items-center shadow-xl"
        style={{ background: BRAND.forest, width: 340 }}
      >
        <h1
          className="mb-5"
          style={{
            ...fredoka,
            fontWeight: 600,
            fontSize: 22,
            color: BRAND.cream,
            letterSpacing: "0.01em",
          }}
        >
          Log In
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full mb-3 px-4 py-2.5 rounded-full text-center outline-none"
          style={{
            ...fredoka,
            fontWeight: 600,
            fontSize: 13,
            color: BRAND.forest,
            background: BRAND.cream,
            border: `2px solid ${BRAND.forestDeep}`,
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full mb-5 px-4 py-2.5 rounded-full text-center outline-none"
          style={{
            ...fredoka,
            fontWeight: 600,
            fontSize: 13,
            color: BRAND.forest,
            background: BRAND.cream,
            border: `2px solid ${BRAND.forestDeep}`,
          }}
        />

        {error && (
          <p
            style={{
              ...sans,
              fontSize: 12,
              color: BRAND.coral,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full mb-3 transition-transform hover:scale-[1.02]"
          style={{
            ...fredoka,
            fontWeight: 600,
            fontSize: 14,
            color: BRAND.white,
            background: BRAND.coral,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Log In"}
        </button>

        <button
          type="button"
          className="text-xs"
          style={{ ...sans, color: BRAND.leaf }}
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}
