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

  return {
    name: p.product_name || p.generic_name || null,
    brand: p.brands || null,
    calories:
      nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"] ?? null,
    protein: nutriments["proteins_100g"] ?? null,
    carbs: nutriments["carbohydrates_100g"] ?? null,
    fat: nutriments["fat_100g"] ?? null,
    sugar: nutriments["sugars_100g"] ?? null,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(43,43,43,0.7)" }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl w-full"
        style={{ background: C.card, maxWidth: 400 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${C.line}` }}
        >
          <div className="flex items-center gap-2">
            <Camera size={18} color={C.charcoal} />
            <h3
              className="text-base font-semibold"
              style={{ ...serif, color: C.charcoal }}
            >
              Scan Barcode
            </h3>
          </div>
          <button onClick={onClose}>
            <X size={18} color={C.muted} />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative" style={{ background: "#000", height: 240 }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: cameraError ? "none" : "block" }}
          />

          {/* Scanning overlay */}
          {scanning && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-xl"
                style={{
                  width: 220,
                  height: 120,
                  border: `2px solid ${C.primary}`,
                  boxShadow: `0 0 0 9999px rgba(0,0,0,0.4)`,
                  position: "relative",
                }}
              >
                {/* Corner decorations */}
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
                      width: 20,
                      height: 20,
                      border: `3px solid ${C.primary}`,
                      borderRadius: 3,
                      ...style,
                    }}
                  />
                ))}

                {/* Scanning line animation */}
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
              <style>{`
                @keyframes scan {
                  0%, 100% { transform: translateY(-40px); opacity: 0.3; }
                  50% { transform: translateY(40px); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <Camera size={32} color={C.faint} />
              <p
                className="text-sm text-center"
                style={{ ...sans, color: C.faint }}
              >
                Camera not available. Make sure you've granted camera
                permission.
              </p>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${C.line}`, background: C.bg }}
        >
          {loading ? (
            <RefreshCw size={14} color={C.muted} className="animate-spin" />
          ) : error ? (
            <AlertCircle size={14} color={C.primary} />
          ) : result ? (
            <CheckCircle size={14} color={C.green} />
          ) : (
            <div
              className="w-3.5 h-3.5 rounded-full animate-pulse"
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
                ? `Not found — try again`
                : result
                  ? `Found: ${result.name || "Unknown product"}`
                  : status}
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className="px-5 py-4">
            {result.image && (
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={result.image}
                  alt={result.name}
                  className="w-12 h-12 rounded-xl object-contain"
                  style={{ background: C.sand }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ ...sans, color: C.charcoal }}
                  >
                    {result.name || "Unknown product"}
                  </p>
                  {result.brand && (
                    <p className="text-xs" style={{ ...sans, color: C.muted }}>
                      {result.brand}
                    </p>
                  )}
                  {result.servingSize && (
                    <p className="text-xs" style={{ ...sans, color: C.faint }}>
                      Per {result.servingSize}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Macro grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                {
                  label: "Calories",
                  value: result.calories,
                  unit: "kcal",
                  color: C.primary,
                },
                {
                  label: "Protein",
                  value: result.protein,
                  unit: "g",
                  color: C.green,
                },
                {
                  label: "Carbs",
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
                  className="rounded-xl p-2 text-center"
                  style={{ background: C.bg }}
                >
                  <p className="text-sm font-bold" style={{ ...sans, color }}>
                    {value !== null ? Math.round(value) : "—"}
                  </p>
                  <p className="text-[9px]" style={{ ...sans, color: C.faint }}>
                    {unit}
                  </p>
                  <p
                    className="text-[9px] font-semibold"
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
                className="flex-1 py-2.5 rounded-full text-xs font-semibold"
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
                className="flex-1 py-2.5 rounded-full text-xs font-semibold"
                style={{ ...sans, background: C.primary, color: C.onPrimary }}
              >
                Use this data
              </button>
            </div>
          </div>
        )}

        {/* Retry on error */}
        {error && !result && (
          <div className="px-5 py-4">
            <p
              className="text-xs text-center mb-3"
              style={{ ...sans, color: C.muted }}
            >
              Product not found in Open Food Facts database. Try a different
              item or enter macros manually.
            </p>
            <button
              onClick={handleRetry}
              className="w-full py-2.5 rounded-full text-xs font-semibold"
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
