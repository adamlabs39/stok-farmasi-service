import {
  PermintaanUnitItemModel,
  PermintaanUnitModel,
} from "@adameds/model-sdk/inventory";

export default class PermintaanUnitRepository {
  static async createPermintaanUnit(data, transaction) {
    return PermintaanUnitModel.create(data, {
      include: [
        {
          model: PermintaanUnitItemModel,
          as: "items",
        },
      ],
      transaction,
    });
  }
}
