import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../configurations/database-instance.js";
import PengeluaranUnitRepository from "../repositories/pengeluaran-unit.repository.js";
import { PengeluaranUnitValidation } from "../validations/pengeluaran-unit.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { generateNoPengeluaranUnit } from "../helpers/generator.helper.js";
import PengeluaranUnitHelper from "../helpers/pengeluaran-unit.helper.js";
import InventoryService from "./inventory.service.js";
import ResponseError from "../errors/ResponseError.js";

export default class PengeluaranUnitService {
  static async createPengeluaranUnit(data, author, token) {
    let transaction;
    let inventoryUpdated = false;

    try {
      const validatedData = ZodValidator.validate(
        PengeluaranUnitValidation.CREATE,
        data
      );
      const { items: itemsFromRequest } = validatedData;
      const jenis_stok_uuid = validatedData.jenis_stok_uuid;
      const stockUuids = itemsFromRequest.map((item) => item.stock_uuid);
      const stockDetailsFromDb =
        await PengeluaranUnitRepository.findStokDetailsByUuids(stockUuids);

      const stockMap = new Map(
        stockDetailsFromDb.map((stock) => [stock.uuid, stock])
      );

      const finalItems = itemsFromRequest.map((item) => {
        const stockDetail = stockMap.get(item.stock_uuid);
        if (!stockDetail) {
          throw new ResponseError(
            `Stok dengan UUID ${item.stock_uuid} tidak ditemukan.`, 400
          );
        }
        if (stockDetail.sisa_stok < item.qty) {
          throw new ResponseError(
            `Sisa stok tidak mencukupi (Sisa: ${stockDetail.sisa_stok}, Diminta: ${item.qty})`, 400
          );
        }
        return {
          ...item,
          faskes_uuid: author.faskesUuid,
          item_medis_uuid: stockDetail.item_medis_jenis_stok.item_medis_uuid,
        };
      });

      const enrichedData = {
        ...validatedData,
        uuid: uuidv7(),
        no_pengeluaran: generateNoPengeluaranUnit(),
        tanggal_pengeluaran: Date.now(),
        total_item: finalItems.length,
        total_harga: finalItems.reduce(
          (sum, item) => sum + (item.harga_satuan || 0) * item.qty,
          0
        ),
        petugas_pengeluaran: author.username,
        petugas_pengeluaran_uuid: author.username,
        faskes_uuid: author.faskesUuid,
        items: finalItems,
      };

      await InventoryService.catatPengeluaranUnit(enrichedData, token);
      inventoryUpdated = true;

      transaction = await sequelize.transaction();

      const result = await PengeluaranUnitRepository.createPengeluaranUnit(
        enrichedData,
        transaction
      );

      await transaction.commit();

      return result;
    } catch (error) {
      if (transaction) await transaction.rollback();
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
