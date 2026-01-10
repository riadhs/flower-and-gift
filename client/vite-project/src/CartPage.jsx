// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "./CartContext.jsx";
// import useAddons from "./useAddons.js";

// export default function CartPage() {
//   const navigate = useNavigate();

//   const {
//     itemsMap,
//     subtotal,           // items subtotal
//     totalQty,
//     inc,
//     dec,
//     remove,
//     clear,

//     addonsMap,
//     addonsSubtotal,
//     toggleAddon,
//     setAddonVariant,
//   } = useCart();

//   const entries = Object.entries(itemsMap);

//   // ✅ load addons from DB
//   const { addons: dbAddons, loading: addonsLoading } = useAddons();

//   // track dropdown choice per addon
//   const [addonVariantChoice, setAddonVariantChoice] = useState({});

//   // ✅ init dropdown defaults once addons load
//   useEffect(() => {
//     if (!dbAddons?.length) return;

//     setAddonVariantChoice((prev) => {
//       const next = { ...prev };
//       for (const a of dbAddons) {
//         if (a.variants?.length && !next[a.id]) {
//           next[a.id] = String(a.variants[0].id);
//         }
//       }
//       return next;
//     });
//   }, [dbAddons]);

//   function isAddonChecked(addon) {
//     const hasVariants = !!addon.variants?.length;
//     const vId = hasVariants ? addonVariantChoice[addon.id] : "";
//     const key = vId ? `${addon.id}::${vId}` : String(addon.id);
//     return !!addonsMap[key];
//   }

//   const grandTotal = subtotal + addonsSubtotal;

//   return (
//     <div className="page">
//       <div className="shell">
//         <div className="cartHeader">
//           <button className="backBtn" onClick={() => navigate(-1)} type="button">
//             ← Back
//           </button>
//           <h2 className="cartTitle">Your Cart</h2>
//           <button className="clearBtn" onClick={clear} type="button">
//             Clear
//           </button>
//         </div>

//         {entries.length === 0 ? (
//           <div className="emptyCart">
//             <p>Your cart is empty.</p>
//             <button className="seeMore" type="button" onClick={() => navigate("/")}>
//               Continue shopping
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="cartList">
//               {entries.map(([key, { product, qty }]) => (
//                 <div className="cartItem" key={key}>
//                   <img className="cartImg" src={product.img} alt={product.title} />

//                   <div className="cartInfo">
//                     <div className="cartName">{product.title}</div>
//                     <div className="cartDesc">
//                       {product.selectedVariant?.label
//                         ? `${product.category} • ${product.selectedVariant.label}`
//                         : product.category}
//                     </div>
//                     <div className="cartPrice">
//                       ${Number(product.price).toFixed(2)}
//                       {product.selectedVariant?.label ? ` (${product.selectedVariant.label})` : ""}
//                     </div>
//                   </div>

//                   <div className="qtyBox">
//                     <button className="qtyBtn" onClick={() => dec(key)} type="button">
//                       −
//                     </button>
//                     <div className="qtyNum">{qty}</div>
//                     <button className="qtyBtn" onClick={() => inc(key)} type="button">
//                       +
//                     </button>
//                     <button
//                       className="removeBtn"
//                       onClick={() => remove(key)}
//                       type="button"
//                       title="Remove"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* ✅ Cross-sell add-ons from DB */}
//             <div className="addonsBox">
//               <div className="addonsTitle">Add something extra?</div>

//               {addonsLoading ? (
//                 <div style={{ padding: 12, opacity: 0.8 }}>Loading add-ons...</div>
//               ) : (
//                 <div className="addonsList">
//                   {dbAddons.map((a) => {
//                     const hasVariants = !!a.variants?.length;
//                     const chosenVariantId = hasVariants ? addonVariantChoice[a.id] : "";
//                     const chosenVariant = hasVariants
//                       ? a.variants.find((v) => String(v.id) === String(chosenVariantId)) || a.variants[0]
//                       : null;

