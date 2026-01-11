// import React, { useMemo, useState } from "react";
// import { Routes, Route, useNavigate, useParams } from "react-router-dom";
// import CATEGORIES from "./categories/categories"
// // import { all, byCategory } from "./categories/products"; //used for front end load and repleaced with useProduct.js
// import useProducts from "./useProducts";
// import { useCart } from "./CartContext.jsx";
// import CartPage from "./CartPage.jsx";
// import Time from "./Time.jsx";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import ProductCard from "./productCard.jsx"

// import AdminLogin from "./admin/pages/AdminLogin.jsx";
// import AdminProducts from "./admin/pages/AdminProducts.jsx";
// import AdminProductForm from "./admin/pages/AdminProductForm.jsx";
// import RequireAdmin from "./admin/RequireAdmin.jsx";
// import AdminAddons from "./admin/pages/AdminAddons";
// import AdminAddonForm from "./admin/pages/AdminAddonForm";
// import useCategories from "./hooks/useCategories";
// import AdminCategories from "./admin/pages/AdminCategories";
// import AdminCategoryForm from "./admin/pages/AdminCategoryForm";




// // helper for URL
// function slugify(name) {
//   return name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
// }
// function unslugify(slug) {
//   return CATEGORIES.find((c) => slugify(c) === slug) || "Full Catalog";
// }


// function getPrevNextCategory(currentCategory) {
//   const idx = CATEGORIES.indexOf(currentCategory);

//   // if category not found, default to first
//   const safeIdx = idx === -1 ? 0 : idx;

//   const prevIdx = (safeIdx - 1 + CATEGORIES.length) % CATEGORIES.length;
//   const nextIdx = (safeIdx + 1) % CATEGORIES.length;

//   return {
//     prev: CATEGORIES[prevIdx],
//     next: CATEGORIES[nextIdx],
//   };
// }



// // function useProducts() {
// //   // no useMemo needed since this is imported data
// //   return { byCategory, all };
// // }




// // export default function App() {
// //   return (
// //     <Routes>
// //       <Route path="/" element={<CatalogPreviewPage />} />
// //       <Route path="/category/:categorySlug" element={<CategoryPage />} />
// //       <Route path="/cart" element={<CartPage />} />
// //     </Routes>
// //   );
// // }

// export default function App() {
//   return (
//     <Routes>
//       {/* your storefront routes */}
//        <Route path="/" element={<CatalogPreviewPage />} /> 
//       <Route path="/category/:categorySlug" element={<CategoryPage />} /> 
//       <Route path="/cart" element={<CartPage />} /> 

//       {/* ADMIN */}
//       <Route path="/admin/login" element={<AdminLogin />} />

//       <Route
//         path="/admin/products"
//         element={
//           <RequireAdmin>
//             <AdminProducts />
//           </RequireAdmin>
//         }
//       />

//       <Route
//         path="/admin/products/new"
//         element={
//           <RequireAdmin>
//             <AdminProductForm mode="create" />
//           </RequireAdmin>
//         }
//       />

//       <Route
//         path="/admin/products/:id"
//         element={
//           <RequireAdmin>
//             <AdminProductForm mode="edit" />
//           </RequireAdmin>
//         }
//       />
//       <Route
//   path="/admin/addons"
//   element={
//     <RequireAdmin>
//       <AdminAddons />
//     </RequireAdmin>
//   }
// />

// <Route
//   path="/admin/addons/new"
//   element={
//     <RequireAdmin>
//       <AdminAddonForm mode="new" />
//     </RequireAdmin>
//   }
// />

// <Route
//   path="/admin/addons/:id"
//   element={
//     <RequireAdmin>
//       <AdminAddonForm mode="edit" />
//     </RequireAdmin>
//   }
// />

// <Route path="/admin/categories" element={<AdminCategories />} />
// <Route path="/admin/categories/new" element={<AdminCategoryForm mode="new" />} />
// <Route path="/admin/categories/:id" element={<AdminCategoryForm mode="edit" />} />


//     </Routes>
//   );
// }


// /** Shared header + layout wrapper */
// function Layout({ today, children, activeCategory, setActiveCategory, onSearch, query }) {
//   const navigate = useNavigate();
//   const { totalQty } = useCart();

//   function handleCategoryClick(cat) {
//     setActiveCategory(cat);

//     if (cat === "Full Catalog") {
//       navigate("/");
//     } else {
//       navigate(`/category/${slugify(cat)}`);
//     }
//   }

