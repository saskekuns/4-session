await pool.query(
  `INSERT INTO decoration (
    article, name, unit, quantity, type, price, weight
  ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (article) DO NOTHING`,
  [
    article,
    name,
    unit || "шт.",
    parseFloat(quantity) || 0,
    type || "Неизвестно",
    parseFloat(price) || 0,
    weight !== undefined ? parseFloat(weight) : null,
  ]
)
