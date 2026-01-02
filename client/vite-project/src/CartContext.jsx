import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const p = action.payload;
      const existing = state.items[p.id];
      const nextQty = (existing?.qty || 0) + 1;

      return {
        ...state,
        items: {
          ...state.items,
          [p.id]: { product: p, qty: nextQty },
        },
      };
    }

    case "INC": {
      const id = action.payload;
      const existing = state.items[id];
      if (!existing) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [id]: { ...existing, qty: existing.qty + 1 },
        },
      };
    }

    case "DEC": {
      const id = action.payload;
      const existing = state.items[id];
      if (!existing) return state;

      const nextQty = existing.qty - 1;
      if (nextQty <= 0) {
        const { [id]: _, ...rest } = state.items;
        return { ...state, items: rest };
      }

      return {
        ...state,
        items: {
          ...state.items,
          [id]: { ...existing, qty: nextQty },
        },
      };
    }

    case "REMOVE": {
      const id = action.payload;
      const { [id]: _, ...rest } = state.items;
      return { ...state, items: rest };
    }

    case "CLEAR": {
      return { items: {} };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} });

  const api = useMemo(() => {
    const entries = Object.values(state.items);

    const totalQty = entries.reduce((sum, x) => sum + x.qty, 0);
    const subtotal = entries.reduce((sum, x) => sum + x.qty * x.product.price, 0);

    return {
      itemsMap: state.items,
      itemsList: entries,
      totalQty,
      subtotal,

      addItem: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
      inc: (id) => dispatch({ type: "INC", payload: id }),
      dec: (id) => dispatch({ type: "DEC", payload: id }),
      remove: (id) => dispatch({ type: "REMOVE", payload: id }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
