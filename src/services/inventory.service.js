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
}
