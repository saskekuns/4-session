// controllers/orderController.js
import pool from "../db.js"

// ===== Вспомогательная функция =====
export async function generateOrderNumber(customerLogin) {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, "0")
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const yyyy = now.getFullYear()
  const dateStr = now.toISOString().slice(0, 10)

  const userRes = await pool.query(
    `SELECT full_name FROM appuser WHERE login = $1`,
    [customerLogin]
  )

  const fullName = userRes.rows[0]?.full_name || ""
  const parts = fullName.trim().split(/\s+/)
  const F = (parts[0]?.[0] || "_").toUpperCase()
  const I = (parts[1]?.[0] || "_").toUpperCase()

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM orders WHERE order_date = $1`,
    [dateStr]
  )
  const number = String((parseInt(countRes.rows[0].count) || 0) + 1).padStart(
    2,
    "0"
  )
  return `${dd}${mm}${yyyy}${F}${I}${number}`
}

// ===== POST /api/orders =====
export async function createOrder(req, res) {
  const {
    product_name,
    quantity,
    price,
    planned_date,
    description,
    dimensions, // JSON-массив с размерами
    images, // массив путей к изображениям
    customer_login: rawCustomerLogin, // нужен только для менеджера
  } = req.body

  const user = req.user
  const isManager = user.role === "Менеджер по продажам"
  const isCustomer = user.role === "Заказчик"

  const order_date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  try {
    const customer_login = isManager ? rawCustomerLogin : user.login
    let manager_login = null

    if (isManager) {
      manager_login = user.login
    } else if (isCustomer) {
      // Получаем всех менеджеров по продажам
      const managerRes = await pool.query(
        `SELECT login FROM appuser WHERE role = 'Менеджер по продажам'`
      )
      const managers = managerRes.rows

      if (managers.length === 0) {
        return res.status(500).json({ error: "Нет доступных менеджеров" })
      }

      // Выбираем случайного менеджера
      const randomIndex = Math.floor(Math.random() * managers.length)
      manager_login = managers[randomIndex].login
    }

    const status = isManager ? "составление спецификации" : "новый"
    const number = await generateOrderNumber(customer_login)

    const result = await pool.query(
      `INSERT INTO orders (
          number, order_date, product_name, quantity,
          manager_login, customer_login, status, price,
          planned_date, description, dimensions, images
        ) VALUES (
          $1,$2,$3,$4,
          $5,$6,$7,$8,
          $9,$10,$11,$12
        ) RETURNING *`,
      [
        number,
        order_date,
        product_name,
        quantity,
        manager_login,
        customer_login,
        status,
        price,
        planned_date,
        description,
        JSON.stringify(dimensions),
        JSON.stringify(images),
      ]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error("Ошибка при создании заказа:", err)
    res.status(500).json({ error: "Ошибка при создании заказа" })
  }
}

// ===== GET /api/orders =====
export async function getOrders(req, res) {
  try {
    const user = req.user

    let query = `
        SELECT 
          id,
          order_date,
          product_name,
          quantity,
          manager_login,
          status,
          price,
          customer_login,
          planned_date,
          created_at,
          description,
          dimensions,
          images
        FROM orders
      `

    const params = []

    // Фильтрация по роли
    if (user.role === "Заказчик") {
      query += ` WHERE customer_login = $1`
      params.push(user.login)
    } else if (user.role === "Менеджер по продажам") {
      query += ` WHERE manager_login = $1`
      params.push(user.login)
    } else if (user.role === "Менеджер по закупкам") {
      query += ` WHERE status = 'закупка'`
    } else if (user.role === "Мастер") {
      query += ` WHERE status IN ('производство', 'контроль')`
    }

    query += ` ORDER BY created_at DESC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении заказов:", err)
    res.status(500).json({ error: "Ошибка при получении заказов" })
  }
}

// ===== Вспомогательная функция =====
async function checkQualityPassed(orderId) {
  const query = `
    SELECT COUNT(*) FROM quality_checks
    WHERE order_id = $1 AND result = false
  `
  const { rows } = await pool.query(query, [orderId])
  return Number(rows[0].count) === 0
}

