import { useState } from "react"

export function useOrderForm({ userRole, onSuccess }) {
  const [form, setForm] = useState({
    product_name: "",
    quantity: 1,
    price: "",
    planned_date: "",
    customer_login: "",
  })

  const [description, setDescription] = useState("")
  const [dimensions, setDimensions] = useState([{ unit: "см", value: "" }])
  const [images, setImages] = useState([])

  const [editMode, setEditMode] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDimensionChange = (index, field, value) => {
    const updated = [...dimensions]
    updated[index][field] = value
    setDimensions(updated)
  }

  const addDimension = () => {
    setDimensions([...dimensions, { unit: "см", value: "" }])
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append("image", file)

    const res = await fetch("http://localhost:3000/api/uploads", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    setImages((prev) => [...prev, data.path])
  }

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")

    const payload = {
      ...form,
      customer_login:
        userRole === "Менеджер по продажам" ? form.customer_login : user.login,
      description,
      dimensions,
      images,
    }

    try {
      const url = editMode
        ? `http://localhost:3000/api/orders/${editingOrderId}`
        : "http://localhost:3000/api/orders"

      const method = editMode ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()

      resetForm()
      onSuccess()
    } catch {
      alert(
        editMode
          ? "Ошибка при редактировании заказа"
          : "Ошибка при добавлении заказа"
      )
    }
  }

  const resetForm = () => {
    setForm({
      product_name: "",
      quantity: 1,
      price: "",
      planned_date: "",
      customer_login: "",
    })
    setDescription("")
    setDimensions([{ unit: "см", value: "" }])
    setImages([])
    setEditMode(false)
    setEditingOrderId(null)
  }

  const startEditOrder = (order) => {
    setForm({
      product_name: order.product_name,
      quantity: order.quantity,
      price: order.price,
      planned_date: order.planned_date,
      customer_login: order.customer_login,
    })
    setDescription(order.description || "")
    setDimensions(order.dimensions || [{ unit: "см", value: "" }])
    setImages(order.images || [])
    setEditingOrderId(order.id)
    setEditMode(true)
  }

  return {
    form,
    description,
    dimensions,
    images,
    editMode,
    handleInputChange,
    handleDimensionChange,
    addDimension,
    uploadImage,
    handleSubmit,
    startEditOrder,
    setDescription,
  }
}
