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
        PermintaanUnitValidation.CANCEL,
        req.body
      );

      const dataToUpdate = { ...validatedData };
      const petugas = req.author.username;

      if(validatedData.status === "verified" || validatedData.status === "verif_sebagian") {
      dataToUpdate.petugas_verifikasi = petugas;
      }else if(validatedData.status === "dikirim") {
      dataToUpdate.petugas_kirim = petugas;
      }

      const [updatedRowsCount] =
        await PermintaanUnitRepository.updateStatusPenerimaan(
          uuid,
          faskesUuid,
          dataToUpdate,
          transaction
        );

      if (updatedRowsCount === 0) {
        throw new ResponseError(
          "Tidak dapat mengubah status ataupun melakukan cancel.",
          400
        );
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
