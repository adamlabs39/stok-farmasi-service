import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { logger } from "../configurations/index.js";
import ResponseError from "../errors/ResponseError.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err);

  if (err.isAxiosError && err.response) {
    return res.status(err.response.status).json({
      status: "error",
      message: "Terjadi kesalahan saat berkomunikasi dengan layanan lain.",
      details: err.response.data,
    });
  }

  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    let message = "Token tidak valid.";
    if (err instanceof TokenExpiredError) {
      message = "Token sudah kedaluwarsa.";
    }
    return res.status(401).json({
      status: "error",
      message: message,
    });
  }

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));
    return res.status(400).json({
      status: "error",
      message: "Data yang dikirim tidak valid.",
      errors: errorMessages,
    });
  }

  // --- Fallback untuk error yang tidak terduga ---
  return res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server.",
  });
};

export default errorMiddleware;
