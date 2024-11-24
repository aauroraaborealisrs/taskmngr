import express from "express";
import pool, { testConnection } from "./db.js";
import authRoutes from "./auth.js";
import cors from "cors";
import UpdateRoutes from "./updateAccount.js";
import teamRoutes from "./routes/teamRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";

const app = express();

// Настройка CORS для localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000", // Разрешить только запросы с localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"], // Разрешенные HTTP методы
    allowedHeaders: ["Content-Type", "Authorization"], // Разрешенные заголовки
  }),
);

app.get("/healthcheck", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "success", timestamp: result.rows[0].now });
  } catch (err) {
    // Add type assertion or type guard
    if (err instanceof Error) {
      res.status(500).json({ status: "error", message: err.message });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "An unknown error occurred" });
    }
  }
});

// Middleware
app.use(express.json()); // Для обработки JSON в теле запроса

// Роуты
app.use("/auth", authRoutes);
app.use("/update", UpdateRoutes);
app.use("/team", teamRoutes);
app.use("/users", usersRoutes);
app.use("/tasks", tasksRoutes);


const startServer = async () => {
  await testConnection(); // Проверить подключение при запуске сервера
  app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
  });
};

startServer();
