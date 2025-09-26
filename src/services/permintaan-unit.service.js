import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../configurations/index.js";
import { PermintaanUnitValidation } from "../validations/permintaan-unit.validation.js";
import PermintaanUnitRepository from "../repositories/permintaan-unit.repository.js";
import { generateNoPermintaanUnit } from "../helpers/generator.helper.js";
import ZodValidator from "../validations/zod.validation.js";
import PermintaanUnitHelper from "../helpers/permintaan-unit.helper.js";

export default class PermintaanUnitService {
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

  static async getAllPermintaanUnit(query, faskesUuid) {
    try {
      const result = await PermintaanUnitRepository.getAllPermintaanUnit(
        query,
        faskesUuid
      );
      return PermintaanUnitHelper.mapPermintaanUnits(result);
    } catch (error) {
      throw error;
    }
  }
}
