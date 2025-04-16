import { useState, useEffect } from "react"

const workshops = [
  { ruName: "Заготовительный цех", engName: "procurement-shop" },
  { ruName: "Пекарный цех", engName: "bakery-shop" },
  { ruName: "Упаковочный цех", engName: "packaging-shop" },
  { ruName: "Цех монтажа тортов", engName: "cake-assembly-shop" },
  { ruName: "Цех оформления", engName: "design-shop" },
]
const icons = [
  { name: "Аптечка", src: "/icons/first-aid.png" },
  { name: "Выход", src: "/icons/exit.jpg" },
  { name: "Оборудование", src: "/icons/equipment.png" },
  { name: "Огнетушитель", src: "/icons/fire-extinguisher.png" },
]

export default function WorkshopLayout() {
  const [selectedWorkshop, setSelectedWorkshop] = useState(workshops[0].engName)
  const [placedIcons, setPlacedIcons] = useState([])
  const [, setDraggedIconIndex] = useState(null)
  const [rotation, setRotation] = useState(0)

  const [savedIcons, setSavedIcons] = useState([])
  const [savedRotation, setSavedRotation] = useState(0)

  const getImagePath = (workshop) => `/workshops/${workshop}.png`

  const handleDrop = (e) => {
    e.preventDefault()
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const iconName = e.dataTransfer.getData("iconName")
    const existingIndex = e.dataTransfer.getData("iconIndex")

    if (existingIndex) {
      // Перемещаем уже размещённую иконку
      const updated = [...placedIcons]
      updated[existingIndex] = { ...updated[existingIndex], x, y }
      setPlacedIcons(updated)
      setDraggedIconIndex(null)
    } else {
      // Добавляем новую с панели
      const icon = icons.find((i) => i.name === iconName)
      if (!icon) return
      setPlacedIcons([...placedIcons, { ...icon, x, y }])
    }
  }

  const handleDragStart = (e, iconName, index = null) => {
    e.dataTransfer.setData("iconName", iconName)
    if (index !== null) {
      e.dataTransfer.setData("iconIndex", index)
      setDraggedIconIndex(index)
    }
  }

  const handleIconClick = (e, index) => {
    if (e.altKey) {
      const updated = [...placedIcons]
      updated.splice(index, 1)
      setPlacedIcons(updated)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleSave = () => {
    // сохранить локально (для кнопки "Отменить")
    setSavedIcons([...placedIcons])
    setSavedRotation(rotation)

    // тут будет отправка на сервер
    const payload = {
      workshop: selectedWorkshop,
      rotation,
      icons: placedIcons,
    }

    console.log("Sending payload:", payload) // ← ВОТ СЮДА

    fetch(`http://localhost:3000/api/workshops/${selectedWorkshop}/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка при сохранении")
        alert("Схема сохранена!")
      })
      .catch((err) => alert("Ошибка: " + err.message))
  }

  const handleCancel = () => {
    setPlacedIcons([...savedIcons])
    setRotation(savedRotation)
  }

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/workshops/${selectedWorkshop}/layout`
        )
        if (!res.ok) throw new Error("Ошибка при загрузке")
        const data = await res.json()
        setPlacedIcons(data.icons)
        setSavedIcons(data.icons)
        setRotation(data.rotation)
        setSavedRotation(data.rotation)
      } catch (err) {
        console.log("Ошибка при загрузке схемы:", err.message)
        setPlacedIcons([])
        setSavedIcons([])
        setRotation(0)
        setSavedRotation(0)
      }
    }

    fetchLayout()
  }, [selectedWorkshop])

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Планировка цеха</h2>

      <label>
        Выберите цех:{" "}
        <select
          value={selectedWorkshop}
          onChange={(e) => {
            setSelectedWorkshop(e.target.value)
            setPlacedIcons([])
          }}
        >
          {workshops.map((w) => (
            <option key={w.engName} value={w.engName}>
              {w.ruName}
            </option>
          ))}
        </select>
      </label>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          marginBottom: "3rem",
        }}
      >
        <button onClick={handleRotate}>Повернуть</button>
        <button onClick={handleSave}>Сохранить</button>
        <button onClick={handleCancel}>Отменить</button>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          marginTop: "1rem",
          border: "1px solid #ccc",
          width: "100%",
          maxWidth: "600px", // максимальная ширина схемы
          aspectRatio: "5 / 4", // автоматически рассчитывает высоту
          position: "relative",
          backgroundImage: `url(${getImagePath(selectedWorkshop)})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s ease",
        }}
      >
        {placedIcons.map((icon, index) => (
          <img
            key={index}
            src={icon.src}
            alt={icon.name}
            draggable
            onDragStart={(e) => handleDragStart(e, icon.name, index)}
            onClick={(e) => handleIconClick(e, index)} // 🔧 добавлено
            style={{
              position: "absolute",
              top: icon.y - 16,
              left: icon.x - 16,
              width: "32px",
              height: "32px",
              cursor: "grab",
            }}
          />
        ))}
      </div>

      {/* 🔧 добавлено — панель значков */}
      <div style={{ marginTop: "3rem" }}>
        <strong>Панель значков:</strong>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          {icons.map((icon) => (
            <img
              key={icon.name}
              src={icon.src}
              alt={icon.name}
              draggable
              onDragStart={(e) => handleDragStart(e, icon.name)}
              style={{ width: "40px", height: "40px", cursor: "grab" }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
