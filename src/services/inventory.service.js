import { inventoryAPI, logger } from "../configurations/index.js";

export default class InventoryService {
  static async catatPengeluaranUnit(dataMutasi, token) {
    logger.info(
      `Mencatat pengeluaran unit di Inventory: ${dataMutasi.no_pengeluaran}`
    );

    const payload = {
      jenis_pengeluaran: dataMutasi.jenis_pengeluaran,
      jenis_item: dataMutasi.jenis_item,
      kategori_item: dataMutasi.kategori_item,
      jenis_stok_uuid: dataMutasi.jenis_stok_uuid,
      lokasi_stok_awal_uuid: dataMutasi.lokasi_stok_awal_uuid,
      tanggal_pengeluaran: dataMutasi.tanggal_pengeluaran,
      items: dataMutasi.items.map((item) => ({
        stock_uuid: item.stock_uuid,
        exp_date: item.exp_date,
        harga_satuan: item.harga_satuan,
        konversi_uuid: item.konversi_uuid,
        qty: item.qty,
      })),
    };

    if (dataMutasi.jenis_pengeluaran === "pengeluaran tanpa permintaan") {
      if (!dataMutasi.lokasi_stok_tujuan_uuid) {
        throw new BadRequestError(
          "Lokasi stok tujuan wajib diisi untuk jenis 'pengeluaran tanpa permintaan'."
        );
      }
      payload.lokasi_stok_tujuan_uuid = dataMutasi.lokasi_stok_tujuan_uuid;
    } else if (dataMutasi.jenis_pengeluaran === "pemusnahan barang") {
      if (!dataMutasi.jenis_pemusnahan) {
        throw new BadRequestError(
          "Jenis pemusnahan wajib diisi untuk 'pemusnahan barang'."
        );
      }
      payload.jenis_pemusnahan = dataMutasi.jenis_pemusnahan;
    }

    try {
      await inventoryAPI.post("/inventory/pengeluaran-unit", payload, {
        headers: { Authorization: token },
      });
      logger.info(
        `Pengeluaran unit ${dataMutasi.no_pengeluaran} berhasil dicatat di Inventory.`
      );
    } catch (error) {
      logger.error(
        `Gagal mencatat pengeluaran unit di Inventory:`,
        error.response?.data || error.message
      );
      throw new BadRequestError(
        "Gagal mencatat pengeluaran di layanan inventory."
      );
    }
  }
}
