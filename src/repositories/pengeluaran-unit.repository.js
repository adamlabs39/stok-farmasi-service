import {
  ConversionModel,
  ItemMedisModel,
  JenisStokModel,
  LokasiStokModel,
} from "@adameds/model-sdk/farmasi";
import {
  PengeluaranUnitItemModel,
  PengeluaranUnitModel,
  StockMedisModel,
} from "@adameds/model-sdk/inventory";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination.helper.js";

export default class PengeluaranUnitRepository {
  static get _baseOptions() {
    return {
      attributes: { exclude: ["id", "created_at", "updated_at", "deleted_at"] },
      include: [
        {
          model: PengeluaranUnitItemModel,
          as: "items",
          separate: true,
          attributes: {
            exclude: ["id", "created_at", "updated_at", "deleted_at"],
          },
          include: [
            { model: StockMedisModel, as: "stok" },
            { model: ConversionModel, as: "konversi" },
          ],
        },
        {
          model: LokasiStokModel,
          as: "lokasi_stok_akhir",
          attributes: ["uuid", "name"],
        },
        {
          model: JenisStokModel,
          as: "jenis_stok",
          attributes: ["uuid", "name"],
        },
      ],
    };
  }

  static async createPengeluaranUnit(data, transaction) {
    return PengeluaranUnitModel.create(data, {
      include: [{ model: PengeluaranUnitItemModel, as: "items" }],
      transaction,
    });
  }

  static async searchItem(query, faskesUuid) {
    const whereClause = { faskes_uuid: faskesUuid };
    if (query.q) {
      whereClause[Op.or] = [
        { code: { [Op.iLike]: `%${query.q}%` } },
        { name: { [Op.iLike]: `%${query.q}%` } },
      ];
    }
    return ItemMedisModel.findAll({
      where: whereClause,
      attributes: ["code", "name"],
    });
  }

  static async getAllPengeluaranUnit(query, faskesUuid) {
    const whereClause = { faskes_uuid: faskesUuid };
    if (query.no_pengeluaran) {
      whereClause.no_pengeluaran = { [Op.iLike]: `%${query.no_pengeluaran}%` };
    }
    const { limit, offset, page, pageSize } = getPagination(query);

    const result = await PengeluaranUnitModel.findAndCountAll({
      where: whereClause,
      ...this._baseOptions,
      order: [["tanggal_pengeluaran", "DESC"]],
      limit,
      offset,
    });

    return getPagingData(result, page, pageSize);
  }

  static async getPengeluaranUnitByUuid(uuid, faskesUuid) {
    return PengeluaranUnitModel.findOne({
      where: { uuid, faskes_uuid: faskesUuid },
      ...this._baseOptions,
    });
  }
}