//                     const price = hasVariants ? chosenVariant.price : a.price;
//                     const checked = isAddonChecked(a);

//                     return (
//                       <div className="addonRow" key={a.id}>
//                         <input
//                           type="checkbox"
//                           checked={checked}
//                           onChange={() => toggleAddon(a, chosenVariantId)}
//                         />

//                         <img className="addonImg" src={a.img} alt={a.title} />

//                         <div className="addonInfo">
//                           <div className="addonName">{a.title}</div>

//                           {hasVariants && (
//                             <select
//                               value={chosenVariantId}
//                               onChange={(e) => {
//                                 const vId = e.target.value;
//                                 setAddonVariantChoice((prev) => ({ ...prev, [a.id]: vId }));

//                                 if (checked) setAddonVariant(a, vId);
//                               }}
//                             >
//                               {a.variants.map((v) => (
//                                 <option key={v.id} value={String(v.id)}>
//                                   {v.label} — ${Number(v.price).toFixed(2)}
//                                 </option>
//                               ))}
//                             </select>
//                           )}
//                         </div>

//                         <div className="addonPrice">
//                           ${Number(price).toFixed(2)}
//                           {hasVariants ? ` (${chosenVariant.label})` : ""}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             <div className="cartSummary">
//               <div className="sumRow">
//                 <span>Items</span>
//                 <span>{totalQty}</span>
//               </div>

//               <div className="sumRow">
//                 <span>Add-ons</span>
//                 <span>${addonsSubtotal.toFixed(2)}</span>
//               </div>

//               <div className="sumRow">
//                 <span>Total</span>
//                 <span>${grandTotal.toFixed(2)}</span>
//               </div>

//               <button className="checkoutBtn" type="button" onClick={() => alert("Checkout coming next ✅")}>
//                 Checkout
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import useAddons from "./useAddons.js";

const n2 = (v) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};

const money = (v) => n2(v).toFixed(2);

function moneyFromAddonVariant(v) {
  if (!v) return 0;
  if (v.price_cents != null) return n2(v.price_cents) / 100;
  return n2(v.price);
}

function moneyFromAddon(a) {
  if (!a) return 0;
  if (a.price_cents != null) return n2(a.price_cents) / 100;
  return n2(a.price);
}

