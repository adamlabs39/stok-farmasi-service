import ResponseError from "./ResponseError.js";


class NotFoundError extends ResponseError {

  constructor(message) {
    super(404, message);
  }
}

export default NotFoundError;
