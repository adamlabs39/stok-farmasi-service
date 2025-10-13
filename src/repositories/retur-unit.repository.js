import {
  ReturUnitItemModel,
  ReturUnitModel,
} from "@adameds/model-sdk/inventory";
import { getPagination, getPagingData } from "../helpers/pagination.helper.js";
import { Op } from "sequelize";
import { ItemMedisModel, LokasiStokModel } from "@adameds/model-sdk/farmasi";

export default class ReturUnitRepository {
  static get _baseOptions() {
    return {
      attributes: { exclude: ["id", "created_at", "updated_at", "deleted_at"] },
      include: [
        {
          model: LokasiStokModel,
          as: "lokasi_stok_awal",
          attributes: ["uuid", "name"],
        },
        {
          model: LokasiStokModel,
          as: "lokasi_stok_tujuan",
          attributes: ["uuid", "name"],
        },
        {
          model: ReturUnitItemModel,
          as: "items",
          separate: true,
          attributes: {
            exclude: ["id", "created_at", "updated_at", "deleted_at"],
          },
          include: [
            {
              model: ItemMedisModel,
              as: "item",
              attributes: ["uuid", "name", "code"],
            },
          ],
        },
      ],
    };
  }

  static async findReturItemsByUuids(itemUuids) {
    return await ReturUnitItemModel.findAll({
      where: {
        uuid: { [Op.in]: itemUuids },
      },
    });
  }

  static async createReturUnit(data, transaction) {
    return ReturUnitModel.create(data, {
      include: [{ model: ReturUnitItemModel, as: "items" }],
      transaction,
    });
  }

  static async getAllReturUnit(query, faskesUuid) {
    const { limit, offset, page, pageSize } = getPagination(query);

    const queryOptions = { ...this._baseOptions };
    queryOptions.include = this._baseOptions.include.map((inc) => ({
      ...inc,
    }));

    const whereClause = { faskes_uuid: faskesUuid };

    if (query.no_retur) {
      whereClause.no_retur = { [Op.iLike]: `%${query.no_retur}%` };
    }

    if (query.tujuan_retur) {
      const tujuanInclude = queryOptions.include.find(
        (inc) => inc.as === "lokasi_stok_tujuan"
      );

      if (tujuanInclude) {
        tujuanInclude.where = {
          name: { [Op.iLike]: `%${query.tujuan_retur}%` },
        };
        tujuanInclude.required = true;
      }
    }

    const result = await ReturUnitModel.findAndCountAll({
      where: whereClause,
      ...queryOptions,
      order: [["tanggal_retur", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return getPagingData(result, page, pageSize);
  }

  static async getReturUnitByUuid(uuid, faskesUuid) {
    return ReturUnitModel.findOne({
      where: { uuid, faskes_uuid: faskesUuid },
      ...this._baseOptions,
    });
  }
}
