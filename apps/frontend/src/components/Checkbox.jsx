import React from "react";
import { Check } from "lucide-react";
import { C } from "../theme/tokens";

export default function Checkbox({ checked, onClick, tone = "primary" }) {
  const fill = tone === "primary" ? C.primary : C.green;
  const mark = tone === "primary" ? C.onPrimary : "#FFFBF5";

  return (
    <button
      onClick={onClick}
      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
      style={{ borderColor: checked ? fill : "#D8CDBB", background: checked ? fill : "transparent" }}
    >
      {checked && <Check size={12} strokeWidth={3} color={mark} />}
    </button>
  );
}