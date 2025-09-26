import { LokasiStokModel } from "@adameds/model-sdk/farmasi";
import {
  PermintaanUnitItemModel,
  PermintaanUnitModel,
} from "@adameds/model-sdk/inventory";
import { Op } from "sequelize";

export default class PermintaanUnitRepository {
  static get _baseOptions() {
    return {
      attributes: {
        exclude: [
          "id",
          "faskes_uuid",
          "created_at",
          "updated_at",
          "deleted_at",
        ],
      },
      include: [
        {
          model: PermintaanUnitItemModel,
          as: "items",
          separate: true,
          attributes: {
            exclude: [
              "id",
              "faskes_uuid",
              "created_at",
              "updated_at",
              "deleted_at",
            ],
          },
        },
        {
          model: LokasiStokModel,
          as: "lokasi_stok_tujuan",
          attributes: ["uuid", "name"],
        },
      ],
    };
  }

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

  static async getAllPermintaanUnit(query, faskesUuid) {
    const whereClause = { faskes_uuid: faskesUuid };
    if (query.no_permintaan) {
      whereClause.no_permintaan = { [Op.iLike]: `%${query.no_permintaan}%` };
    }

     const includeClause = [...this._baseOptions.include]; 
     const lokasiTujuanInclude = includeClause.find(
       (inc) => inc.as === "lokasi_stok_tujuan"
     );

     if (query.nama_lokasi_tujuan && lokasiTujuanInclude) {
       lokasiTujuanInclude.where = {
         name: { [Op.iLike]: `%${query.nama_lokasi_tujuan}%` },
       };
       lokasiTujuanInclude.required = true; 
     }


    return PermintaanUnitModel.findAll({
      where: whereClause,
      ...this._baseOptions,
      include: includeClause,
      order: [["tanggal_permintaan", "DESC"]],
    });
  }
}
