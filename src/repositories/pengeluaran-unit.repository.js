import {
  ConversionModel,
  ItemMedisJenisStokModel,
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
import NotFoundError from "../errors/NotFoundError.js";

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
            {
              model: StockMedisModel,
              as: "stok",
              include: [
                {
                  model: ItemMedisJenisStokModel,
                  as: "item_medis_jenis_stok",
                  required: false,
                  include: [
                    {
                      model: ItemMedisModel,
                      as: "item_medis",
                      required: false,
                      attributes: ["uuid", "code", "name"],
                    },
                  ],
                },
              ],
            },
            { model: ConversionModel, as: "konversi" },
          ],
        },
        {
          model: LokasiStokModel,
          as: "lokasi_stok_akhir",
          attributes: ["uuid", "name"],
        },
        {
          model: LokasiStokModel,
          as: "lokasi_stok_awal",
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

    const isSearching = query.no_pengeluaran;
    if (isSearching && result.count === 0) {
      throw new NotFoundError(`Data pengeluaran unit tidak ditemukan.`);
    }

    return getPagingData(result, page, pageSize);
  }

  static async getPengeluaranUnitByUuid(uuid, faskesUuid) {
    return PengeluaranUnitModel.findOne({
      where: { uuid, faskes_uuid: faskesUuid },
      ...this._baseOptions,
    });
  }

  static async findStokDetailsByUuids(stockUuids) {
    return await StockMedisModel.findAll({
      where: {
        uuid: { [Op.in]: stockUuids },
      },
      include: [
        {
          model: ItemMedisJenisStokModel,
          as: "item_medis_jenis_stok",
          attributes: ["item_medis_uuid"],
        },
      ],
    });
  }

  static async reduceLocalStock(items, transaction) {
    const stockUpdates = items.map((item) =>
      StockMedisModel.decrement("sisa_stok", {
        by: item.qty,
        where: { uuid: item.stock_uuid },
        transaction,
      })
    );
    await Promise.all(stockUpdates);
  }

  static async createPengeluaranUnit(data, transaction) {
    return PengeluaranUnitModel.create(data, {
      include: [
        {
          model: PengeluaranUnitItemModel,
          as: "items",
        },
      ],
      transaction,
    });
  }
}
