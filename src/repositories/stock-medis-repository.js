import { ItemMedisJenisStokModel } from "@adameds/model-sdk/farmasi";
import {
  RiwayatMutasiModel,
  StockMedisModel,
} from "@adameds/model-sdk/inventory";
import { Op } from "sequelize";
import ResponseError from "../errors/ResponseError.js";

export default class StockMedisRepository {
  static async reduceQuantity(req, t) {
    let remainingQuantity = req.quantity;
    let stock;
    const today = new Date();
    let order = [];
    let result = [];

    if (req.metode_pemotongan_stok === "FEFO") {
      order.push(["exp_date", "ASC"]);
    } else if (req.metode_pemotongan_stok === "FIFO") {
      order.push(["created_at", "ASC"]);
    } else {
      order.push(["created_at", "DESC"]);
    }

    const sisaStockRaw = await StockMedisModel.findAll({
      where: {
        sisa_stok: { [Op.gt]: 0 },
        exp_date: { [Op.gt]: today },
        lokasi_stok_uuid: req.lokasi_stok_uuid,
      },
      attributes: ["sisa_stok"],
      include: [
        {
          model: ItemMedisJenisStokModel,
          as: "item_medis_jenis_stok",
          required: true,
          where: {
            jenis_stok_uuid: req.jenis_stok_uuid,
            item_medis_uuid: req.item_medis_uuid,
          },
          attributes: ["uuid"],
        },
      ],
      transaction: t,
    });

    const totalStock = sisaStockRaw.reduce(
      (acc, curr) => acc + curr.sisa_stok,
      0
    );

    if (totalStock < req.quantity) {
      throw new ResponseError(
        `${req.name} not enough or empty (total stock : ${totalStock})`,
        400
      );
    }

    while (remainingQuantity > 0) {
      stock = await StockMedisModel.findOne({
        where: {
          sisa_stok: { [Op.gt]: 0 },
          exp_date: { [Op.gt]: today },
          lokasi_stok_uuid: req.lokasi_stok_uuid,
        },
        include: [
          {
            model: ItemMedisJenisStokModel,
            as: "item_medis_jenis_stok",
            required: true,
            where: {
              item_medis_uuid: req.item_medis_uuid,
              jenis_stok_uuid: req.jenis_stok_uuid,
            },
            attributes: ["uuid"],
          },
        ],
        order: order,
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!stock) {
        throw new ResponseError(
          `Stok tidak ditemukan saat proses reduceQuantity.`,
          404
        );
      }

      const newStock = stock.sisa_stok - remainingQuantity;

      if (newStock >= 0) {
        await StockMedisModel.update(
          { sisa_stok: newStock },
          {
            where: { uuid: stock.uuid },
            transaction: t,
          }
        );
        result.push({
          stock_medis_uuid: stock.uuid,
          quantity: remainingQuantity,
          expired_date: stock.exp_date,
          stock_before: stock.sisa_stok,
        });
        remainingQuantity = 0;
      } else {
        await StockMedisModel.update(
          { sisa_stok: 0 },
          {
            where: { uuid: stock.uuid },
            transaction: t,
          }
        );
        result.push({
          stock_medis_uuid: stock.uuid,
          quantity: stock.sisa_stok,
          expired_date: stock.exp_date,
          stock_before: stock.sisa_stok,
        });
        remainingQuantity = Math.abs(newStock);
      }
    }
    return result;
  }

  static async findOrCreateAndIncreaseStock(
    {
      itemMedisJenisStokUuid,
      exp_date,
      harga_satuan,
      konversi_uuid,
      no_po,
      quantity,
    },
    lokasi_stok_tujuan_uuid,
    faskes_uuid,
    transaction
  ) {
    let stockBatch = await StockMedisModel.findOne({
      where: {
        item_medis_jenis_stok_uuid: itemMedisJenisStokUuid,
        exp_date: exp_date,
        harga_satuan: harga_satuan,
        lokasi_stok_uuid: lokasi_stok_tujuan_uuid,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (stockBatch) {
      await stockBatch.increment("stok", { by: quantity, transaction });
      await stockBatch.increment("sisa_stok", { by: quantity, transaction });
      await stockBatch.reload({ transaction });
    } else {
      stockBatch = await StockMedisModel.create(
        {
          item_medis_jenis_stok_uuid: itemMedisJenisStokUuid,
          exp_date: exp_date,
          harga_satuan: harga_satuan,
          konversi_uuid: konversi_uuid,
          no_po: no_po,
          lokasi_stok_uuid: lokasi_stok_tujuan_uuid,
          stok: quantity,
          sisa_stok: quantity,
          faskes_uuid: faskes_uuid,
        },
        { transaction }
      );
    }
    return stockBatch;
  }

  static async createRiwayatMutasi(data, transaction) {
    return RiwayatMutasiModel.create(data, { transaction });
  }

  static async addQuantity(req, transaction) {
    const stock = await StockMedisModel.findOne({
      where: {
        uuid: req.stock_medis_uuid,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!stock) {
      throw new NotFoundError(
        `Stok batch ${req.stock_medis_uuid} tidak ditemukan untuk dikembalikan.`
      );
    }

    await stock.increment("sisa_stok", { by: req.quantity, transaction });

    return stock;
  }

  static async findStokDetailsByUuids(stockUuids) {
    return await StockMedisModel.findAll({
      where: { uuid: { [Op.in]: stockUuids } },
      include: [
        {
          model: ItemMedisJenisStokModel,
          as: "item_medis_jenis_stok",
          required: true,
          include: [
            {
              model: ItemMedisModel,
              as: "item_medis",
              required: true,
            },
          ],
        },
      ],
    });
  }
}
