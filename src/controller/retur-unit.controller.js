import successResponse from "../responses/success-response.js";
import ReturUnitService from "../services/retur-unit.service.js";

export default class ReturUnitController {
  static async createReturUnit(req, res, next) {
    try {
      const token = req.headers.authorization;
      const author = req.author;
      const data = req.body;
      await ReturUnitService.createReturUnit(data, author, token);

      res.status(201).json(successResponse("Retur unit berhasil dibuat"));
    } catch (error) {
      next(error);
    }
  }

  static async getAllReturUnit(req, res, next) {
    try {
      const faskes_uuid = req.author.faskesUuid;
      const result = await ReturUnitService.getAllReturUnit(
        req.query,
        faskes_uuid
      );

      res.status(200).json({
        message: "List of Retur unit",
        payload: result.data,
        properties: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReturUnitByUuid(req, res, next) {
    try {
      const { uuid } = req.params;
      const faskes_uuid = req.author.faskesUuid;

      const result = await ReturUnitService.getReturUnitByUuid(
        uuid,
        faskes_uuid
      );
      res.status(200).json({
        message: "Detail retur unit",
        payload: result.data,
      });
    } catch (error) {
      next(error);
    }
  }
}
