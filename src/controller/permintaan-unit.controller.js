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

  static async getAllPermintaanUnit(req, res, next){
    try {
      const faskes_uuid = req.author.faskesUuid;
      const result = await PermintaanUnitService.getAllPermintaanUnit(
        req.query,
        faskes_uuid
      );
       res.status(200).json({
         message: "List of permintaan unit",
         payload: result.data,
         pagination: result.pagination,
       });
    } catch (error) {
      next(error);
    }
  }

  static async cancelPermintaanUnit(req, res, next) {
    try {
      const { uuid } = req.params;
      const faskesUuid = req.author.faskesUuid;
      const reqData = req.body;
      await PermintaanUnitService.cancelPermintaanUnit(uuid, faskesUuid, reqData);
      res
        .status(200)
        .json(successResponse("Permintaan unit berhasil dibatalkan"));
    } catch (error) {
      next(error);
    }
  }

}
