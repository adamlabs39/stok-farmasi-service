import { v7 as uuidv7 } from "uuid";
import { PermintaanUnitValidation } from "../validations/permintaan-unit.validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit.repository.js";
import { generateNoPermintaanUnit } from "../helpers/generator.helper.js";
import ZodValidator from "../validations/zod.validation.js";
import PermintaanUnitHelper from "../helpers/permintaan-unit.helper.js";
import sequelizeInstance from "@adameds/model-sdk/instance";
import InventoryService from "./inventory.service.js";
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
    const transaction = await sequelizeInstance.transaction();
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
        jenis_stok_uuid: validatedData.jenis_stok_uuid,
        jenis_stok_name: validatedData.jenis_stok,
        jenis_item: validatedData.kategori_item,

        uuid: uuidv7(),
        no_permintaan: generateNoPermintaanUnit(),
        tanggal_permintaan: Date.now(),
        total_item: validatedData.items.length,
        status: "request",

        petugas_permintaan_uuid: req.author.user_uuid,
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

  static async updateStatusPenerimaan(uuid, data, author, token) {
    try {
      const validatedData = ZodValidator.validate(
        PermintaanUnitValidation.UPDATE_STATUS,
        data
      );

      const { status } = validatedData;
      const faskesUuid = author.faskesUuid;

      const originalPermintaan =
        await PermintaanUnitRepository.getPermintaanUnitByUuid(
          uuid,
          faskesUuid
        );

      console.log("Original Permintaan:", originalPermintaan);

      if (!originalPermintaan) {
        throw new ResponseError(`Permintaan unit tidak ditemukan.`, 404);
      }

      if (status === "verified" || status === "verif_sebagian") {
        if (
          ["cancel", "dikirim", "verified", "verif_sebagian"].includes(
            originalPermintaan.status
          )
        ) {
          throw new ResponseError(
            `Permintaan unit sudah ${originalPermintaan.status} dan tidak bisa di verifikasi lagi.`,
            400
          );
        }

        if (!validatedData.items || validatedData.items.length === 0) {
          throw new ResponseError(
            `Properti 'items' wajib diisi saat verifikasi.`,
            400
          );
        }

        const originalQtyMap = new Map(
          originalPermintaan.items.map((item) => [
            item.uuid,
            item.qty_permintaan,
          ])
        );

        for (const itemFromRequest of validatedData.items) {
          const originalQty = originalQtyMap.get(itemFromRequest.uuid);

          if (originalQty === undefined) {
            throw new ResponseError(
              `Item dengan UUID ${itemFromRequest.uuid} tidak ditemukan dalam permintaan unit ini.`,
              404
            );
          }

          if (itemFromRequest.qty_pengiriman > originalQty) {
            throw new ResponseError(
              `Kuantitas pengiriman (${itemFromRequest.qty_pengiriman}) melebihi kuantitas yang diminta (${originalQty}).`,
              400
            );
          }
        }

        const itemsPayload = {
          item: validatedData.items.map((i) => ({
            uuid: i.uuid,
            quantity: i.qty_pengiriman,
          })),
          catatan_verifikasi: validatedData.catatan_verifikasi || null,
        };
        return await InventoryService.verifikasiPengiriman(
          uuid,
          itemsPayload,
          token
        );
      } else if (status === "dikirim") {
        if (
          !["verified", "verif_sebagian"].includes(originalPermintaan.status)
        ) {
          throw new ResponseError(
            `Hanya permintaan yang sudah diverifikasi yang bisa dikirim.`,
            400
          );
        }
        const kirimPayload = {
          catatan_pengiriman: validatedData.catatan_pengiriman || null,
        };

        return await InventoryService.kirimPengiriman(
          uuid,
          kirimPayload,
          token
        );
      } else if (status === "cancel") {
        if (
          ["dikirim", "verified", "verif_sebagian"].includes(
            originalPermintaan.status
          )
        ) {
          throw new ResponseError(
            `Permintaan unit sudah ${originalPermintaan.status} dan tidak bisa dibatalkan.`,
            400
          );
        }
        const batalPayload = {
          alasan_batal:
            validatedData.alasan_batal ||
            "Dibatalkan oleh Petugas Stok Farmasi",
        };

        return await InventoryService.batalPengiriman(
          uuid,
          batalPayload,
          token
        );
      } else {
        throw new ResponseError(
          `Perubahan status ke '${status}' tidak didukung melalui endpoint ini.`,
          400
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