//   return (
//     <div className="page">
//       <div className="shell">
//         {/* TOP HEADER */}
//         <header className="topbar">
//           <div className="address">
//             <div className="pin" aria-hidden="true">
//   <FaMapMarkerAlt />
// </div>
//             <div className="addrText">
//               <div className="addrLine">95 S Lockwood Dr</div>
//               <div className="addrLine muted">Houston, TX 77011</div>
//             </div>
//           </div>

//           <h1 className="brand">Flower &amp; Gift</h1>
//         </header>

//         {/* SUB BAR */}
//         <div className="subbar">
//           <div className="hours">
//             <div className="hoursLabel">Today :</div>
//             <div className="hoursTime"><Time today={today} /></div>
//           </div>

//           <div className="searchWrap">
//             <span className="searchIcon" aria-hidden="true">
//               🔍
//             </span>
//             <input
//               className="search"
//               placeholder="Search Flower & Gift"
//               value={query}
//               onChange={(e) => onSearch(e.target.value)}
//             />
//           </div>

//                 <button
//         className="cartBtn"
//         type="button"
//         aria-label="Cart"
//         onClick={() => navigate("/cart")}
//       >
//         <span className="cartIcon" aria-hidden="true">
//           🛒
//         </span>
//         <span className="cartBadge">{totalQty}</span>
//       </button>

//         </div>

//         {/* MAIN */}
//         <main className="main">
//           {/* LEFT SIDEBAR */}
//           <aside className="sidebar">

//             <button
//               className={`sideItem ${activeCategory === "Full Catalog" ? "active" : ""}`}
//               onClick={() => handleCategoryClick("Full Catalog")}
//               type="button"
//             >
//               Full Catalog
//             </button>

//             {CATEGORIES.map((c) => (
//               <button
//                 key={c}
//                 className={`sideItem ${activeCategory === c ? "active" : ""}`}
//                 onClick={() => handleCategoryClick(c)}
//                 type="button"
//               >
//                 {c}
//               </button>
//             ))}
//           </aside>

//           <section className="content">{children}</section>
//         </main>
//       </div>
//     </div>
//   );
// }


// //  Updated CatalogPreviewPage(): uses real cart (addItem(product))
// // and keeps the existing search + See more behavior

// function CatalogPreviewPage() {
//   // const { all: allProducts } = useProducts(); //only front end
//   const { all: allProducts, loading, error } = useProducts();
//   // //...............................................................................
//   // if (loading) return <div style={{ padding: 16 }}>Loading products...</div>;
//   // if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
//   // //...............................................................................

//   const navigate = useNavigate();
//   const today = new Date();

//   //  real cart function (stores product + qty)
//   const { addItem } = useCart();

//   const [activeCategory, setActiveCategory] = useState("Full Catalog");
//   const [query, setQuery] = useState("");

//   // optional: make See more load more results when searching
//   const [limit, setLimit] = useState(6);

//    //...............................................................................
//   if (loading) return <div style={{ padding: 16 }}>Loading products...</div>;
//   if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
//   //...............................................................................

//   const filtered = allProducts.filter((p) => {
//     const q = query.trim().toLowerCase();
//     if (!q) return true;
//     return (
//       p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
//     );
//   });

//   const preview = filtered.slice(0, limit);

//   function handleSeeMore() {
//     //  If searching, just show more items on the same page
//     if (query.trim()) {
//       setLimit((l) => l + 12);
//       return;
//     }

//     //  If no category selected, default to Flower Bouquet
//     const targetCategory =
//       activeCategory === "Full Catalog" ? "Flower Bouquet" : activeCategory;

//     navigate(`/category/${slugify(targetCategory)}`);
//   }

//   return (
//     <Layout
//       today={today}
//       activeCategory={activeCategory}
//       setActiveCategory={setActiveCategory}
//       onSearch={(val) => {
//         setQuery(val);
//         setLimit(6); // reset preview when typing a new search
//       }}
//       query={query}
//     >
//       {/*  IMPORTANT: ProductGrid must call onAdd(p) */}
//       <ProductGrid products={preview} onAdd={addItem} />

//       <button className="seeMore" type="button" onClick={handleSeeMore}>
//         See more...
//       </button>
//     </Layout>
//   );
// }


// function ProductGrid({ products, onAdd }) {
//   if (!products.length) return <div style={{ padding: 12, opacity: 0.8 }}>No items yet.</div>;

//   return (
//     <div className="grid">
//       {products.map((p) => (
//         <ProductCard key={p.id} p={p} onAdd={onAdd} />
//       ))}
//     </div>
//   );
// }



