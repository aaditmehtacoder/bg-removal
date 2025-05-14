import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import imageRouter from './routes/imageRoutes.js'
import paypalRoutes from "./routes/paypalRoutes.js";


// App Config
const PORT = process.env.PORT || 4000
const app = express()
await connectDB()

// Initalize Middlewares
app.use(express.json())
app.use(cors())

// API routes
app.get("/", (req, res) => res.send("API Working"))
app.use("/api/user", userRouter)
app.use("/api/image", imageRouter)
app.use("/api/paypal", paypalRoutes);

app.listen(PORT, () => console.log("Server Running on port " + PORT))