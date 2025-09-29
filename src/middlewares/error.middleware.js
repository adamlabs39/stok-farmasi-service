import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { logger } from "../configurations/index.js";
import ResponseError from "../errors/ResponseError.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    const message =
      err instanceof TokenExpiredError
        ? "Token sudah kedaluwarsa, silakan login kembali."
        : "Token tidak valid, silakan login kembali.";
    return res.status(401).json({ status: "error", message });
  }

  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));
    return res.status(400).json({
      status: "error",
      message: "Data yang dikirim tidak valid.",
      errors: errorMessages,
    });
  }

  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server.",
  });
};

export default errorMiddleware;
