const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/** LOGIN */
router.post("/login", async (req, res) => {


  const { email, password } = req.body || {};

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // For MVP: store ADMIN_PASSWORD as plain in env, compare directly.
  // Better later: store hashed password.
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin", email },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

/** Protect everything below */
router.use(adminAuth);

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  is_active: z.coerce.boolean().optional().default(true), // only if you added is_active
});

router.get("/categories", async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, name, slug, ${/* if active column exists */""} is_active
     FROM categories
     ORDER BY name ASC`
  );
  res.json(rows);
});

router.post("/categories", async (req, res) => {
  const data = categorySchema.parse(req.body);
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  const [result] = await db.query(
    `INSERT INTO categories (name, slug${data.is_active !== undefined ? ", is_active" : ""})
     VALUES (?, ?${data.is_active !== undefined ? ", ?" : ""})`,
    data.is_active !== undefined ? [data.name, slug, data.is_active] : [data.name, slug]
  );

  res.status(201).json({ id: result.insertId });
});

router.put("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = categorySchema.parse(req.body);
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  await db.query(
    `UPDATE categories
     SET name=?, slug=?${data.is_active !== undefined ? ", is_active=?" : ""}
     WHERE id=?`,
    data.is_active !== undefined ? [data.name, slug, data.is_active, id] : [data.name, slug, id]
  );

  res.json({ ok: true });
});

router.delete("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);

  await db.query(`UPDATE categories SET is_active=FALSE WHERE id=?`, [id]);
  res.json({ ok: true });
});

router.delete("/categories/:id/hard", async (req, res) => {
  const id = Number(req.params.id);

  const [[countRow]] = await db.query(
    `SELECT COUNT(*) AS cnt FROM products WHERE category_id=?`,
    [id]
  );

  if (countRow.cnt > 0) {
    return res.status(400).json({
      error: "This category has products. Move products to another category before deleting.",
    });
  }

  await db.query(`DELETE FROM categories WHERE id=?`, [id]);
  res.json({ ok: true });
});



router.get("/products", async (req, res) => {
  const [rows] = await db.query(
    `
    SELECT 
      p.id, p.title, p.description, p.image_url, p.is_active,
      c.name AS category,
      MIN(v.price_cents) AS min_price_cents
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_variants v 
      ON v.product_id = p.id AND v.is_active = TRUE
    GROUP BY p.id
    ORDER BY p.id DESC
    `
  );

  // optional: convert cents to dollars
  const out = rows.map(r => ({
    ...r,
    price: r.min_price_cents != null ? Number(r.min_price_cents) / 100 : 0
  }));

  res.json(out);
});



router.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  const [rows] = await db.query(
    `
    SELECT p.id, p.title, p.description, p.image_url, p.category_id, p.is_active,
           c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});



// const productSchema = z.object({
//   title: z.string().min(1),
//   description: z.string().optional().default(""),
//   image_url: z.string().url().optional().default(""),
//   category_id: z.coerce.number().int(),     // ✅ coerce fixes frontend sending "3"
//   is_active: z.coerce.boolean().optional().default(true),
//   price: z.coerce.number().nonnegative().optional().default(0), // ✅ from admin form
// });

const productSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional().default(""),

  // allow "" or a valid URL
  image_url: z.union([z.string().url(), z.literal("")]).optional().default(""),

  category_id: z.coerce.number().int(),
  is_active: z.coerce.boolean().optional().default(true),
  price: z.coerce.number().nonnegative().optional().default(0),
});



router.post("/products", async (req, res) => {
  const data = productSchema.parse(req.body);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO products (title, description, image_url, category_id, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [data.title, data.description, data.image_url, data.category_id, data.is_active]
    );

    const productId = result.insertId;

    // ✅ create default "Standard" variant using price
    const priceCents = Math.round(Number(data.price || 0) * 100);

    await conn.query(
      `INSERT INTO product_variants (product_id, label, price_cents, sku, is_active)
       VALUES (?, 'Standard', ?, NULL, TRUE)`,
      [productId, priceCents]
    );

    await conn.commit();
    res.status(201).json({ id: productId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message || "Create failed" });
  } finally {
    conn.release();
  }
});


