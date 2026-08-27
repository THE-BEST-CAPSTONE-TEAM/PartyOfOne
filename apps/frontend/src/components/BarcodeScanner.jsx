import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { X, Camera, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

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

async function lookupBarcode(upc) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${upc}.json`,
  );
  if (!res.ok) throw new Error("Product not found");
  const data = await res.json();
  if (data.status === 0) throw new Error("Product not found in database");

  const p = data.product;
  const nutriments = p.nutriments || {};

  // Try to get serving size in grams to calculate per-serving values
  const servingQty = nutriments["serving_size"] || null;

  // Helper — prefer _serving, then calculate from 100g if serving size known,
  // otherwise fall back to 100g values
  const perServing = (key) => {
    // Best case: explicit per-serving value
    if (nutriments[`${key}_serving`] != null)
      return nutriments[`${key}_serving`];
    // Good case: calculate from serving size in grams
    if (servingQty && nutriments[`${key}_100g`] != null) {
      return (nutriments[`${key}_100g`] * servingQty) / 100;
    }
    // Fallback: divide 100g value by 100 to get per-gram estimate
    // This won't be accurate but at least won't show 9000 calories
    if (nutriments[`${key}_100g`] != null) {
      return nutriments[`${key}_100g`] / 100;
    }
    return null;
  };

  return {
    name: p.product_name || p.generic_name || null,
    brand: p.brands || null,
    calories: perServing("energy-kcal"),
    protein: perServing("proteins"),
    carbs: perServing("carbohydrates"),
    fat: perServing("fat"),
    sugar: perServing("sugars"),
    servingSize: p.serving_size || null,
    image: p.image_small_url || p.image_url || null,
  };
}

export default function BarcodeScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState("Point camera at a barcode");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    reader
      .decodeFromVideoDevice(null, videoRef.current, async (res, err) => {
        if (res && scanning) {
          setScanning(false);
          const upc = res.getText();
          setStatus(`Found barcode: ${upc}`);
          setLoading(true);
          setError(null);
          try {
            const nutrition = await lookupBarcode(upc);
            setResult(nutrition);
          } catch (err) {
            setError(err.message);
            setScanning(true);
            setStatus("Point camera at a barcode");
          } finally {
            setLoading(false);
          }
        }
      })
      .catch(() => {
        setCameraError(true);
      });
    return () => {
      reader.reset();
    };
  }, []);

  const handleRetry = () => {
    setResult(null);
    setError(null);
    setScanning(true);
    setStatus("Point camera at a barcode");
  };

  const handleUse = () => {
    if (result) {
      onResult(result);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(43,43,43,0.7)" }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl w-full"
        style={{
          background: C.card,
          maxWidth: 380,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${C.line}` }}
        >
          <div className="flex items-center gap-2">
            <Camera size={16} color={C.charcoal} />
            <h3
              className="text-sm font-semibold"
              style={{ ...serif, color: C.charcoal }}
            >
              Scan Barcode
            </h3>
          </div>
          <button onClick={onClose}>
            <X size={16} color={C.muted} />
          </button>
        </div>

        {/* Camera view — shorter on mobile */}
        <div className="relative" style={{ background: "#000", height: 200 }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: cameraError ? "none" : "block" }}
          />
          {scanning && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-xl"
                style={{
                  width: 200,
                  height: 100,
                  border: `2px solid ${C.primary}`,
                  boxShadow: `0 0 0 9999px rgba(0,0,0,0.4)`,
                  position: "relative",
                }}
              >
                {[
                  {
                    top: -2,
                    left: -2,
                    borderRight: "none",
                    borderBottom: "none",
                  },
                  {
                    top: -2,
                    right: -2,
                    borderLeft: "none",
                    borderBottom: "none",
                  },
                  {
                    bottom: -2,
                    left: -2,
                    borderRight: "none",
                    borderTop: "none",
                  },
                  {
                    bottom: -2,
                    right: -2,
                    borderLeft: "none",
                    borderTop: "none",
                  },
                ].map((style, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 16,
                      height: 16,
                      border: `3px solid ${C.primary}`,
                      borderRadius: 3,
                      ...style,
                    }}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    background: C.primary,
                    animation: "scan 1.5s ease-in-out infinite",
                    top: "50%",
                    opacity: 0.8,
                  }}
                />
              </div>
              <style>{`@keyframes scan { 0%, 100% { transform: translateY(-30px); opacity: 0.3; } 50% { transform: translateY(30px); opacity: 1; } }`}</style>
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <Camera size={28} color={C.faint} />
              <p
                className="text-xs text-center"
                style={{ ...sans, color: C.faint }}
              >
                Camera not available. Check permissions.
              </p>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${C.line}`, background: C.bg }}
        >
          {loading ? (
            <RefreshCw size={12} color={C.muted} className="animate-spin" />
          ) : error ? (
            <AlertCircle size={12} color={C.primary} />
          ) : result ? (
            <CheckCircle size={12} color={C.green} />
          ) : (
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ background: C.primary }}
            />
          )}
          <p
            className="text-xs"
            style={{
              ...sans,
              color: error ? C.primary : result ? C.green : C.muted,
            }}
          >
            {loading
              ? "Looking up product..."
              : error
                ? "Not found — try again"
                : result
                  ? `Found: ${result.name || "Unknown product"}`
                  : status}
          </p>
        </div>

        {/* ── Result — condensed layout ── */}
        {result && (
          <div className="px-4 py-3">
            {/* Product info — single compact row */}
            <div className="flex items-center gap-2 mb-3">
              {result.image && (
                <img
                  src={result.image}
                  alt={result.name}
                  className="rounded-lg object-contain flex-shrink-0"
                  style={{ width: 40, height: 40, background: C.sand }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ ...sans, color: C.charcoal }}
                >
                  {result.name || "Unknown product"}
                </p>
                <p className="text-[10px]" style={{ ...sans, color: C.faint }}>
                  {[
                    result.brand,
                    result.servingSize ? `Per ${result.servingSize}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>

            {/* Macro row — horizontal pill style instead of grid */}
            <div className="flex gap-1.5 mb-3">
              {[
                {
                  label: "Cal",
                  value: result.calories,
                  unit: "",
                  color: C.primary,
                },
                {
                  label: "Pro",
                  value: result.protein,
                  unit: "g",
                  color: C.green,
                },
                {
                  label: "Carb",
                  value: result.carbs,
                  unit: "g",
                  color: "#f59e0b",
                },
                {
                  label: "Fat",
                  value: result.fat,
                  unit: "g",
                  color: "#8b5cf6",
                },
                {
                  label: "Sugar",
                  value: result.sugar,
                  unit: "g",
                  color: "#ec4899",
                },
              ].map(({ label, value, unit, color }) => (
                <div
                  key={label}
                  className="flex-1 rounded-xl py-1.5 text-center"
                  style={{ background: C.bg }}
                >
                  <p className="text-xs font-bold" style={{ ...sans, color }}>
                    {value !== null ? Math.round(value) : "—"}
                  </p>
                  <p
                    className="text-[8px] leading-tight"
                    style={{ ...sans, color: C.faint }}
                  >
                    {unit}
                  </p>
                  <p
                    className="text-[8px] font-semibold leading-tight"
                    style={{ ...sans, color: C.muted }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="flex-1 py-2 rounded-full text-xs font-semibold"
                style={{
                  ...sans,
                  border: `1.5px solid ${C.line}`,
                  color: C.muted,
                }}
              >
                Scan again
              </button>
              <button
                onClick={handleUse}
                className="flex-1 py-2 rounded-full text-xs font-semibold"
                style={{ ...sans, background: C.primary, color: C.onPrimary }}
              >
                Use this data
              </button>
            </div>
          </div>
        )}
        <p className="text-[9px] mb-2" style={{ ...sans, color: C.faint }}>
          * Values may be approximate. Verify with product label.
        </p>

        {/* Retry on error */}
        {error && !result && (
          <div className="px-4 py-3">
            <p
              className="text-xs text-center mb-2"
              style={{ ...sans, color: C.muted }}
            >
              Not found in Open Food Facts. Try another item or enter macros
              manually.
            </p>
            <button
              onClick={handleRetry}
              className="w-full py-2 rounded-full text-xs font-semibold"
              style={{ ...sans, background: C.sand, color: C.muted }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
