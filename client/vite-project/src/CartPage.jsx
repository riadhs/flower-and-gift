import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import crossSellAddons from "./crossSellAddons.js"; // adjust path if needed

export default function CartPage() {
  const navigate = useNavigate();

  const {
    itemsMap,
    subtotal,
    totalQty,
    inc,
    dec,
    remove,
    clear,
    addonsMap,
    addonsSubtotal,
    toggleAddon,
    setAddonVariant,
  } = useCart();

  const entries = Object.entries(itemsMap);

  // track current dropdown choice per addon (for checkbox + variant items)
  const [addonVariantChoice, setAddonVariantChoice] = useState(() => {
    const init = {};
    crossSellAddons.forEach((a) => {
      if (a.variants?.length) init[a.id] = a.variants[0].id;
    });
    return init;
  });

  function isAddonChecked(addon) {
    const vId = addon.variants?.length ? addonVariantChoice[addon.id] : "";
    const key = vId ? `${addon.id}::${vId}` : String(addon.id);
    return !!addonsMap[key];
  }

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
                      ${Number(product.price).toFixed(2)}
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

            {/* ✅ Cross-sell add-ons */}
            <div className="addonsBox">
              <div className="addonsTitle">Add something extra?</div>

              <div className="addonsList">
                {crossSellAddons.map((a) => {
                  const hasVariants = !!a.variants?.length;
                  const chosenVariantId = hasVariants ? addonVariantChoice[a.id] : "";
                  const chosenVariant = hasVariants
                    ? a.variants.find((v) => v.id === chosenVariantId) || a.variants[0]
                    : null;

                  const price = hasVariants ? chosenVariant.price : a.price;
                  const checked = isAddonChecked(a);

                  return (
                    <div className="addonRow" key={a.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddon(a, chosenVariantId)}
                      />

                      <img className="addonImg" src={a.img} alt={a.title} />

                      <div className="addonInfo">
                        <div className="addonName">{a.title}</div>

                        {hasVariants && (
                          <select
                            value={chosenVariantId}
                            onChange={(e) => {
                              const vId = e.target.value;
                              setAddonVariantChoice((prev) => ({ ...prev, [a.id]: vId }));

                              // if already checked, switch selection in cart
                              if (checked) setAddonVariant(a, vId);
                            }}
                          >
                            {a.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.label} — ${v.price.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="addonPrice">
                        ${Number(price).toFixed(2)}
                        {hasVariants ? ` (${chosenVariant.label})` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cartSummary">
              <div className="sumRow">
                <span>Items</span>
                <span>{totalQty}</span>
              </div>

              <div className="sumRow">
                <span>Add-ons</span>
                <span>${addonsSubtotal.toFixed(2)}</span>
              </div>

              <div className="sumRow">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
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
