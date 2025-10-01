import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../configurations/database-instance.js";
import PengeluaranUnitRepository from "../repositories/pengeluaran-unit.repository.js";
import { PengeluaranUnitValidation } from "../validations/pengeluaran-unit.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { generateNoPengeluaranUnit } from "../helpers/generator.helper.js";
import PengeluaranUnitHelper from "../helpers/pengeluaran-unit.helper.js";

export default class PengeluaranUnitService {
  static async createPengeluaranUnit(req) {
    const transaction = await sequelize.transaction();
    try {
      const validatedData = ZodValidator.validate(
        PengeluaranUnitValidation.CREATE,
        req.body
      );

      const faskesUuid = req.author.faskesUuid;
      const petugas = req.author.username;

      const totalHarga = validatedData.items.reduce((sum, item) => {
        return sum + item.qty * item.harga_satuan;
      }, 0);

      const itemsToCreate = validatedData.items.map((item) => ({
        ...item,
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
      }));

      const enrichedData = {
        ...validatedData,
        uuid: uuidv7(),
        no_pengeluaran: generateNoPengeluaranUnit(),
        tanggal_pengeluaran: Date.now(),
        total_item: validatedData.items.length,
        total_harga: totalHarga,
        petugas_pengeluaran: petugas,
        petugas_pengeluaran_uuid: petugas,
        faskes_uuid: faskesUuid,
        items: itemsToCreate,
      };

      // TODO: Panggil API ke layanan inventory untuk mengurangi stok
      // await InventoryService.decreaseStock(itemsToCreate, transaction);

      const result = await PengeluaranUnitRepository.createPengeluaranUnit(
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

  static async searchItem(query, faskesUuid) {
    try {
      const result = await PengeluaranUnitRepository.searchItem(
        query,
        faskesUuid
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getAllPengeluaranUnit(query, faskesUuid) {
    try {
      const { rows, count, page, pageSize, totalPages } =
        await PengeluaranUnitRepository.getAllPengeluaranUnit(
          query,
          faskesUuid
        );
      return {
        data: PengeluaranUnitHelper.mapPengeluaranUnits(rows),
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

  static async getPengeluaranUnitByUuid(uuid, faskesUuid) {
    try {
      const result = await PengeluaranUnitRepository.getPengeluaranUnitByUuid(  
        uuid,
        faskesUuid
      );
      if (!result) {
        throw new Error("Pengeluaran unit tidak ditemukan");
      }

      return { data: PengeluaranUnitHelper.mapPengeluaranUnit(result) };
    } catch (error) {
      throw error;
    } 
  }
}
