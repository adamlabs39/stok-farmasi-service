import { ItemMedisModel, LokasiStokModel } from "@adameds/model-sdk/farmasi";
import {
  PermintaanUnitItemModel,
  PermintaanUnitModel,
} from "@adameds/model-sdk/inventory";
import { Op } from "sequelize";
import { getPagination, getPagingData } from "../helpers/pagination.helper.js";
import NotFoundError from "../errors/NotFoundError.js";
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
    });

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

  static async bulkUpdateItems(items, transaction) {
    const promises = items.map((item) =>
      PermintaanUnitItemModel.update(item.dataToUpdate, {
        where: { uuid: item.uuid },
        transaction,
      })
    );
    return Promise.all(promises);
  }

  static async updateStatusPermintaan(
    uuid,
    faskesUuid,
    dataToUpdate,
    transaction
  ) {
    const permintaan = await PermintaanUnitModel.findOne({
      where: { uuid, faskes_uuid: faskesUuid },
      attributes: ['status'],
      transaction
    });

    if (!permintaan) {
      throw new NotFoundError("Permintaan unit tidak ditemukan.");
    }
    if(['cancel', 'dikirim']. includes(permintaan.status)) {
      throw new ResponseError("Permintaan unit sudah dibatalkan atau dikirim, tidak bisa diubah statusnya.", 400);
    }

    if(dataToUpdate.status === 'cancel' && ['verified', 'verif_sebagian', 'dikirim'].includes(permintaan.status)) {
      throw new ResponseError("Permintaan unit sudah diverifikasi atau dikirim, tidak bisa dibatalkan.", 400);
    }

    return PermintaanUnitModel.update(dataToUpdate, {
      where: { uuid, faskes_uuid: faskesUuid },
      transaction,
    });
  }
}