router.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = productSchema.parse(req.body);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE products
       SET title=?, description=?, image_url=?, category_id=?, is_active=?
       WHERE id=?`,
      [data.title, data.description, data.image_url, data.category_id, data.is_active, id]
    );

    // ✅ update or create Standard variant
    const priceCents = Math.round(Number(data.price || 0) * 100);

    const [existing] = await conn.query(
      `SELECT id FROM product_variants
       WHERE product_id=? AND label='Standard'
       LIMIT 1`,
      [id]
    );

    if (existing.length) {
      await conn.query(
        `UPDATE product_variants SET price_cents=? WHERE id=?`,
        [priceCents, existing[0].id]
      );
    } else {
      await conn.query(
        `INSERT INTO product_variants (product_id, label, price_cents, sku, is_active)
         VALUES (?, 'Standard', ?, NULL, TRUE)`,
        [id, priceCents]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message || "Update failed" });
  } finally {
    conn.release();
  }
});


/** Soft delete (deactivate) product */
router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  await db.query(`UPDATE products SET is_active=FALSE WHERE id=?`, [id]);
  res.json({ ok: true });
});

/** Hard delete (permanent) product */
router.delete("/products/:id/hard", async (req, res) => {
  const id = Number(req.params.id);

  // delete variants first to avoid FK constraint errors
  await db.query(`DELETE FROM product_variants WHERE product_id=?`, [id]);

  // now delete the product
  await db.query(`DELETE FROM products WHERE id=?`, [id]);

  res.json({ ok: true });
});


/** Variants */
const variantSchema = z.object({
  label: z.string().min(1),
  price_cents: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

router.get("/products/:id/variants", async (req, res) => {
  const productId = Number(req.params.id);
  const [rows] = await db.query(
    `SELECT id, product_id, label, price_cents, sku, is_active
     FROM product_variants
     WHERE product_id=?
     ORDER BY price_cents ASC`,
    [productId]
  );
  res.json(rows);
});

router.post("/products/:id/variants", async (req, res) => {
  const productId = Number(req.params.id);
  const data = variantSchema.parse(req.body);

  const [result] = await db.query(
    `INSERT INTO product_variants (product_id, label, price_cents, sku, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, data.label, data.price_cents, data.sku || null, data.is_active]
  );

  res.status(201).json({ id: result.insertId });
});

router.put("/variants/:variantId", async (req, res) => {
  const variantId = Number(req.params.variantId);
  const data = variantSchema.parse(req.body);

  await db.query(
    `UPDATE product_variants
     SET label=?, price_cents=?, sku=?, is_active=?
     WHERE id=?`,
    [data.label, data.price_cents, data.sku || null, data.is_active, variantId]
  );

  res.json({ ok: true });
});

router.delete("/variants/:variantId", async (req, res) => {
  const variantId = Number(req.params.variantId);
  await db.query(`DELETE FROM product_variants WHERE id=?`, [variantId]);
  res.json({ ok: true });
});


// ===== SCHEDULE (ADMIN) =====

// Get schedule (admin)
router.get("/schedule", async (req, res) => {
  const [weekly] = await db.query(
    `SELECT day_of_week, is_closed, open_time, close_time
     FROM store_schedule
     ORDER BY day_of_week ASC`
  );

  const [exceptions] = await db.query(
    `SELECT id, date, is_closed, open_time, close_time, note
     FROM store_schedule_exceptions
     ORDER BY date DESC`
  );

  res.json({ weekly, exceptions });
});

// Upsert one day (admin)
router.put("/schedule/weekly/:day", async (req, res) => {
  const day = Number(req.params.day); // 0..6
  const { is_closed, open_time, close_time } = req.body || {};

  if (!(day >= 0 && day <= 6)) return res.status(400).json({ error: "Invalid day" });

  // If closed, force times null
  const closed = !!is_closed;
  const open = closed ? null : (open_time || null);
  const close = closed ? null : (close_time || null);

  // await db.query(
  //   `INSERT INTO store_schedule (day_of_week, is_closed, open_time, close_time)
  //    VALUES (?, ?, ?, ?)
  //    ON DUPLICATE KEY UPDATE
  //      is_closed=VALUES(is_closed),
  //      open_time=VALUES(open_time),
  //      close_time=VALUES(close_time)`,
  //   [day, closed, open, close]
  // );

  await db.query(
  `INSERT INTO store_schedule (day_of_week, is_closed, open_time, close_time)
   VALUES (?, ?, ?, ?)
   AS new
   ON DUPLICATE KEY UPDATE
     is_closed = new.is_closed,
     open_time = new.open_time,
     close_time = new.close_time`,
  [day, closed, open, close]
);


  res.json({ ok: true });
});

// Create/update an exception by date (admin)
router.put("/schedule/exceptions", async (req, res) => {
  const { date, is_closed, open_time, close_time, note } = req.body || {};
  if (!date) return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });

  const closed = !!is_closed;
  const open = closed ? null : (open_time || null);
  const close = closed ? null : (close_time || null);

  // await db.query(
  //   `INSERT INTO store_schedule_exceptions (date, is_closed, open_time, close_time, note)
  //    VALUES (?, ?, ?, ?, ?)
  //    ON DUPLICATE KEY UPDATE
  //      is_closed=VALUES(is_closed),
  //      open_time=VALUES(open_time),
  //      close_time=VALUES(close_time),
  //      note=VALUES(note)`,
  //   [date, closed, open, close, note || null]
  // );
  
  await db.query(
  `INSERT INTO store_schedule_exceptions (date, is_closed, open_time, close_time, note)
   VALUES (?, ?, ?, ?, ?)
   AS new
   ON DUPLICATE KEY UPDATE
     is_closed = new.is_closed,
     open_time = new.open_time,
     close_time = new.close_time,
     note = new.note`,
  [date, closed, open, close, note || null]
);

  

  res.json({ ok: true });
});

// Delete exception (admin)
router.delete("/schedule/exceptions/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.query(`DELETE FROM store_schedule_exceptions WHERE id=?`, [id]);
  res.json({ ok: true });
});


module.exports = router;
