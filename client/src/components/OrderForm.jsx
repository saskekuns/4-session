import React from "react"

export default function OrderForm({
  form,
  customers,
  userRole,
  description,
  dimensions,
  images,
  handleInputChange,
  setDescription,
  handleDimensionChange,
  addDimension,
  uploadImage,
  handleSubmit,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        rowGap: "1rem",
        marginBottom: "2rem",
      }}
    >
      <input
        type="number"
        name="price"
        placeholder="Стоимость"
        value={form.price}
        onChange={handleInputChange}
        required
      />
      <input
        type="date"
        name="planned_date"
        value={form.planned_date}
        onChange={handleInputChange}
        required
      />

      <input
        type="text"
        name="product_name"
        placeholder="Изделие"
        value={form.product_name}
        onChange={handleInputChange}
        required
      />
      <input
        type="number"
        name="quantity"
        min="1"
        value={form.quantity}
        onChange={handleInputChange}
        required
      />

      {userRole === "Менеджер по продажам" && (
        <select
          name="customer_login"
          value={form.customer_login || ""}
          onChange={handleInputChange}
          required
        >
          <option value="">Выберите заказчика</option>
          {Array.isArray(customers) &&
            customers.map((c) => (
              <option key={c.login} value={c.login}>
                {c.full_name} ({c.login})
              </option>
            ))}
        </select>
      )}

      <textarea
        placeholder="Описание изделия"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div>
        <h4>Размеры изделия</h4>
        {dimensions.map((dim, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}
          >
            <input
              type="text"
              value={dim.unit}
              onChange={(e) =>
                handleDimensionChange(idx, "unit", e.target.value)
              }
              placeholder="Ед. изм (например, см)"
            />
            <input
              type="number"
              value={dim.value}
              onChange={(e) =>
                handleDimensionChange(idx, "value", e.target.value)
              }
              placeholder="Значение"
            />
          </div>
        ))}
        <button type="button" onClick={addDimension}>
          Добавить размер
        </button>
      </div>

      <div>
        <h4>Изображения</h4>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0])}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={`http://localhost:3000/${src}`}
              alt="uploaded"
              width={80}
            />
          ))}
        </div>
      </div>

      <button type="submit">Добавить</button>
    </form>
  )
}
