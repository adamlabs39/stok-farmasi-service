import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { logger } from "../configurations/index.js";
import ResponseError from "../errors/ResponseError.js";
import NotFoundError from "../errors/NotFoundError.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err);

  if (err.message && err.message.toLowerCase().includes("authorization")) {
    return res.status(401).json({
      status: "error",
      message:
        "Header Authorization dengan Bearer Token tidak ditemukan atau formatnya salah.",
    });
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    let message = "Token tidak valid, silakan login kembali.";

    if (err instanceof TokenExpiredError) {
      message = "Token sudah kedaluwarsa, silakan login kembali.";
    }

    return res.status(401).json({
      status: "error",
      message: message,
    });
  }

  if (err instanceof NotFoundError || err.statusCode === 404) {
    return res.status(404).json({
      status: "error",
      message: err.message || "Data tidak ditemukan",
    });
  }

  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
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

  return res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server.",
  });
};

export default errorMiddleware;
