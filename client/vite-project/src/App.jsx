import React, { useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import CATEGORIES from "./categories/categories"
import { all, byCategory } from "./categories/products";
import { useCart } from "./CartContext.jsx";
import CartPage from "./CartPage.jsx";
import Time from "./Time.jsx";
import { FaMapMarkerAlt } from "react-icons/fa";


// helper for URL
function slugify(name) {
  return name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
}
function unslugify(slug) {
  return CATEGORIES.find((c) => slugify(c) === slug) || "Full Catalog";
}


function useProducts() {
  // no useMemo needed since this is imported data
  return { byCategory, all };
}


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPreviewPage />} />
      <Route path="/category/:categorySlug" element={<CategoryPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
}


/** Shared header + layout wrapper */
function Layout({ today, children, activeCategory, setActiveCategory, onSearch, query }) {
  const navigate = useNavigate();
  const { totalQty } = useCart();

  function handleCategoryClick(cat) {
    setActiveCategory(cat);

    if (cat === "Full Catalog") {
      navigate("/");
    } else {
      navigate(`/category/${slugify(cat)}`);
    }
  }

  return (
    <div className="page">
      <div className="shell">
        {/* TOP HEADER */}
        <header className="topbar">
          <div className="address">
            <div className="pin" aria-hidden="true">
  <FaMapMarkerAlt />
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
            <div className="hoursTime"><Time today={today} /></div>
          </div>

          <div className="searchWrap">
            <span className="searchIcon" aria-hidden="true">
              🔍
            </span>
            <input
              className="search"
              placeholder="Search Flower & Gift"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

                <button
        className="cartBtn"
        type="button"
        aria-label="Cart"
        onClick={() => navigate("/cart")}
      >
        <span className="cartIcon" aria-hidden="true">
          🛒
        </span>
        <span className="cartBadge">{totalQty}</span>
      </button>

        </div>

        {/* MAIN */}
        <main className="main">
          {/* LEFT SIDEBAR */}
          <aside className="sidebar">

            <button
              className={`sideItem ${activeCategory === "Full Catalog" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Full Catalog")}
              type="button"
            >
              Full Catalog
            </button>

            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`sideItem ${activeCategory === c ? "active" : ""}`}
                onClick={() => handleCategoryClick(c)}
                type="button"
              >
                {c}
              </button>
            ))}
          </aside>

          <section className="content">{children}</section>
        </main>
      </div>
    </div>
  );
}


//  Updated CatalogPreviewPage(): uses real cart (addItem(product))
// and keeps the existing search + See more behavior

function CatalogPreviewPage() {
  const { all: allProducts } = useProducts();
  const navigate = useNavigate();
  const today = new Date();

  //  real cart function (stores product + qty)
  const { addItem } = useCart();

  const [activeCategory, setActiveCategory] = useState("Full Catalog");
  const [query, setQuery] = useState("");

  // optional: make See more load more results when searching
  const [limit, setLimit] = useState(6);

  const filtered = allProducts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
  });

  const preview = filtered.slice(0, limit);

  function handleSeeMore() {
    //  If searching, just show more items on the same page
    if (query.trim()) {
      setLimit((l) => l + 12);
      return;
    }

    //  If no category selected, default to Flower Bouquet
    const targetCategory =
      activeCategory === "Full Catalog" ? "Flower Bouquet" : activeCategory;

    navigate(`/category/${slugify(targetCategory)}`);
  }

  return (
    <Layout
      today={today}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      onSearch={(val) => {
        setQuery(val);
        setLimit(6); // reset preview when typing a new search
      }}
      query={query}
    >
      {/*  IMPORTANT: ProductGrid must call onAdd(p) */}
      <ProductGrid products={preview} onAdd={addItem} />

      <button className="seeMore" type="button" onClick={handleSeeMore}>
        See more...
      </button>
    </Layout>
  );
}


function CategoryPage() {
  const { all: allProducts } = useProducts();
  const { categorySlug } = useParams();

  const today = new Date();

  const category = unslugify(categorySlug);

  //  real cart function
  const { addItem } = useCart();

  const [activeCategory, setActiveCategory] = useState(category);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  //  If searching => show results from all categories
  //  If not searching => show only this category
  const filtered = allProducts
    .filter((p) => {
      if (q) return true;
      return p.category === category;
    })
    .filter((p) => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      );
    });

  return (
    <Layout
      today={today}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      onSearch={setQuery}
      query={query}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>
        {q ? `Search results for: "${query}"` : category}
      </div>

      {/* IMPORTANT: ProductGrid must call onAdd(p) */}
      <ProductGrid products={filtered} onAdd={addItem} />
    </Layout>
  );
}


/** Shared UI grid */
function ProductGrid({ products, onAdd }) {
  if (!products.length) {
    return <div style={{ padding: 12, opacity: 0.8 }}>No items yet.</div>;
  }

  return (
    <div className="grid">
      {products.map((p) => (
        <article className="card" key={p.id}>
          <div className="thumb">
            <img src={p.img} alt={p.title} />
            

            <button
              className="addBtn"
              type="button"
              onClick={() => onAdd(p)}
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
  );
}

