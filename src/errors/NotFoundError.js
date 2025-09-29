import ResponseError from "./ResponseError.js";

export default class NotFoundError extends ResponseError {
  constructor(message = "Data tidak ditemukan") {
    // Panggil constructor parent dengan status code 404
    super(message, 404);
  }
}
