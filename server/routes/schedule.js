const express = require("express");
const db = require("../db");

const router = express.Router();

// GET weekly schedule + exceptions
router.get("/", async (req, res) => {
  const [weekly] = await db.query(
    `SELECT day_of_week, is_closed, open_time, close_time
     FROM store_schedule
     ORDER BY day_of_week ASC`
  );

  const [exceptions] = await db.query(
    `SELECT id, date, is_closed, open_time, close_time, note
     FROM store_schedule_exceptions
     ORDER BY date ASC`
  );

  res.json({ weekly, exceptions });
});

module.exports = router;
