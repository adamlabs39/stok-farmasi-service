import { sequelize } from "../configurations/database-instance.js";
import NotFoundError from "../errors/NotFoundError.js";
import { generateNoReturUnit } from "../helpers/generator.helper.js";
import ReturUnitHelper from "../helpers/retur-unit.helper.js";
import ReturUnitRepository from "../repositories/retur-unit.repository.js";
import { ReturUnitValidation } from "../validations/retur-unit.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { v7 as uuidv7 } from "uuid";
import InventoryService from "./inventory.service.js";

export default class ReturUnitService {
  static async createReturUnit(data, author, token) {
    let transaction;
    try {
      const validatedData = ZodValidator.validate(
        ReturUnitValidation.CREATE,
        data
      );

      const faskesUuid = author.faskesUuid;
      const petugas = author.username;

      const totalHarga = validatedData.items.reduce((sum, item) => {
        return sum + item.qty * item.harga_satuan;
      }, 0);

      const itemsToCreate = validatedData.items.map((item) => ({
        ...item,
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
        qty_terima: item.qty,
      }));

      const jenis_stok_uuid = validatedData.jenis_stok_uuid;

      const enrichedData = {
        ...validatedData,
        uuid: uuidv7(),
        no_retur: generateNoReturUnit(),
        tanggal_retur: Date.now(),
        total_item: validatedData.items.length,
        total_harga: totalHarga,
        petugas_retur: petugas,
        petugas_retur_uuid: petugas,
        faskes_uuid: faskesUuid,
        items: itemsToCreate,
      };

      await InventoryService.increaseStock(
        enrichedData,
        jenis_stok_uuid,
        token
      );

      transaction = await sequelize.transaction();

      const result = await ReturUnitRepository.createReturUnit(
        enrichedData,
        transaction
      );

      await transaction.commit();
      return result;
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  static async getAllReturUnit(query, faskesUuid) {
    try {
      const { rows, count, page, pageSize, totalPages } =
        await ReturUnitRepository.getAllReturUnit(query, faskesUuid);
      return {
        data: ReturUnitHelper.mapReturUnits(rows),
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

  static async getReturUnitByUuid(uuid, faskesUuid) {
    try {
      const result = await ReturUnitRepository.getReturUnitByUuid(
        uuid,
        faskesUuid
      );
      if (!result) {
        throw new NotFoundError("Retur unit tidak ditemukan");
      }
      return { data: ReturUnitHelper.mapReturUnit(result) };
    } catch (error) {
      throw error;
    }
  }
}
