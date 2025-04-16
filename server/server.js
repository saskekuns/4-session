import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Our imports
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import toolRoutes from "./routes/tool.js"
import ingredientRoutes from "./routes/ingredient.js"
import decorationRoutes from "./routes/decoration.js"
import workshopRoutes from "./routes/workshop.js"
import ordersRoutes from "./routes/orders.js"
import uploadRoutes from "./routes/uploads.js"
import failureRoutes from "./routes/failure.js"
import equipmentRoutes from "./routes/equipment.js"
import qualityRoutes from "./routes/quality.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/tools", toolRoutes)
app.use("/api/ingredients", ingredientRoutes)
app.use("/api/decorations", decorationRoutes)
app.use("/api/workshops", workshopRoutes)
app.use("/api/orders", ordersRoutes)
app.use("/api/uploads", uploadRoutes)
app.use("/uploads", express.static("uploads")) // чтобы картинки можно было просматривать
app.use("/api/failure", failureRoutes)
app.use("/api/equipment", equipmentRoutes)
app.use("/api/quality", qualityRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
