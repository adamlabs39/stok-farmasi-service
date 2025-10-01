import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../configurations/index.js";
import { PermintaanUnitValidation } from "../validations/permintaan-unit.validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit.repository.js";
import { generateNoPermintaanUnit } from "../helpers/generator.helper.js";
import ZodValidator from "../validations/zod.validation.js";
import PermintaanUnitHelper from "../helpers/permintaan-unit.helper.js";
import NotFoundError from "../errors/NotFoundError.js";
import ResponseError from "../errors/ResponseError.js";

export default class PermintaanUnitService {
  static async getAllPermintaanUnit(query, faskesUuid) {
    try {
      const { rows, count, page, pageSize, totalPages } =
        await PermintaanUnitRepository.getAllPermintaanUnit(query, faskesUuid);
      return {
        data: PermintaanUnitHelper.mapPermintaanUnits(rows),
        pagination: {
          page,
          pageSize,
          totalData: count,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getPermintaanUnitByUuid(uuid, faskesUuid) {
    try {
      const result = await PermintaanUnitRepository.getPermintaanUnitByUuid(
        uuid,
        faskesUuid
      );
      return { data: PermintaanUnitHelper.mapPermintaanUnit(result) };
    } catch (error) {
      throw error;
    }
  }

  static async createPermintaanUnit(req) {
    const transaction = await sequelize.transaction();
    try {
      const validatedData = ZodValidator.validate(
        PermintaanUnitValidation.CREATE,
        req.body
      );

      const faskesUuid = req.author.faskesUuid;

      const itemsToCreate = validatedData.items.map((item) => ({
        ...item,
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
        kategori_item: validatedData.kategori_item,
      }));

      const enrichedData = {
        ...validatedData,
        jenis_stok: validatedData.jenis_stok_uuid,
        jenis_item: validatedData.kategori_item,

        uuid: uuidv7(),
        no_permintaan: generateNoPermintaanUnit(),
        tanggal_permintaan: Date.now(),
        total_item: validatedData.items.length,
        status: "request",

        petugas_permintaan_uuid: req.author.username,
        petugas_permintaan: req.author.username,
        faskes_uuid: faskesUuid,

        items: itemsToCreate,
      };

      const result = await PermintaanUnitRepository.createPermintaanUnit(
        enrichedData,
        transaction
      );

      await transaction.commit();

      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async searchitem(query, faskesUuid) {
    try {
      const result = await PermintaanUnitRepository.searchitem(
        query,
        faskesUuid
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatusPenerimaan(uuid, faskesUuid, req) {
    const transaction = await sequelize.transaction();
    try {
      const validatedData = ZodValidator.validate(
        PermintaanUnitValidation.UPDATE_STATUS,
        req.body
      );

      const petugas = req.author.username;

      if (validatedData.status === "dikirim") {
        const originalPermintaan =
          await PermintaanUnitRepository.getPermintaanUnitByUuid(
            uuid,
            faskesUuid
          );
        if (
          !originalPermintaan ||
          ["cancel", "dikirim"].includes(originalPermintaan.status)
        ) {
          throw new ResponseError(
            "Permintaan unit tidak ditemukan atau sudah dibatalkan/dikirim.",
            400
          );
        }

        const leftoverItems = [];
        const itemsToUpdate = [];
        const shippedItemsMap = new Map(
          validatedData.items.map((i) => [i.uuid, i.qty_pengiriman])
        );
        let isPartialShipment = false;

        for (const item of originalPermintaan.items) {
          const qty_pengiriman = shippedItemsMap.get(item.uuid) || 0;
          if (qty_pengiriman > item.qty_permintaan) {
            throw new ResponseError(
              `Kuantitas pengiriman untuk item ${item.uuid} melebihi kuantitas permintaan.`,
              400
            );
          }

          itemsToUpdate.push({
            uuid: item.uuid,
            dataToUpdate: { qty_pengiriman },
          });

          const remainingQty = item.qty_permintaan - qty_pengiriman;
          if (remainingQty > 0) {
            isPartialShipment = true;
            leftoverItems.push({
              uuid: uuidv7(),
              faskes_uuid: faskesUuid,
              kategori_item: item.kategori_item,
              item_uuid: item.item_uuid,
              qty_permintaan: remainingQty,
              konversi_uuid: item.konversi_uuid,
            });
          }
        }
        await PermintaanUnitRepository.bulkUpdateItems(
          itemsToUpdate,
          transaction
        );

        const dataUpdateOriginal = {
          status: "dikirim",
          petugas_kirim: petugas,
          catatan_pengiriman: validatedData.catatan_pengiriman || null,
        };
        await PermintaanUnitRepository.updateStatusPermintaan(
          uuid,
          faskesUuid,
          dataUpdateOriginal,
          transaction
        );

        if (isPartialShipment && leftoverItems.length > 0) {
          const newPermintaanData = {
            uuid: uuidv7(),
            faskes_uuid: faskesUuid,
            no_permintaan: generateNoPermintaanUnit(),
            tanggal_permintaan: Date.now(),
            total_item: leftoverItems.length,
            status: "request_sebagian",
            petugas_permintaan_uuid: originalPermintaan.petugas_permintaan_uuid,
            petugas_permintaan: originalPermintaan.petugas_permintaan,
            lokasi_stok_tujuan_uuid: originalPermintaan.lokasi_stok_tujuan_uuid,
            kategori_item: originalPermintaan.kategori_item,
            jenis_stok_uuid: originalPermintaan.jenis_stok_uuid,
            catatan: `Permintaan lanjutan dari ${originalPermintaan.no_permintaan}`,
            items: leftoverItems,
            jenis_stok: originalPermintaan.jenis_stok,
            jenis_item: originalPermintaan.jenis_item,
            lokasi_stok_awal_uuid: originalPermintaan.lokasi_stok_awal_uuid,
            cito: originalPermintaan.cito,
          };
          await PermintaanUnitRepository.createPermintaanUnit(
            newPermintaanData,
            transaction
          );
        }
      } else {
        const dataToUpdate = {
          status: validatedData.status,
        };

        if (["verified", "verif_sebagian"].includes(validatedData.status)) {
          dataToUpdate.petugas_verifikasi = petugas;
          dataToUpdate.catatan_verifikasi =
            validatedData.catatan_verifikasi || null;
        } else if (validatedData.status === "cancel") {
          dataToUpdate.alasan_batal = validatedData.alasan_batal || null;
        }

        const [updatedRowCount] =
          await PermintaanUnitRepository.updateStatusPermintaan(
            uuid,
            faskesUuid,
            dataToUpdate,
            transaction
          );

        if (updatedRowCount === 0) {
          throw new NotFoundError(
            "Permintaan unit tidak ditemukan atau tidak dapat diupdate."
          );
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
