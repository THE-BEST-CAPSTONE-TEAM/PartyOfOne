import React from "react";
import { Plus } from "lucide-react";
import { C } from "../theme/tokens";

export default function EmptySlot({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl flex items-center justify-center h-10 flex-shrink-0 transition-colors"
      style={{ border: `1px dashed ${C.line}`, color: C.faint }}
    >
      <Plus size={16} />
    </button>
  );
}