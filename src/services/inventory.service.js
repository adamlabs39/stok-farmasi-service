import { inventoryAPI, logger } from "../configurations/index.js";

export default class InventoryService {
  static async reduceStock(dataPengeluaran, token) {
    logger.info("Memulai proses pengurangan stok di Layanan Inventory...");
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
        logger.info(
          `Mengirim permintaan reduce stock untuk item: ${payload.item_uuid}, qty: ${payload.quantity}`
        );
        return inventoryAPI.post("/inventory/stok/reduce", payload, {
          headers: { Authorization: token },
        });
      });
      await Promise.all(apiCalls);
      logger.info(
        "Semua item berhasil dikurangi stoknya di Layanan Inventory."
      );
    } catch (error) {
      logger.error(
        "Gagal saat proses reduce stock di Layanan Inventory:",
        error.response?.data || error.message
      );

      throw error;
    }
  }
}
