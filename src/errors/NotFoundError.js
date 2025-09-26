import ResponseError from "./ResponseError.js";

class NotFoundError extends ResponseError {
  constructor(message = "Data tidak ditemukan") {
    super(message, 404);
  }
}

export default NotFoundError;