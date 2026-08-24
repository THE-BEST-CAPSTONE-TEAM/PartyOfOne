import React, { useState, useEffect, useRef } from "react";
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

function generateTiles(rows, cols) {
  return Array.from({ length: rows * cols }).map((_, i) => ({
    id: i,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: (Math.random() - 0.5) * 0.4,
    offsetX: Math.random() * 360,
    offsetY: Math.random() * 360,
    scale: 0.85 + Math.random() * 0.3,
    opacity: 0.7 + Math.random() * 0.27,
  }));
}

const isMobile = window.innerWidth < 768;
function TiledBackground() {
  const rows = isMobile ? 8 : 4;
  const cols = isMobile ? 4 : 6;
  const tiles = useRef(generateTiles(rows, cols));
  const frameRef = useRef(null);
  const timeRef = useRef(0);
  const [positions, setPositions] = useState(
    tiles.current.map(() => ({ x: 0, y: 0 })),
  );

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (now) => {
      const delta = now - lastTime;
      lastTime = now;
      timeRef.current += delta;
      setPositions(
        tiles.current.map((tile) => ({
          x:
            Math.sin((timeRef.current / 1000) * tile.speedX + tile.offsetX) *
            (isMobile ? 5 : 12),
          y:
            Math.cos((timeRef.current / 1000) * tile.speedY + tile.offsetY) *
            (isMobile ? 5 : 12),
        })),
      );
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        padding: "24px 12px",
      }}
    >
      {tiles.current.map((tile, i) => (
        <div
          key={tile.id}
          className="flex items-center justify-center"
          style={{ overflow: "visible" }}
        >
          <img
            src={logo}
            alt=""
            style={{
              width: isMobile ? 80 : 140,
              height: isMobile ? 80 : 140,
              objectFit: "contain",
              opacity: tile.opacity,
              transform: `translate(${positions[i]?.x ?? 0}px, ${positions[i]?.y ?? 0}px) scale(${tile.scale})`,
              willChange: "transform",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode) => {
    setError("");
    setPassword("");
    setConfirmPassword("");
    setMode(newMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setMode("verify");
    }
    setLoading(false);
  };

  const inputStyle = {
    ...fredoka,
    fontWeight: 600,
    fontSize: 13,
    color: BRAND.forest,
    background: BRAND.cream,
    border: `2px solid ${BRAND.forestDeep}`,
  };

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ background: BRAND.cream }}
    >
      <TiledBackground />

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(245,242,228,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Login form ── */}
      {mode === "login" && (
        <form
          onSubmit={handleLogin}
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
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full mb-5 px-4 py-2.5 rounded-full text-center outline-none"
            style={inputStyle}
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

          <div className="flex items-center gap-2 mt-1">
            <p
              style={{
                ...sans,
                fontSize: 12,
                color: BRAND.cream,
                opacity: 0.6,
              }}
            >
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              style={{
                ...sans,
                fontSize: 12,
                fontWeight: 600,
                color: BRAND.leaf,
              }}
            >
              Sign up
            </button>
          </div>
        </form>
      )}

      {/* ── Sign up form ── */}
      {mode === "signup" && (
        <form
          onSubmit={handleSignup}
          className="relative z-10 rounded-2xl px-9 py-8 flex flex-col items-center shadow-xl"
          style={{ background: BRAND.forest, width: 340 }}
        >
          <h1
            className="mb-2"
            style={{
              ...fredoka,
              fontWeight: 600,
              fontSize: 22,
              color: BRAND.cream,
            }}
          >
            Create Account
          </h1>
          <p
            className="mb-5 text-center"
            style={{ ...sans, fontSize: 11, color: BRAND.cream, opacity: 0.5 }}
          >
            Your personal meal planning space
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full mb-3 px-4 py-2.5 rounded-full text-center outline-none"
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full mb-3 px-4 py-2.5 rounded-full text-center outline-none"
            style={inputStyle}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full mb-5 px-4 py-2.5 rounded-full text-center outline-none"
            style={inputStyle}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="flex items-center gap-2 mt-1">
            <p
              style={{
                ...sans,
                fontSize: 12,
                color: BRAND.cream,
                opacity: 0.6,
              }}
            >
              Already have an account?
            </p>
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                ...sans,
                fontSize: 12,
                fontWeight: 600,
                color: BRAND.leaf,
              }}
            >
              Log in
            </button>
          </div>
        </form>
      )}

      {/* ── Email verification screen ── */}
      {mode === "verify" && (
        <div
          className="relative z-10 rounded-2xl px-9 py-8 flex flex-col items-center shadow-xl text-center"
          style={{ background: BRAND.forest, width: 340 }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: BRAND.leaf }}
          >
            <span style={{ fontSize: 28 }}>📬</span>
          </div>
          <h1
            className="mb-2"
            style={{
              ...fredoka,
              fontWeight: 600,
              fontSize: 22,
              color: BRAND.cream,
            }}
          >
            Check your email
          </h1>
          <p
            className="mb-6"
            style={{
              ...sans,
              fontSize: 12,
              color: BRAND.cream,
              opacity: 0.6,
              lineHeight: 1.6,
            }}
          >
            We sent a confirmation link to{" "}
            <strong style={{ color: BRAND.cream, opacity: 1 }}>{email}</strong>.
            Click it to activate your account then log in.
          </p>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="w-full py-2.5 rounded-full transition-transform hover:scale-[1.02]"
            style={{
              ...fredoka,
              fontWeight: 600,
              fontSize: 14,
              color: BRAND.white,
              background: BRAND.coral,
            }}
          >
            Back to Log In
          </button>
        </div>
      )}
    </div>
  );
}
