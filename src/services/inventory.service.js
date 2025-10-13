import { inventoryAPI, logger } from "../configurations/index.js";

export default class InventoryService {
  static async reduceStock(dataPengeluaran, token) {
    try {
      const apiCalls = dataPengeluaran.items.map((item) => {
        const payload = {
          jenis_stok_uuid: dataPengeluaran.jenis_stok_uuid,
          item_uuid: item.item_medis_uuid,
          quantity: item.qty,
          lokasi_stok_uuid: dataPengeluaran.lokasi_stok_awal_uuid,
          sumber_mutasi: "pelayanan",
          kode_referensi: dataPengeluaran.no_pengeluaran,
        };

        return inventoryAPI.post("/inventory/stok/reduce", payload, {
          headers: { Authorization: token },
        });
      });
      await Promise.all(apiCalls);
    } catch (error) {
      throw error;
    }
  }

  static async increaseStock(dataRetur, jenis_stok_uuid, token) {
    try {
      const payload = {
        sumber_mutasi: "pelayanan",
        kode_referensi: dataRetur.no_retur,
        items: dataRetur.items.map((item) => ({
          item_uuid: item.item_uuid,
          lokasi_stok_uuid: dataRetur.lokasi_stok_tujuan_uuid,
          jenis_stok_uuid: jenis_stok_uuid,
          quantity: item.qty_terima,
          exp_date: item.exp_date,
          harga_satuan: item.harga_satuan,
        })),
      };
      await inventoryAPI.post("/inventory/stok/increase", payload, {
        headers: { Authorization: token },
      });
    } catch (error) {
      logger.error("Error increasing stock:", error);
      throw error;
    }
  }
}
