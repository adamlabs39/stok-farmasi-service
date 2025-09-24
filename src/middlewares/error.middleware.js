import { ZodError } from "zod";
import { logger } from "../configurations/index.js";
import ResponseError from "../errors/ResponseError.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
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

  return res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan pada server.",
  });
};

export default errorMiddleware;
