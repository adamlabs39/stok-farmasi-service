
export default class ZodValidator {

  static validate(schema, objectToValidate) {
   console.log('Validating object:', objectToValidate);
    return schema.parse(objectToValidate);
  }
}
