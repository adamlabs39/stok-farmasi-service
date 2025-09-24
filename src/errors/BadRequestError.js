import ResponseError from "./ResponseError.js";


class BadRequestError extends ResponseError {
 
  constructor(message) {
    super(400, message);
  }
}

export default BadRequestError;
