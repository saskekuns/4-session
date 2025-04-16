import { useNavigate } from "react-router-dom"

export default function CustomerPage() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Экран заказчика</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          columnGap: "10px",
          marginBottom: "1rem",
        }}
      >
        <button onClick={() => navigate("/orders")}>Заказы</button>
      </div>
      <br />

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