export default function CartPage() {
  const navigate = useNavigate();

  const cart = useCart(); // ✅ grab everything safely

  const {
    itemsMap = {},
    totalQty = 0,
    inc,
    dec,
    remove,
    clear,

    addonsMap = {},
    addonsSubtotal = 0,
    toggleAddon,
    setAddonVariant,

    // depending on your CartContext, any of these might exist:
    itemsSubtotal,
    grandTotal,
    subtotal, // some versions call combined total "subtotal"
  } = cart;

  const entries = Object.entries(itemsMap);

  const { addons: dbAddons, loading: addonsLoading } = useAddons();

  const [addonVariantChoice, setAddonVariantChoice] = useState({});

  useEffect(() => {
    if (!dbAddons?.length) return;
    setAddonVariantChoice((prev) => {
      const next = { ...prev };
      for (const a of dbAddons) {
        if (a.variants?.length && !next[a.id]) {
          next[a.id] = String(a.variants[0].id);
        }
      }
      return next;
    });
  }, [dbAddons]);

  function isAddonChecked(addon) {
    const hasVariants = !!addon.variants?.length;
    const vId = hasVariants ? addonVariantChoice[addon.id] : "";
    const key = vId ? `${addon.id}::${vId}` : String(addon.id);
    return !!addonsMap[key];
  }

  // ✅ compute totals safely no matter what CartContext provides
  const safeItemsSubtotal =
    itemsSubtotal != null ? n2(itemsSubtotal) : n2(subtotal) - n2(addonsSubtotal);

  const safeAddonsSubtotal = n2(addonsSubtotal);

  const safeGrandTotal =
    grandTotal != null ? n2(grandTotal) : safeItemsSubtotal + safeAddonsSubtotal;

  return (
    <div className="page">
      <div className="shell">
        <div className="cartHeader">
          <button className="backBtn" onClick={() => navigate(-1)} type="button">
            ← Back
          </button>
          <h2 className="cartTitle">Your Cart</h2>
          <button className="clearBtn" onClick={clear} type="button">
            Clear
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="emptyCart">
            <p>Your cart is empty.</p>
            <button className="seeMore" type="button" onClick={() => navigate("/")}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cartList">
              {entries.map(([key, { product, qty }]) => (
                <div className="cartItem" key={key}>
                  <img className="cartImg" src={product.img} alt={product.title} />

                  <div className="cartInfo">
                    <div className="cartName">{product.title}</div>
                    <div className="cartDesc">
                      {product.selectedVariant?.label
                        ? `${product.category} • ${product.selectedVariant.label}`
                        : product.category}
                    </div>
                    <div className="cartPrice">
                      ${money(product.price)}
                      {product.selectedVariant?.label ? ` (${product.selectedVariant.label})` : ""}
                    </div>
                  </div>

                  <div className="qtyBox">
                    <button className="qtyBtn" onClick={() => dec(key)} type="button">
                      −
                    </button>
                    <div className="qtyNum">{qty}</div>
                    <button className="qtyBtn" onClick={() => inc(key)} type="button">
                      +
                    </button>
                    <button className="removeBtn" onClick={() => remove(key)} type="button" title="Remove">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="addonsBox">
              <div className="addonsTitle">Add something extra?</div>

              {addonsLoading ? (
                <div style={{ padding: 12, opacity: 0.8 }}>Loading add-ons...</div>
              ) : (
                <div className="addonsList">
                  {dbAddons.map((a) => {
                    const hasVariants = !!a.variants?.length;

                    const chosenVariantId = hasVariants
                      ? String(addonVariantChoice[a.id] || a.variants?.[0]?.id || "")
                      : "";

                    const chosenVariant = hasVariants
                      ? a.variants.find((v) => String(v.id) === String(chosenVariantId)) ||
                        a.variants[0]
                      : null;

                    const price = hasVariants ? moneyFromAddonVariant(chosenVariant) : moneyFromAddon(a);

                    const checked = isAddonChecked(a);

                    return (
                      <div className="addonRow" key={a.id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(a, hasVariants ? chosenVariantId : "")}
                        />

                        <img
                          className="addonImg"
                          src={a.image_url || a.img || ""}
                          alt={a.title}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />

                        <div className="addonInfo">
                          <div className="addonName">{a.title}</div>

                          {hasVariants && (
                            <select
                              value={chosenVariantId}
                              onChange={(e) => {
                                const vId = String(e.target.value);
                                setAddonVariantChoice((prev) => ({ ...prev, [a.id]: vId }));
                                if (checked) setAddonVariant(a, vId);
                              }}
                            >
                              {a.variants.map((v) => {
                                const vPrice = moneyFromAddonVariant(v);
                                return (
                                  <option key={v.id} value={String(v.id)}>
                                    {v.label} — ${money(vPrice)}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                        </div>

                        <div className="addonPrice">
                          ${money(price)}
                          {hasVariants ? ` (${chosenVariant?.label || ""})` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="cartSummary">
              <div className="sumRow">
                <span>Items</span>
                <span>${money(safeItemsSubtotal)}</span>
              </div>

              <div className="sumRow">
                <span>Add-ons</span>
                <span>${money(safeAddonsSubtotal)}</span>
              </div>

              <div className="sumRow">
                <span>Total</span>
                <span>${money(safeGrandTotal)}</span>
              </div>

              <button className="checkoutBtn" type="button" onClick={() => alert("Checkout coming next ✅")}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
