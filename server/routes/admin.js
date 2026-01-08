const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/** LOGIN */
router.post("/login", async (req, res) => {

  console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);


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

/** GET all products (admin view) */
router.get("/products", async (req, res) => {
  const [rows] = await db.query(
    `
    SELECT p.id, p.title, p.description, p.image_url, p.is_active,
           c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC
    `
  );
  res.json(rows);
});

/** Create product */
const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  image_url: z.string().url().optional().default(""),
  category_id: z.number().int(),
  is_active: z.boolean().optional().default(true),
});

router.post("/products", async (req, res) => {
  const data = productSchema.parse(req.body);

  const [result] = await db.query(
    `INSERT INTO products (title, description, image_url, category_id, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [data.title, data.description, data.image_url, data.category_id, data.is_active]
  );

  res.status(201).json({ id: result.insertId });
});

/** Update product */
router.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = productSchema.parse(req.body);

  await db.query(
    `UPDATE products
     SET title=?, description=?, image_url=?, category_id=?, is_active=?
     WHERE id=?`,
    [data.title, data.description, data.image_url, data.category_id, data.is_active, id]
  );

  res.json({ ok: true });
});

/** Soft delete (deactivate) product */
router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  await db.query(`UPDATE products SET is_active=FALSE WHERE id=?`, [id]);
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

module.exports = router;
