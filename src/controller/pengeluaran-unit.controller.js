import PengeluaranUnitService from "../services/pengeluaran-unit.sevice";

export default class PengeluaranUnitController {
  static async createPengeluaranUnit(req, res, next) {
    try {
      await PengeluaranUnitService.createPengeluaranUnit(req);

      res.status(201).json(successResponse("Pengeluaran unit berhasil dibuat"));
    } catch (error) {
      next(error);
    }
  }
}