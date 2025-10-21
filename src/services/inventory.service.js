import { inventoryAPI, logger } from "../configurations/index.js";

export default class InventoryService {
  static async reduceStock(dataMutasi, token) {
    try {
      const apiCalls = dataMutasi.items.map((item) => {
        const isPermintaan = !!dataMutasi.no_permintaan;
        const payload = {
          jenis_stok_uuid: dataMutasi.jenis_stok_uuid,
          item_uuid: item.item_medis_uuid,
          quantity: item.qty || item.quantity,
          lokasi_stok_uuid: isPermintaan
            ? dataMutasi.lokasi_stok_tujuan_uuid
            : dataMutasi.lokasi_stok_awal_uuid,
          sumber_mutasi: "pelayanan",
          kode_referensi: isPermintaan
            ? dataMutasi.no_permintaan
            : dataMutasi.no_pengeluaran,
        };
        console.log("Reduce Stock Payload:", payload);
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
        kode_referensi: dataRetur.no_retur || dataRetur.no_pengeluaran,
        items: dataRetur.items.map((item) => ({
          item_uuid: item.item_uuid || item.item_medis_uuid,
          lokasi_stok_uuid: dataRetur.lokasi_stok_tujuan_uuid,
          jenis_stok_uuid: jenis_stok_uuid,
          quantity: item.qty_terima || item.qty,
          exp_date: item.exp_date,
          harga_satuan: item.harga_satuan,
        })),
      };
      console.log("Increase Stock Payload:", payload);
      await inventoryAPI.post("/inventory/stok/increase", payload, {
        headers: { Authorization: token },
      });
    } catch (error) {
      logger.error("Error increasing stock:", error);
      throw error;
    }
  }
}
