import PermintaanUnitService from "../services/permintaan-unit.service.js";
import successResponse from "../responses/success-response.js";
export default class PermintaanUnitController {
  static async createPermintaanUnit(req, res, next) {
    try {
       const result = await PermintaanUnitService.createPermintaanUnit(req);
      res
        .status(201)
        .json(successResponse("Permintaan unit created successfully", result));
    } catch (error) {
      next(error);
    }
  }
}
