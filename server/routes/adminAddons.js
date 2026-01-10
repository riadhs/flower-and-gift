const express = require("express");
const { z } = require("zod");
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();
router.use(adminAuth);

// -------- Addons --------
router.get("/addons", async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, title, description, image_url, is_active
     FROM addons
     ORDER BY id DESC`
  );
  res.json(rows);
});

router.get("/addons/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await db.query(
    `SELECT id, title, description, image_url, is_active
     FROM addons
     WHERE id=? LIMIT 1`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

const addonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  image_url: z.string().url().optional().default(""),
  is_active: z.boolean().optional().default(true),
});

router.post("/addons", async (req, res) => {
  const data = addonSchema.parse(req.body);
  const [result] = await db.query(
    `INSERT INTO addons (title, description, image_url, is_active)
     VALUES (?, ?, ?, ?)`,
    [data.title, data.description, data.image_url, data.is_active]
  );
  res.status(201).json({ id: result.insertId });
});

router.put("/addons/:id", async (req, res) => {
  const id = Number(req.params.id);
  const data = addonSchema.parse(req.body);

  await db.query(
    `UPDATE addons
     SET title=?, description=?, image_url=?, is_active=?
     WHERE id=?`,
    [data.title, data.description, data.image_url, data.is_active, id]
  );

  res.json({ ok: true });
});

// Soft delete (deactivate)
router.delete("/addons/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.query(`UPDATE addons SET is_active=FALSE WHERE id=?`, [id]);
  res.json({ ok: true });
});

// Hard delete
router.delete("/addons/:id/hard", async (req, res) => {
  const id = Number(req.params.id);
  await db.query(`DELETE FROM addons WHERE id=?`, [id]); // variants cascade
  res.json({ ok: true });
});

// -------- Addon Variants --------
const variantSchema = z.object({
  label: z.string().min(1),
  price_cents: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

router.get("/addons/:id/variants", async (req, res) => {
  const addonId = Number(req.params.id);
  const [rows] = await db.query(
    `SELECT id, addon_id, label, price_cents, sku, is_active
     FROM addon_variants
     WHERE addon_id=?
     ORDER BY price_cents ASC`,
    [addonId]
  );
  res.json(rows);
});

router.post("/addons/:id/variants", async (req, res) => {
  const addonId = Number(req.params.id);
  const data = variantSchema.parse(req.body);

  const [result] = await db.query(
    `INSERT INTO addon_variants (addon_id, label, price_cents, sku, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [addonId, data.label, data.price_cents, data.sku || null, data.is_active]
  );

  res.status(201).json({ id: result.insertId });
});

router.put("/addon-variants/:variantId", async (req, res) => {
  const variantId = Number(req.params.variantId);
  const data = variantSchema.parse(req.body);

  await db.query(
    `UPDATE addon_variants
     SET label=?, price_cents=?, sku=?, is_active=?
     WHERE id=?`,
    [data.label, data.price_cents, data.sku || null, data.is_active, variantId]
  );

  res.json({ ok: true });
});

router.delete("/addon-variants/:variantId", async (req, res) => {
  const variantId = Number(req.params.variantId);
  await db.query(`DELETE FROM addon_variants WHERE id=?`, [variantId]);
  res.json({ ok: true });
});

module.exports = router;
