

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();
const adminRoutes = require("./routes/admin");
const adminUploadRoutes = require("./routes/adminUpload");

app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUploadRoutes);


// ✅ If using Vite proxy, you can just do app.use(cors()) or even remove it in dev.
// If NOT using proxy, keep origin strict:
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);



app.get("/api/debug/cloudinary-upload-test", async (req, res) => {
  try {
    // uploads a tiny public image URL to your cloudinary
    const upload = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "products", overwrite: false }
    );

    return res.json({
      ok: true,
      public_id: upload.public_id,
      secure_url: upload.secure_url,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
      name: err.name,
      http_code: err.http_code,
    });
  }
});


app.get("/api/categories", async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, name, slug FROM categories ORDER BY name ASC`
  );
  res.json(rows);
});

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
