import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface DecodedToken {
  id: string; // ID пользователя, который мы добавляем в токен при входе
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization; // Извлекаем заголовок Authorization
  console.log("Authorization header received:", authHeader);

  // Извлекаем токен из заголовка
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    // Пытаемся верифицировать токен
    console.log("Attempting to verify token...");
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log("Token verified successfully:", decoded);

    // Добавляем ID пользователя в тело запроса
    req.body.userId = decoded.id;
    console.log("User ID added to request body:", decoded.id);
    next();
  } catch (err) {
    console.error("Error during JWT verification:");
    console.error("Token causing error:", token);
    console.error("Error message:", (err as Error).message);

    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
