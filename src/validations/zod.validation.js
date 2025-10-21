
export default class ZodValidator {

  static validate(schema, objectToValidate) {
    return schema.parse(objectToValidate);
  }
}