// function CategoryPage() {
//   // const { all: allProducts } = useProducts();
//   const { all: allProducts, loading, error } = useProducts();

//   // if (loading) return <div style={{ padding: 16 }}>Loading products...</div>;
//   // if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
//   // //...............................................................................

//   const { categorySlug } = useParams();
//   const navigate = useNavigate();

//   const category = unslugify(categorySlug) || CATEGORIES[0];

//   const { addItem } = useCart();

//   const [activeCategory, setActiveCategory] = useState(category);
//   const [query, setQuery] = useState("");


//    //...............................................................................
//   if (loading) return <div style={{ padding: 16 }}>Loading products...</div>;
//   if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
//   //...............................................................................

//   const q = query.trim().toLowerCase();

//   const filtered = allProducts
//     .filter((p) => (q ? true : p.category === category))
//     .filter((p) => {
//       if (!q) return true;
//       return (
//         p.title.toLowerCase().includes(q) ||
//         p.desc.toLowerCase().includes(q)
//       );
//     });

//   const { prev, next } = getPrevNextCategory(category);

//   function goCategory(catName) {
//     setActiveCategory(catName);
//     setQuery("");
//     navigate(`/category/${slugify(catName)}`);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   return (
//     <Layout
//       activeCategory={activeCategory}
//       setActiveCategory={setActiveCategory}
//       onSearch={setQuery}
//       query={query}
//     >
//       <div className="catNavRow">
//         <div className="catTitle">
//           {q ? `Search results for: "${query}"` : category}
//         </div>
//       </div>

//       <ProductGrid products={filtered} onAdd={addItem} />

//       <div className="catNavBottom">
//         <button className="catNavBtn" type="button" onClick={() => goCategory(prev)}>
//           ← Previous
//         </button>
//         <button className="catNavBtn" type="button" onClick={() => goCategory(next)}>
//           Next →
//         </button>
//       </div>
//     </Layout>
//   );
// }





import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

import useProducts from "./useProducts";
import useCategories from "./hooks/useCategories";

import { useCart } from "./CartContext.jsx";
import CartPage from "./CartPage.jsx";
import Time from "./Time.jsx";
import { FaMapMarkerAlt } from "react-icons/fa";
import ProductCard from "./productCard.jsx";

// ADMIN
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminProducts from "./admin/pages/AdminProducts.jsx";
import AdminProductForm from "./admin/pages/AdminProductForm.jsx";
import RequireAdmin from "./admin/RequireAdmin.jsx";

import AdminAddons from "./admin/pages/AdminAddons";
import AdminAddonForm from "./admin/pages/AdminAddonForm";

import AdminCategories from "./admin/pages/AdminCategories";
import AdminCategoryForm from "./admin/pages/AdminCategoryForm";
import AdminSchedule from "./admin/pages/AdminSchedule.jsx"

// helper (keep for misc use; slug is now from DB)
function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");
}

// ---------- APP ROUTES ----------
export default function App() {
  return (
    <Routes>
      {/* STOREFRONT */}
      <Route path="/" element={<CatalogPreviewPage />} />
      <Route path="/category/:categorySlug" element={<CategoryPage />} />
      <Route path="/cart" element={<CartPage />} />

      {/* ADMIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/products"
        element={
          <RequireAdmin>
            <AdminProducts />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <RequireAdmin>
            <AdminProductForm mode="create" />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/products/:id"
        element={
          <RequireAdmin>
            <AdminProductForm mode="edit" />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/addons"
        element={
          <RequireAdmin>
            <AdminAddons />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/addons/new"
        element={
          <RequireAdmin>
            <AdminAddonForm mode="new" />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/addons/:id"
        element={
          <RequireAdmin>
            <AdminAddonForm mode="edit" />
          </RequireAdmin>
        }
      />

      {/* ✅ protect categories too */}
      <Route
        path="/admin/categories"
        element={
          <RequireAdmin>
            <AdminCategories />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/categories/new"
        element={
          <RequireAdmin>
            <AdminCategoryForm mode="new" />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/categories/:id"
        element={
          <RequireAdmin>
            <AdminCategoryForm mode="edit" />
          </RequireAdmin>
        }
      />
      <Route 
      path="/admin/schedule" 
      element={
      <RequireAdmin>
        <AdminSchedule />
        </RequireAdmin>}
         />

    </Routes>
  );
}

// ---------- SHARED LAYOUT ----------
function Layout({ today, children, activeCategory, setActiveCategory, onSearch, query }) {
  const navigate = useNavigate();
  const { totalQty } = useCart();

  // ✅ Categories from DB
  const { categories, loading: catsLoading } = useCategories();

  function handleCategoryClick(cat) {
    setActiveCategory(cat);

    if (cat === "Full Catalog") {
      navigate("/");
      return;
    }

    const found = categories.find((c) => c.name === cat);
    if (!found) return;

    navigate(`/category/${found.slug}`);
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
            <div className="hoursTime">
              <Time today={today} />
            </div>
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

          <button className="cartBtn" type="button" aria-label="Cart" onClick={() => navigate("/cart")}>
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

            {catsLoading ? (
              <div style={{ padding: 10, opacity: 0.7 }}>Loading categories...</div>
            ) : (
              categories.map((c) => (
                <button
                  key={c.id}
                  className={`sideItem ${activeCategory === c.name ? "active" : ""}`}
                  onClick={() => handleCategoryClick(c.name)}
                  type="button"
                >
                  {c.name}
                </button>
              ))
            )}
          </aside>

          <section className="content">{children}</section>
        </main>
      </div>
    </div>
  );
}

// ---------- GRID ----------
function ProductGrid({ products, onAdd }) {
  if (!products.length) return <div style={{ padding: 12, opacity: 0.8 }}>No items yet.</div>;

  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} onAdd={onAdd} />
      ))}
    </div>
  );
}

