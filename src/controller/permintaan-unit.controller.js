import PermintaanUnitService from "../services/permintaan-unit.service.js";
import successResponse from "../responses/success-response.js";
export default class PermintaanUnitController {
  static async getAllPermintaanUnit(req, res, next) {
    try {
      const faskes_uuid = req.author.faskesUuid;
      const result = await PermintaanUnitService.getAllPermintaanUnit(
        req.query,
        faskes_uuid
      );
      
      res.status(200).json({
        message: "List of permintaan unit",
        payload: result.data,
        properties: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPermintaanUnitByUuid(req, res, next) {
    try {
      const { uuid } = req.params;
      const faskes_uuid = req.author.faskesUuid;
      const result = await PermintaanUnitService.getPermintaanUnitByUuid(
        uuid,
        faskes_uuid
      );
      res.status(200).json({
        message: "Detail permintaan unit",
        payload: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPermintaanUnit(req, res, next) {
    try {
      await PermintaanUnitService.createPermintaanUnit(req);

      res.status(201).json(successResponse("Permintaan unit berhasil dibuat"));
    } catch (error) {
      next(error);
    }
  }

  static async searchitem(req, res, next) {
    try {
      const faskes_uuid = req.author.faskesUuid;
      const result = await PermintaanUnitService.searchitem(
        req.query,
        faskes_uuid
      );
      res.status(200).json({
        message: "List of item",
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatusPenerimaan(req, res, next) {
    try {
      const { uuid } = req.params;
      const faskesUuid = req.author.faskesUuid;
      // const reqData = req.body;
      await PermintaanUnitService.updateStatusPenerimaan(
        uuid,
        faskesUuid,
        req
      );
      res
        .status(200)
        .json(successResponse("Berhasil mengubah status permintaan unit"));
    } catch (error) {
      next(error);
    }
  }
}
