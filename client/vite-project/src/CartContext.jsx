import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function getCartKey(product) {
  const vId = product?.selectedVariant?.id;
  return vId ? `${product.id}::${vId}` : String(product.id);
}

// ✅ addon key helper
function getAddonKey(addon, selectedVariantId) {
  return selectedVariantId ? `${addon.id}::${selectedVariantId}` : String(addon.id);
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const p = action.payload;
      const key = getCartKey(p);

      const existing = state.items[key];
      const nextQty = (existing?.qty || 0) + 1;

      return {
        ...state,
        items: {
          ...state.items,
          [key]: { product: p, qty: nextQty },
        },
      };
    }

    case "INC": {
      const key = action.payload;
      const existing = state.items[key];
      if (!existing) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [key]: { ...existing, qty: existing.qty + 1 },
        },
      };
    }

    case "DEC": {
      const key = action.payload;
      const existing = state.items[key];
      if (!existing) return state;

      const nextQty = existing.qty - 1;
      if (nextQty <= 0) {
        const { [key]: _, ...rest } = state.items;
        return { ...state, items: rest };
      }

      return {
        ...state,
        items: {
          ...state.items,
          [key]: { ...existing, qty: nextQty },
        },
      };
    }

    case "REMOVE": {
      const key = action.payload;
      const { [key]: _, ...rest } = state.items;
      return { ...state, items: rest };
    }

    // ✅ add-on toggle (checkbox)
    case "TOGGLE_ADDON": {
      const { addon, variantId } = action.payload;
      const key = getAddonKey(addon, variantId);

      const exists = !!state.addons[key];

      if (exists) {
        const { [key]: _, ...rest } = state.addons;
        return { ...state, addons: rest };
      }

      // store selected variant snapshot if any
      const selectedVariant =
        addon.variants?.find((v) => v.id === variantId) || null;

      const price = selectedVariant ? selectedVariant.price : addon.price;

      return {
        ...state,
        addons: {
          ...state.addons,
          [key]: {
            addon: {
              ...addon,
              price,
              selectedVariant: selectedVariant
                ? { id: selectedVariant.id, label: selectedVariant.label, price: selectedVariant.price }
                : null,
            },
            qty: 1,
          },
        },
      };
    }

    // ✅ if addon is selected, change its variant/price (dropdown change)
    case "SET_ADDON_VARIANT": {
      const { addon, variantId } = action.payload;

      // remove any previous selections for this addon id (different variant)
      const rest = { ...state.addons };
      Object.keys(rest).forEach((k) => {
        if (k.startsWith(`${addon.id}::`) || k === String(addon.id)) delete rest[k];
      });

      // add the newly selected variant as checked
      const key = getAddonKey(addon, variantId);
      const selectedVariant = addon.variants?.find((v) => v.id === variantId) || null;
      const price = selectedVariant ? selectedVariant.price : addon.price;

      rest[key] = {
        addon: {
          ...addon,
          price,
          selectedVariant: selectedVariant
            ? { id: selectedVariant.id, label: selectedVariant.label, price: selectedVariant.price }
            : null,
        },
        qty: 1,
      };

      return { ...state, addons: rest };
    }

    case "CLEAR": {
      return { items: {}, addons: {} };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {}, addons: {} });

  const api = useMemo(() => {
    const itemEntries = Object.values(state.items);
    const addonEntries = Object.values(state.addons);

    const totalQty = itemEntries.reduce((sum, x) => sum + x.qty, 0);

    const itemsSubtotal = itemEntries.reduce(
      (sum, x) => sum + x.qty * Number(x.product.price || 0),
      0
    );

    const addonsSubtotal = addonEntries.reduce(
      (sum, x) => sum + x.qty * Number(x.addon.price || 0),
      0
    );

    const subtotal = itemsSubtotal + addonsSubtotal;

    return {
      // main items
      itemsMap: state.items,
      itemsList: itemEntries,

      // addons
      addonsMap: state.addons,
      addonsList: addonEntries,

      totalQty,
      itemsSubtotal,
      addonsSubtotal,
      subtotal,

      addItem: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
      inc: (key) => dispatch({ type: "INC", payload: key }),
      dec: (key) => dispatch({ type: "DEC", payload: key }),
      remove: (key) => dispatch({ type: "REMOVE", payload: key }),

      toggleAddon: (addon, variantId = "") =>
        dispatch({ type: "TOGGLE_ADDON", payload: { addon, variantId } }),

      setAddonVariant: (addon, variantId) =>
        dispatch({ type: "SET_ADDON_VARIANT", payload: { addon, variantId } }),

      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items, state.addons]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