// ===== PATCH /api/orders/:id/status =====
export async function updateStatus(req, res) {
  const { id } = req.params
  const { status } = req.body
  const user = req.user

  try {
    // Получаем старый статус
    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      id,
    ])
    if (orderRes.rowCount === 0)
      return res.status(404).json({ error: "Заказ не найден" })

    const order = orderRes.rows[0]
    const oldStatus = order.status

    // Проверка прав на изменение
    if (user.role === "Менеджер по продажам") {
      if (order.manager_login !== user.login) {
        return res
          .status(403)
          .json({ error: "Можно менять только свои заказы" })
      }

      const allowed = [
        ["новый", "составление спецификации"],
        ["новый", "отменён"],
        ["новый", "в работе"],
        ["составление спецификации", "подтверждение"],
        ["подтверждение", "отменён"],
        ["подтверждение", "закупка"],
        ["готово", "выполнен"],
      ]
      const isAllowed = allowed.some(
        ([from, to]) => from === oldStatus && to === status
      )
      if (!isAllowed)
        return res.status(403).json({ error: "Недопустимый переход статуса" })
    } else if (user.role === "Менеджер по закупкам") {
      if (!(oldStatus === "закупка" && status === "производство")) {
        return res.status(403).json({ error: "Недопустимый переход статуса" })
      }
    } else if (user.role === "Мастер") {
      const allowed = [
        ["производство", "контроль"],
        ["контроль", "готово"],
      ]
      const isAllowed = allowed.some(
        ([from, to]) => from === oldStatus && to === status
      )
      if (!isAllowed)
        return res.status(403).json({ error: "Недопустимый переход статуса" })
    } else if (user.role === "Директор") {
      return res.status(403).json({ error: "Директор не может менять статусы" })
    } else {
      return res.status(403).json({ error: "Нет прав на изменение статуса" })
    }

    // Списание материалов
    if (oldStatus === "закупка" && status === "производство") {
      try {
        await writeOffMaterials(order)
      } catch (err) {
        console.error("Ошибка при списании материалов:", err.message)
        return res.status(400).json({ error: err.message }) // ВОЗВРАТ ОШИБКИ
      }
    }

    // Проверка наличия отрицательных оценок при статусе "контроль" → "готово"
    if (user.role === "Мастер" && status === "готово") {
      const passed = await checkQualityPassed(id)
      if (!passed) {
        return res.status(400).json({
          error:
            "Нельзя завершить контроль: есть параметры с отрицательной оценкой.",
        })
      }
    }

    // Обновляем заказ
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    )

    // Записываем в историю
    await pool.query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
         VALUES ($1, $2, $3, $4)`,
      [id, oldStatus, status, user.login]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error("Ошибка при обновлении статуса:", err)
    res.status(500).json({ error: "Ошибка при обновлении статуса" })
  }
}

// ===== GET /api/orders/:id/history =====
export async function getHistory(req, res) {
  const { id } = req.params

  try {
    const result = await pool.query(
      `SELECT old_status, new_status, changed_by, changed_at
         FROM order_status_history
         WHERE order_id = $1
         ORDER BY changed_at ASC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении истории статусов:", err)
    res.status(500).json({ error: "Ошибка при получении истории статусов" })
  }
}

// ===== DELETE /api/orders/:id =====
export async function deleteOrder(req, res) {
  const { id } = req.params
  const user = req.user

  try {
    const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ])
    const order = orderRes.rows[0]

    if (!order) return res.status(404).json({ error: "Заказ не найден" })
    if (order.status !== "новый")
      return res.status(403).json({
        error: "Удаление возможно только для заказов со статусом 'новый'",
      })

    const isManager =
      user.role === "Менеджер по продажам" && user.login === order.manager_login
    const isCustomer =
      user.role === "Заказчик" && user.login === order.customer_login

    if (!isManager && !isCustomer)
      return res
        .status(403)
        .json({ error: "Нет прав на удаление этого заказа" })

    await pool.query("DELETE FROM orders WHERE id = $1", [id])
    res.json({ success: true })
  } catch (err) {
    console.error("Ошибка при удалении заказа:", err)
    res.status(500).json({ error: "Ошибка при удалении заказа" })
  }
}

// ===== PATCH /api/orders/:id =====
export async function editOrder(req, res) {
  const { id } = req.params
  const {
    product_name,
    quantity,
    price,
    planned_date,
    description,
    dimensions,
    images,
  } = req.body

  const user = req.user

  try {
    const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ])
    const order = orderRes.rows[0]

    if (!order) return res.status(404).json({ error: "Заказ не найден" })
    if (order.status !== "новый")
      return res.status(403).json({
        error: "Редактирование возможно только для заказов со статусом 'новый'",
      })

    const isManager =
      user.role === "Менеджер по продажам" && user.login === order.manager_login
    const isCustomer =
      user.role === "Заказчик" && user.login === order.customer_login

    if (!isManager && !isCustomer)
      return res
        .status(403)
        .json({ error: "Нет прав на редактирование этого заказа" })

    const result = await pool.query(
      `UPDATE orders
         SET product_name = $1,
             quantity = $2,
             price = $3,
             planned_date = $4,
             description = $5,
             dimensions = $6,
             images = $7
         WHERE id = $8
         RETURNING *`,
      [
        product_name,
        quantity,
        price,
        planned_date,
        description,
        JSON.stringify(dimensions),
        JSON.stringify(images),
        id,
      ]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error("Ошибка при редактировании заказа:", err)
    res.status(500).json({ error: "Ошибка при редактировании заказа" })
  }
}

