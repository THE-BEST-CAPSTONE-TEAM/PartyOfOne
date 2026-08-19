// import React, { useState } from "react";
// import { X, Clock, Flame, Plus, Minus, Heart } from "lucide-react";
// import { C, serif, sans } from "../theme/tokens";
// import { RECIPE } from "../data/mockData";
// import TagPill from "./TagPill";
// import Checkbox from "./Checkbox";

// export default function RecipeDetailModal({ onClose }) {
//   const [servings, setServings] = useState(2);
//   const [saved, setSaved] = useState(true);
//   const [checked, setChecked] = useState({});
//   const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

//   return (
//     <div
//       className="fixed inset-0 z-20 flex items-center justify-center p-8"
//       style={{ background: "rgba(43,43,43,0.45)" }}
//       onClick={onClose}
//     >
//       <div
//         className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl grid"
//         style={{
//           gridTemplateColumns: "360px 1fr",
//           maxHeight: "88vh",
//           background: C.bg,
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
//           style={{ background: "rgba(255,251,245,0.9)" }}
//         >
//           <X size={16} color={C.charcoal} />
//         </button>

//         {/* left: photo + actions, pinned */}
//         <div
//           className="p-6 overflow-y-auto"
//           style={{ borderRight: `1px solid ${C.line}` }}
//         >
//           <img
//             src={RECIPE.photo}
//             alt={RECIPE.title}
//             className="w-full h-44 object-cover rounded-xl mb-4"
//           />
//           <h2
//             className="text-xl mb-2 leading-tight"
//             style={{ ...serif, fontWeight: 600, color: C.charcoal }}
//           >
//             {RECIPE.title}
//           </h2>
//           <div className="flex gap-2 mb-4">
//             <TagPill tone="green">{RECIPE.tags[0]}</TagPill>
//             <TagPill tone="primary">{RECIPE.tags[1]}</TagPill>
//           </div>
//           <div
//             className="flex items-center gap-4 mb-5"
//             style={{ ...sans, color: C.muted }}
//           >
//             <div className="flex items-center gap-1.5 text-xs">
//               <Clock size={13} /> {RECIPE.time}
//             </div>
//             <div className="flex items-center gap-1.5 text-xs">
//               <Flame size={13} /> {RECIPE.cal}
//             </div>
//           </div>

//           <div
//             className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4"
//             style={{ background: C.sand }}
//           >
//             <span
//               className="text-xs font-semibold"
//               style={{ ...sans, color: C.charcoal }}
//             >
//               Servings
//             </span>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setServings((s) => Math.max(1, s - 1))}
//                 className="w-6 h-6 rounded-full flex items-center justify-center"
//                 style={{ background: C.bg }}
//               >
//                 <Minus size={12} color={C.charcoal} />
//               </button>
//               <span
//                 className="text-sm font-semibold w-3 text-center"
//                 style={{ ...sans, color: C.charcoal }}
//               >
//                 {servings}
//               </span>
//               <button
//                 onClick={() => setServings((s) => s + 1)}
//                 className="w-6 h-6 rounded-full flex items-center justify-center"
//                 style={{ background: C.primary }}
//               >
//                 <Plus size={12} color={C.onPrimary} />
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={() => setSaved((s) => !s)}
//             className="w-full py-2.5 rounded-full text-xs font-semibold mb-2 flex items-center justify-center gap-2"
//             style={{
//               ...sans,
//               border: `1.5px solid ${C.line}`,
//               color: C.charcoal,
//             }}
//           >
//             <Heart
//               size={13}
//               color={saved ? C.coral : C.charcoal}
//               fill={saved ? C.coral : "none"}
//             />
//             {saved ? "Saved" : "Save recipe"}
//           </button>
//           {/* <button
//             className="w-full py-2.5 rounded-full text-xs font-semibold shadow-sm"
//             style={{ ...sans, background: C.primary, color: C.onPrimary }}
//           >
//             Add ingredients to grocery list
//           </button> */}
//         </div>

//         {/* right: ingredients + steps, scrolls independently */}
//         <div className="p-6 overflow-y-auto">
//           <h3
//             className="text-sm font-bold mb-3"
//             style={{ ...serif, fontWeight: 600, color: C.charcoal }}
//           >
//             Ingredients
//           </h3>
//           <div className="mb-6">
//             {RECIPE.ingredients.map((ing) => (
//               <div
//                 key={ing.id}
//                 className="flex items-center gap-3 py-2 border-b"
//                 style={{ borderColor: C.line }}
//               >
//                 <Checkbox
//                   checked={!!checked[ing.id]}
//                   onClick={() => toggle(ing.id)}
//                 />
//                 <span
//                   className="flex-1 text-sm"
//                   style={{
//                     ...sans,
//                     color: checked[ing.id] ? C.faint : C.charcoal,
//                     textDecoration: checked[ing.id] ? "line-through" : "none",
//                   }}
//                 >
//                   {ing.name}
//                 </span>
//                 <span
//                   className="text-xs font-medium"
//                   style={{ ...sans, color: C.muted }}
//                 >
//                   {ing.qty}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <h3
//             className="text-sm font-bold mb-3"
//             style={{ ...serif, fontWeight: 600, color: C.charcoal }}
//           >
//             Steps
//           </h3>
//           <div className="flex flex-col gap-4">
//             {RECIPE.steps.map((step, i) => (
//               <div key={i} className="flex gap-3">
//                 <div
//                   className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
//                   style={{
//                     border: `1.5px solid ${C.charcoal}`,
//                     color: C.charcoal,
//                     ...sans,
//                   }}
//                 >
//                   {i + 1}
//                 </div>
//                 <p
//                   className="text-sm leading-relaxed"
//                   style={{ ...sans, color: C.charcoal }}
//                 >
//                   {step}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
