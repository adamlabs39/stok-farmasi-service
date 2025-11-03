import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination.helper.js";
import {
  PermintaanUnitItemModel,
  PermintaanUnitModel,
  StockMedisModel,
} from "@adameds/model-sdk/inventory";
import {
  ItemMedisJenisStokModel,
  ItemMedisModel,
  LokasiStokModel,
  SatuanModel,
} from "@adameds/model-sdk/farmasi";
import ResponseError from "../errors/ResponseError.js";

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
          // separate: true,
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
              model: ItemMedisModel,
              as: "item_medis",
              attributes: ["name", "satuan_kemasan_uuid"],
              include: [
                {
                  model: SatuanModel,
                  as: "satuan_penggunaan",
                  attributes: ["name"],
                },
                {
                  model: ItemMedisJenisStokModel,
                  as: "jenis_stok",
                  attributes: ["uuid"],

                  where: {
                    jenis_stok_uuid: {
                      [Op.col]: "PermintaanUnitModel.jenis_stok_uuid",
                    },
                  },
                  required: false,
                  include: [
                    {
                      model: StockMedisModel,
                      as: "stocks",
                      attributes: ["sisa_stok", "harga_satuan"],
                      where: {
                        lokasi_stok_uuid: {
                          [Op.col]: "PermintaanUnitModel.lokasi_stok_awal_uuid",
                        },
                        sisa_stok: { [Op.gt]: 0 },
                        deleted_at: null,
                      },
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: LokasiStokModel,
          as: "lokasi_stok_tujuan",
          attributes: ["uuid", "name"],
        },
      ],
    };
  }

  static async getAllPermintaanUnit(query, faskesUuid) {
    const whereClause = { faskes_uuid: faskesUuid };
    if (query.no_permintaan) {
      whereClause.no_permintaan = { [Op.iLike]: `%${query.no_permintaan}%` };
    }

    if (query.status) {
      whereClause.status = query.status;
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

    // pagination
    const { limit, offset, page, pageSize } = getPagination(query);

    const result = await PermintaanUnitModel.findAndCountAll({
      where: whereClause,
      ...this._baseOptions,
      include: includeClause,
      order: [["tanggal_permintaan", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const isSearching =
      query.no_permintaan || query.status || query.nama_lokasi_tujuan;
    if (isSearching && result.count === 0) {
      throw new ResponseError(`Data permintaan unit tidak ditemukan.`, 404);
    }

    return getPagingData(result, page, pageSize);
  }

  static async getPermintaanUnitByUuid(uuid, faskesUuid) {
    return PermintaanUnitModel.findOne({
      where: {
        uuid,
        faskes_uuid: faskesUuid,
      },
      ...this._baseOptions,
    });
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

  static async searchitem(query, faskesUuid) {
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

  static async updateStatusPermintaan(
    uuid,
    faskesUuid,
    dataToUpdate,
    transaction
  ) {
    const [updatedRowCount] = await PermintaanUnitModel.update(dataToUpdate, {
      where: {
        uuid: uuid,
        faskes_uuid: faskesUuid,
      },
      transaction,
    });
    return [updatedRowCount];
  }
}
