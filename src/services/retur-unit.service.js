import NotFoundError from "../errors/NotFoundError.js";
import { generateNoReturUnit } from "../helpers/generator.helper.js";
import ReturUnitHelper from "../helpers/retur-unit.helper.js";
import ReturUnitRepository from "../repositories/retur-unit.repository.js";
import { ReturUnitValidation } from "../validations/retur-unit.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { v7 as uuidv7 } from "uuid";
import KonfigurasiHargaRepository from "../repositories/konfigurasi-harga-repository.js";
import { ItemMedisModel } from "@adameds/model-sdk/farmasi";
import StockMedisRepository from "../repositories/stock-medis-repository.js";
import sequelizeInstance from "@adameds/model-sdk/instance";

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
      const {
        lokasi_stok_awal_uuid,
        lokasi_stok_tujuan_uuid,
        jenis_stok_uuid,
      } = validatedData;

      const configInfo = await KonfigurasiHargaRepository.get(faskesUuid);
      const metode_pemotongan_stok =
        configInfo?.metode_pemotongan_stok || "FIFO";

      transaction = await sequelizeInstance.transaction();

      const totalHarga = validatedData.items.reduce(
        (sum, item) => sum + item.qty * item.harga_satuan,
        0
      );
      const returUuid = uuidv7();

      const itemsToCreate = validatedData.items.map((item) => ({
        ...item,
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
        qty_terima: item.qty,
        retur_unit_uuid: returUuid,
      }));

      const enrichedData = {
        ...validatedData,
        uuid: returUuid,
        no_retur: generateNoReturUnit(),
        tanggal_retur: Date.now(),
        total_item: validatedData.items.length,
        total_harga: totalHarga,
        petugas_retur: petugas,
        petugas_retur_uuid: author.user_uuid,
        faskes_uuid: faskesUuid,
        items: itemsToCreate,
      };

      const result = await ReturUnitRepository.createReturUnit(
        enrichedData,
        transaction
      );

      for (const item of itemsToCreate) {
        const itemDetail = await ItemMedisModel.findByPk(item.item_uuid, {
          transaction,
        });
        const nama_item = itemDetail ? itemDetail.name : "Unknown Item";

        const catatanStokBerkurang = await StockMedisRepository.reduceQuantity(
          {
            item_medis_uuid: item.item_uuid,
            jenis_stok_uuid: jenis_stok_uuid,
            quantity: item.qty,
            metode_pemotongan_stok: metode_pemotongan_stok,
            lokasi_stok_uuid: lokasi_stok_awal_uuid,
            name: nama_item,
          },
          transaction
        );

        for (const catatan of catatanStokBerkurang) {
          const sourceStockBatch =
            await StockMedisRepository.findStockByIdWithRelations(
              catatan.stock_medis_uuid,
              transaction
            );

          if (!sourceStockBatch) {
            throw new NotFoundError(
              `Stok batch ${catatan.stock_medis_uuid} tidak ditemukan saat retur.`
            );
          }

          const destinationStockBatch =
            await StockMedisRepository.findOrCreateAndIncreaseStock(
              {
                itemMedisJenisStokUuid:
                  sourceStockBatch.item_medis_jenis_stok_uuid,
                exp_date: sourceStockBatch.exp_date,
                harga_satuan: sourceStockBatch.harga_satuan,
                konversi_uuid: sourceStockBatch.konversi_uuid,
                no_po: sourceStockBatch.no_po,
                quantity: catatan.quantity,
              },
              lokasi_stok_tujuan_uuid,
              faskesUuid,
              transaction
            );

          await StockMedisRepository.createRiwayatMutasi(
            {
              uuid: uuidv7(),
              faskes_uuid: faskesUuid,
              item_uuid: item.item_uuid,
              code: enrichedData.no_retur,
              exp_date: sourceStockBatch.exp_date,
              lokasi_stok_uuid: lokasi_stok_awal_uuid,
              jenis_stok_uuid: jenis_stok_uuid,
              keterangan: {
                description: `Retur unit ke ${lokasi_stok_tujuan_uuid} (Item: ${nama_item})`,
              },
              petugas: petugas,
              stok_awal: catatan.stock_before,
              stok_mutasi: catatan.quantity,
              sumber_mutasi: "inventory",
              type: "defisit",
            },
            transaction
          );

          await StockMedisRepository.createRiwayatMutasi(
            {
              uuid: uuidv7(),
              faskes_uuid: faskesUuid,
              item_uuid: item.item_uuid,
              code: enrichedData.no_retur,
              exp_date: destinationStockBatch.exp_date,
              lokasi_stok_uuid: lokasi_stok_tujuan_uuid,
              jenis_stok_uuid: jenis_stok_uuid,
              keterangan: {
                description: `Retur unit dari ${lokasi_stok_awal_uuid} (Item: ${nama_item})`,
              },
              petugas: petugas,
              stok_awal: destinationStockBatch.sisa_stok - catatan.quantity,
              stok_mutasi: catatan.quantity,
              sumber_mutasi: "inventory",
              type: "surplus",
            },
            transaction
          );
        }
      }

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
