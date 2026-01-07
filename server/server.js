// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const db = require("./db");

// const app = express();
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// // ✅ Get products + variants grouped like your frontend needs
// app.get("/api/products", async (req, res) => {
//   const [rows] = await db.query(`
//     SELECT
//       p.id AS product_id,
//       c.name AS category,
//       p.title,
//       p.description,
//       p.image_url,
//       v.id AS variant_id,
//       v.label AS variant_label,
//       v.price_cents,
//       v.sku
//     FROM products p
//     LEFT JOIN categories c ON c.id = p.category_id
//     LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = 1
//     WHERE p.is_active = TRUE
//     ORDER BY p.id ASC, v.price_cents ASC
//   `);

//   // group into { id, title, desc, img, category, variants: [...] }
//   const map = new Map();

//   for (const r of rows) {
//     if (!map.has(r.product_id)) {
//       map.set(r.product_id, {
//         id: r.product_id,
//         category: r.category,
//         title: r.title,
//         desc: r.description,
//         img: r.image_url,
//         variants: [],
//       });
//     }

//     if (r.variant_id) {
//       map.get(r.product_id).variants.push({
//         id: String(r.variant_id),
//         label: r.variant_label,
//         price: r.price_cents / 100,
//         sku: r.sku,
//       });
//     }
//   }

//   const products = Array.from(map.values()).map((p) => {
//     // If only 1 variant (Standard), you can optionally expose price
//     if (p.variants.length === 1 && p.variants[0].label === "Standard") {
//       return { ...p, price: p.variants[0].price };
//     }
//     return p;
//   });

//   res.json(products);
// });

// app.get("/api/health", async (req, res) => {
//   const [r] = await db.query("SELECT 1 AS ok");
//   res.json({ ok: true, db: r[0].ok });
// });

// app.listen(process.env.PORT || 5000, () => {
//   console.log("API running on http://localhost:5000");
// });



const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();
app.use(express.json());

// ✅ If using Vite proxy, you can just do app.use(cors()) or even remove it in dev.
// If NOT using proxy, keep origin strict:
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", async (req, res) => {
  const [rows] = await db.query("SELECT 1 AS ok");
  res.json({ ok: true, db: rows[0].ok });
});

/**
 * ✅ Returns products in frontend-friendly format:
 * {
 *   id, category, title, desc, img,
 *   price (if single standard variant),
 *   variants (if multiple)
 * }
 */
app.get("/api/products", async (req, res) => {
  const sql = `
    SELECT
      p.id            AS productId,
      p.title         AS title,
      p.description   AS description,
      p.image_url     AS imageUrl,
      p.is_active     AS productActive,

      c.name          AS category,

      v.id            AS variantId,
      v.label         AS variantLabel,
      v.price_cents   AS priceCents,
      v.sku           AS sku,
      v.is_active     AS variantActive
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_variants v ON v.product_id = p.id
    WHERE p.is_active = TRUE
      AND (v.id IS NULL OR v.is_active = TRUE)
    ORDER BY p.id ASC, v.price_cents ASC
  `;

  const [rows] = await db.query(sql);

  // Group rows -> products
  const map = new Map();

  for (const r of rows) {
    if (!map.has(r.productId)) {
      map.set(r.productId, {
        id: r.productId,
        category: r.category || "Uncategorized",
        title: r.title,
        desc: r.description || "",
        img: r.imageUrl || "",
        variants: [],
      });
    }

    // If there is a variant row, push it
    if (r.variantId) {
      map.get(r.productId).variants.push({
        id: String(r.variantId),           // keep id string-safe for frontend
        label: r.variantLabel,
        price: Number(r.priceCents) / 100,
        sku: r.sku || null,
      });
    }
  }

  // Normalize:
  // - If no variants: keep a default price = 0 (or you can omit price)
  // - If exactly 1 variant and label is "Standard", expose price directly
  const products = Array.from(map.values()).map((p) => {
    if (p.variants.length === 0) {
      return { ...p, price: 0 }; // or remove price if you prefer
    }

    if (p.variants.length === 1 && p.variants[0].label?.toLowerCase() === "standard") {
      const only = p.variants[0];
      // keep variants optional; many UIs prefer just price for simple items
      const { variants, ...rest } = p;
      return { ...rest, price: only.price };
    }

    // multi-variant product: return variants and no single price
    return p;
  });

  res.json(products);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
