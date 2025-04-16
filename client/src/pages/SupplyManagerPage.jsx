import { useNavigate } from "react-router-dom"

export default function SupplyManagerPage() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Экран менеджера по закупкам</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          columnGap: "10px",
          marginBottom: "1rem",
        }}
      >
        <button onClick={() => navigate("/ingredients")}>Ингредиенты</button>
        <button onClick={() => navigate("/decorations")}>Декорации</button>
        <button onClick={() => navigate("/orders")}>Заказы</button>
        <button onClick={() => navigate("/purchase-list")}>
          Список закупок
        </button>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("token")
          window.location.href = "/"
        }}
      >
        Выйти
      </button>
    </div>
  )
}
