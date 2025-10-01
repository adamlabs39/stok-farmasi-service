export default class PengeluaranUnitRepository {
  static async createPengeluaranUnit(data, transaction) {
    return PengeluaranUnitModel.create(data, {
      include: [{ model: PengeluaranUnitItemModel, as: "items" }],
      transaction,
    });
  }
}