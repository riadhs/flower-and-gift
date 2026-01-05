const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ✅ Get products + variants grouped like your frontend needs
app.get("/api/products", async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      p.id AS product_id,
      c.name AS category,
      p.title,
      p.description,
      p.image_url,
      v.id AS variant_id,
      v.label AS variant_label,
      v.price_cents,
      v.sku
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = 1
    WHERE p.is_active = TRUE
    ORDER BY p.id ASC, v.price_cents ASC
  `);

  // group into { id, title, desc, img, category, variants: [...] }
  const map = new Map();

  for (const r of rows) {
    if (!map.has(r.product_id)) {
      map.set(r.product_id, {
        id: r.product_id,
        category: r.category,
        title: r.title,
        desc: r.description,
        img: r.image_url,
        variants: [],
      });
    }

    if (r.variant_id) {
      map.get(r.product_id).variants.push({
        id: String(r.variant_id),
        label: r.variant_label,
        price: r.price_cents / 100,
        sku: r.sku,
      });
    }
  }

  const products = Array.from(map.values()).map((p) => {
    // If only 1 variant (Standard), you can optionally expose price
    if (p.variants.length === 1 && p.variants[0].label === "Standard") {
      return { ...p, price: p.variants[0].price };
    }
    return p;
  });

  res.json(products);
});

app.get("/api/health", async (req, res) => {
  const [r] = await db.query("SELECT 1 AS ok");
  res.json({ ok: true, db: r[0].ok });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("API running on http://localhost:5000");
});
