import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";

export default function CartPage() {
  const navigate = useNavigate();
  const { itemsList, subtotal, totalQty, inc, dec, remove, clear } = useCart();

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

        {itemsList.length === 0 ? (
          <div className="emptyCart">
            <p>Your cart is empty.</p>
            <button className="seeMore" type="button" onClick={() => navigate("/")}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cartList">
              {itemsList.map(({ product, qty }) => (
                <div className="cartItem" key={product.id}>
                  <img className="cartImg" src={product.img} alt={product.title} />

                  <div className="cartInfo">
                    <div className="cartName">{product.title}</div>
                    <div className="cartDesc">{product.category}</div>
                    <div className="cartPrice">${product.price.toFixed(2)}</div>
                  </div>

                  <div className="qtyBox">
                    <button className="qtyBtn" onClick={() => dec(product.id)} type="button">
                      −
                    </button>
                    <div className="qtyNum">{qty}</div>
                    <button className="qtyBtn" onClick={() => inc(product.id)} type="button">
                      +
                    </button>
                    <button
                      className="removeBtn"
                      onClick={() => remove(product.id)}
                      type="button"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cartSummary">
              <div className="sumRow">
                <span>Items</span>
                <span>{totalQty}</span>
              </div>
              <div className="sumRow">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <button
                className="checkoutBtn"
                type="button"
                onClick={() => alert("Checkout coming next ✅")}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
