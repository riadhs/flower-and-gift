
import React, { useMemo, useState } from "react";
import categories from "./assets/categories";
import products from "./assets/products";

function App() {
  

  const [activeCategory, setActiveCategory] = useState("Full Catalog");
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
  });

  function addToCart() {
    setCartCount((c) => c + 1);
  }

  return (
    <div className="page">
      <div className="shell">
        {/* TOP HEADER */}
        <header className="topbar">
          <div className="address">
            <div className="pin" aria-hidden="true">
              ⬤
            </div>
            <div className="addrText">
              <div className="addrLine">95 S Lockwood Dr</div>
              <div className="addrLine muted">Houston, TX 77011</div>
            </div>
          </div>

          <h1 className="brand">Flower &amp; Gift</h1>
        </header>

        {/* SUB BAR */}
        <div className="subbar">
          <div className="hours">
            <div className="hoursLabel">Today :</div>
            <div className="hoursTime">10.00 am - 9.00 pm</div>
          </div>

          <div className="searchWrap">
            <span className="searchIcon" aria-hidden="true">
              🔍
            </span>
            <input
              className="search"
              placeholder="Search Flower & Edible"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button className="cartBtn" type="button" aria-label="Cart">
            <span className="cartIcon" aria-hidden="true">
              🛒
            </span>
            <span className="cartBadge">{cartCount}</span>
          </button>
        </div>

        {/* MAIN */}
        <main className="main">
          {/* LEFT SIDEBAR */}
          <aside className="sidebar">
            <div className="sideTitle">Full Catalog</div>

            <button
              className={`sideItem ${activeCategory === "Full Catalog" ? "active" : ""}`}
              onClick={() => setActiveCategory("Full Catalog")}
              type="button"
            >
              Full Catalog
            </button>

            {categories.map((c) => (
              <button
                key={c}
                className={`sideItem ${activeCategory === c ? "active" : ""}`}
                onClick={() => setActiveCategory(c)}
                type="button"
              >
                {c}
              </button>
            ))}
          </aside>

          {/* PRODUCT GRID */}
          <section className="content">
            <div className="grid">
              {filtered.map((p) => (
                <article className="card" key={p.id}>
                  <div className="thumb">
                    <img src={p.img} alt={p.title} />
                    <button
                      className="addBtn"
                      type="button"
                      onClick={addToCart}
                      aria-label={`Add ${p.title} to cart`}
                      title="Add to cart"
                    >
                      +
                    </button>
                  </div>

                  <div className="cardBody">
                    <div className="cardTitle">{p.title}</div>
                    <div className="cardDesc">{p.desc}</div>
                    <div className="cardPrice">${p.price.toFixed(2)}</div>
                  </div>
                </article>
              ))}
            </div>

            <button className="seeMore" type="button">
              See more...
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}



export default App