// ===== GET /api/orders/purchase-list =====
export async function getPurchaseList(req, res) {
  const user = req.user
  if (user.role !== "Менеджер по закупкам") {
    return res.status(403).json({ error: "Нет доступа" })
  }

  try {
    // Получаем все заказы со статусом "закупка"
    const ordersRes = await pool.query(
      `SELECT product_name, quantity FROM orders WHERE status = 'закупка'`
    )
    const orders = ordersRes.rows

    const ingredientMap = new Map()
    const decorationMap = new Map()

    for (const order of orders) {
      const { product_name, quantity: orderQty } = order

      // ==== ИНГРЕДИЕНТЫ ====
      const ingRes = await pool.query(
        `SELECT si.ingredient_article, si.quantity, i.name, i.quantity AS available
           FROM spec_ingredient si
           JOIN ingredient i ON si.ingredient_article = i.article
           WHERE si.product_name = $1`,
        [product_name]
      )

      for (const item of ingRes.rows) {
        const key = item.ingredient_article
        const totalRequired = parseFloat(item.quantity) * orderQty

        if (ingredientMap.has(key)) {
          ingredientMap.get(key).required += totalRequired
        } else {
          ingredientMap.set(key, {
            type: "ingredient",
            article: key,
            name: item.name,
            required: totalRequired,
            available: parseFloat(item.available),
          })
        }
      }

      // ==== УКРАШЕНИЯ ====
      const decRes = await pool.query(
        `SELECT sd.decoration_article, sd.quantity, d.name, d.quantity AS available
           FROM spec_decoration sd
           JOIN decoration d ON sd.decoration_article = d.article
           WHERE sd.product_name = $1`,
        [product_name]
      )

      for (const item of decRes.rows) {
        const key = item.decoration_article
        const totalRequired = parseFloat(item.quantity) * orderQty

        if (decorationMap.has(key)) {
          decorationMap.get(key).required += totalRequired
        } else {
          decorationMap.set(key, {
            type: "decoration",
            article: key,
            name: item.name,
            required: totalRequired,
            available: parseFloat(item.available),
          })
        }
      }
    }

    // Объединяем всё в массив и отправляем
    const result = [...ingredientMap.values(), ...decorationMap.values()].sort(
      (a, b) => a.type.localeCompare(b.type)
    )

    res.json(result)
  } catch (err) {
    console.error("Ошибка при расчёте списка закупок:", err)
    res.status(500).json({ error: "Ошибка при расчёте списка закупок" })
  }
}

// ===== Списание материалов =====
export async function writeOffMaterials(order) {
  const { product_name, quantity: orderQuantity } = order

  console.log(
    `Проверка остатков и списание для заказа "${product_name}" x${orderQuantity}`
  )

  try {
    const errors = []

    // ===== 1. Проверка ингредиентов =====
    const ingRes = await pool.query(
      `SELECT si.ingredient_article, si.quantity, i.name, i.quantity AS available
         FROM spec_ingredient si
         JOIN ingredient i ON si.ingredient_article = i.article
         WHERE si.product_name = $1`,
      [product_name]
    )

    for (const item of ingRes.rows) {
      const totalRequired = parseFloat(item.quantity) * orderQuantity
      const available = parseFloat(item.available)

      if (available < totalRequired) {
        errors.push(
          `Недостаточно ингредиента "${item.name}" (${item.ingredient_article}): требуется ${totalRequired}, в наличии ${available}`
        )
      }
    }

    // ===== 2. Проверка украшений =====
    const decRes = await pool.query(
      `SELECT sd.decoration_article, sd.quantity, d.name, d.quantity AS available
         FROM spec_decoration sd
         JOIN decoration d ON sd.decoration_article = d.article
         WHERE sd.product_name = $1`,
      [product_name]
    )

    for (const item of decRes.rows) {
      const totalRequired = parseFloat(item.quantity) * orderQuantity
      const available = parseFloat(item.available)

      if (available < totalRequired) {
        errors.push(
          `Недостаточно украшения "${item.name}" (${item.decoration_article}): требуется ${totalRequired}, в наличии ${available}`
        )
      }
    }

    if (errors.length > 0) {
      throw new Error("Недостаточно материалов:\n" + errors.join("\n"))
    }

    // ===== 3. Списание ингредиентов =====
    for (const item of ingRes.rows) {
      const totalQty = parseFloat(item.quantity) * orderQuantity

      await pool.query(
        `UPDATE ingredient SET quantity = quantity - $1 WHERE article = $2`,
        [totalQty, item.ingredient_article]
      )

      console.log(
        `Списано ${totalQty} ед. ингредиента ${item.ingredient_article}`
      )
    }

    // ===== 4. Списание украшений =====
    for (const item of decRes.rows) {
      const totalQty = parseFloat(item.quantity) * orderQuantity

      await pool.query(
        `UPDATE decoration SET quantity = quantity - $1 WHERE article = $2`,
        [totalQty, item.decoration_article]
      )

      console.log(
        `Списано ${totalQty} ед. украшения ${item.decoration_article}`
      )
    }

    console.log("Списание выполнено успешно.")
  } catch (err) {
    console.error("Ошибка при списании материалов:", err)
    throw err
  }
}
