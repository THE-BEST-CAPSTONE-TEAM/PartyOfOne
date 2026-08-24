import React, { useRef, useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import { supabase } from "../lib/supabase";

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

const sans = { fontFamily: "Inter, sans-serif" };

export const DEFAULT_RECIPE_PHOTO =
  "https://images.unsplash.com/photo-1614548540093-6f7dfceed46b?w=600&q=80";

// ── Upload a file to Supabase Storage ────────
async function uploadPhotoToSupabase(file, userId) {
  const ext = file.name.split(".").pop();
  const filename = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("recipe-photos")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from("recipe-photos")
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

// ── Photo upload button for CreateRecipeModal ─
// Shows a preview + upload button in the form
export function PhotoUploadField({ value, onChange, userId }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3001/api"
  ).replace(/\/$/, "");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const url = await uploadPhotoToSupabase(file, userId);
      onChange(url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const photo = value || DEFAULT_RECIPE_PHOTO;

  return (
    <div>
      {/* Preview */}
      <div
        className="relative w-full rounded-xl overflow-hidden mb-2"
        style={{ height: 160 }}
      >
        <img
          src={photo}
          alt="Recipe photo"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(43,43,43,0.35)" }}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-opacity"
            style={{
              ...sans,
              background: "rgba(255,251,245,0.95)",
              color: C.charcoal,
              opacity: uploading ? 0.7 : 1,
            }}
          >
            <Camera size={13} />
            {uploading ? "Uploading..." : value ? "Change photo" : "Add photo"}
          </button>
        </div>
        {/* Clear button if custom photo set */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,251,245,0.9)" }}
          >
            <X size={11} color={C.charcoal} />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs mb-1" style={{ ...sans, color: C.primary }}>
          {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* URL input as alternative */}
      <input
        type="text"
        placeholder="Or paste an image URL..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...sans,
          fontSize: 12,
          color: C.charcoal,
          background: C.bg,
          border: `1px solid ${C.line}`,
          borderRadius: 8,
          padding: "6px 10px",
          width: "100%",
          outline: "none",
        }}
      />
    </div>
  );
}

// ── Edit photo button for RecipeDetailModal ───
// Overlays a camera button on the recipe photo
export function EditPhotoButton({ recipeId, userId, currentPhoto, onUpdated }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const url = await uploadPhotoToSupabase(file, userId);

      // Update recipe photo_url in the database
      const API_URL = (
        import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      ).replace(/\/$/, "");
      const res = await fetch(`${API_URL}/recipes/${recipeId}/photo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: url }),
      });

      if (!res.ok) throw new Error("Failed to update photo");
      onUpdated(url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity"
        style={{
          ...sans,
          background: "rgba(255,251,245,0.95)",
          color: C.charcoal,
          opacity: uploading ? 0.7 : 1,
          zIndex: 5,
        }}
      >
        <Camera size={12} />
        {uploading ? "Uploading..." : "Edit photo"}
      </button>

      {error && (
        <p
          className="absolute bottom-10 right-2 text-xs px-2 py-1 rounded-lg"
          style={{ ...sans, background: C.primary, color: "#fff", zIndex: 5 }}
        >
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
