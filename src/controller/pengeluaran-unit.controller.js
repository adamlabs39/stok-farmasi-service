import successResponse from "../responses/success-response.js";
import PengeluaranUnitService from "../services/pengeluaran-unit.sevice.js";

export default class PengeluaranUnitController {
  static async createPengeluaranUnit(req, res, next) {
    try {
      await PengeluaranUnitService.createPengeluaranUnit(req);

      res.status(201).json(successResponse("Pengeluaran unit berhasil dibuat"));
    } catch (error) {
      next(error);
    }
  }

  static async searchItem(req, res, next) {
    try {
      const faskes_uuid = req.author.faskesUuid;
      const result = await PengeluaranUnitService.searchItem(
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

  static async getAllPengeluaranUnit(req, res, next) {
    try {
      const faskes_uuid = req.author.faskesUuid;
      const result = await PengeluaranUnitService.getAllPengeluaranUnit(
        req.query,
        faskes_uuid
      );
      res.status(200).json({
        message: "List of pengeluaran unit",
        payload: result.data,
        properties: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

 static async getPengeluaranUnitByUuid(req, res, next) {
     try {
       const { uuid } = req.params;
       const faskes_uuid = req.author.faskesUuid;
       const result = await PengeluaranUnitService.getPengeluaranUnitByUuid(
         uuid,
         faskes_uuid
       );
       res.status(200).json({
         message: "Detail pengeluaran unit",
         payload: result.data,
       });
     } catch (error) {
       next(error);
     }
   }
}