// ---------- HOME PAGE ----------
function CatalogPreviewPage() {
  const { all: allProducts, loading, error } = useProducts();
  const { categories } = useCategories();

  const navigate = useNavigate();
  const today = new Date();
  const { addItem } = useCart();

  const [activeCategory, setActiveCategory] = useState("Full Catalog");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(6);

  if (loading) return <div style={{ padding: 16 }}>Loading products...</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;

  const q = query.trim().toLowerCase();

  const filtered = allProducts.filter((p) => {
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
  });

  const preview = filtered.slice(0, limit);

  function handleSeeMore() {
    if (q) {
      setLimit((l) => l + 12);
      return;
    }

    // If Full Catalog, navigate to first DB category (if exists)
    if (activeCategory === "Full Catalog") {
      if (categories.length) navigate(`/category/${categories[0].slug}`);
      return;
    }

    const found = categories.find((c) => c.name === activeCategory);
    if (found) navigate(`/category/${found.slug}`);
  }

  return (
    <Layout
      today={today}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      onSearch={(val) => {
        setQuery(val);
        setLimit(6);
      }}
      query={query}
    >
      <ProductGrid products={preview} onAdd={addItem} />

      <button className="seeMore" type="button" onClick={handleSeeMore}>
        See more...
      </button>
    </Layout>
  );
}

// ---------- CATEGORY PAGE ----------
function CategoryPage() {
  const { all: allProducts, loading, error } = useProducts();
  const { categories, loading: catsLoading } = useCategories();

  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [activeCategory, setActiveCategory] = useState("Full Catalog");
  const [query, setQuery] = useState("");

  // ✅ determine current category by slug from DB
  const currentCategoryObj = useMemo(() => {
    return categories.find((c) => c.slug === categorySlug);
  }, [categories, categorySlug]);

  // keep activeCategory synced once categories load
  useEffect(() => {
    if (currentCategoryObj?.name) setActiveCategory(currentCategoryObj.name);
  }, [currentCategoryObj]);

  if (loading || catsLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!currentCategoryObj) return <div style={{ padding: 16, color: "crimson" }}>Category not found.</div>;

  const categoryName = currentCategoryObj.name;

  const q = query.trim().toLowerCase();

  const filtered = allProducts
    .filter((p) => (q ? true : p.category === categoryName))
    .filter((p) => {
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    });

  // ✅ prev/next using DB categories
  const idx = categories.findIndex((c) => c.slug === categorySlug);
  const prevObj = categories[(idx - 1 + categories.length) % categories.length];
  const nextObj = categories[(idx + 1) % categories.length];

  function goCategory(catObj) {
    if (!catObj) return;
    setActiveCategory(catObj.name);
    setQuery("");
    navigate(`/category/${catObj.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Layout
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      onSearch={setQuery}
      query={query}
    >
      <div className="catNavRow">
        <div className="catTitle">{q ? `Search results for: "${query}"` : categoryName}</div>
      </div>

      <ProductGrid products={filtered} onAdd={addItem} />

      <div className="catNavBottom">
        <button className="catNavBtn" type="button" onClick={() => goCategory(prevObj)}>
          ← Previous
        </button>
        <button className="catNavBtn" type="button" onClick={() => goCategory(nextObj)}>
          Next →
        </button>
      </div>
    </Layout>
  );
}
