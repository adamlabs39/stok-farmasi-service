export default class PermintaanUnitHelper {
  static mapPermintaanUnit(permintaan) {
    return {
      uuid: permintaan.uuid,
      no_permintaan: permintaan.no_permintaan,
      tanggal_permintaan: permintaan.tanggal_permintaan
        ? new Date(Number(permintaan.tanggal_permintaan)).toISOString()
        : null,
      kategori_item: permintaan.kategori_item,
      jenis_item: permintaan.jenis_item,
      jenis_stok_uuid: permintaan.jenis_stok_uuid,
      jenis_stok_name: permintaan.jenis_stok,
      lokasi_tujuan: permintaan.lokasi_stok_tujuan
        ? {
            uuid: permintaan.lokasi_stok_tujuan.uuid,
            name: permintaan.lokasi_stok_tujuan.name,
          }
        : null,
      catatan: permintaan.catatan,
      cito: permintaan.cito,
      total_item: permintaan.total_item,
      status: permintaan.status,
      petugas_permintaan: permintaan.petugas_permintaan,
      items: permintaan.items?.map((item) => {
        const itemMedis = item.item_medis;
        const jenisStok = itemMedis?.jenis_stok?.[0];
        const stocks = jenisStok?.stocks || [];

        const total_sisa_stok = stocks.reduce(
          (sum, stock) => sum + (stock.sisa_stok || 0),
          0
        );

        const harga_satuan = stocks[0]?.harga_satuan || 0;

        return {
          permintaan_unit_item_uuid: item.uuid,
          item_medis_uuid: item.item_uuid,
          jumlah_permintaan: item.qty_permintaan,

          nama_item: itemMedis?.name || "N/A",
          satuan_uuid: itemMedis?.satuan_kemasan_uuid || null,
          satuan_name: itemMedis?.satuan_penggunaan?.name || null,
          sisa_stok: total_sisa_stok,
          harga_dasar: harga_satuan,
        };
      }),
    };
  }

  static mapPermintaanUnits(list = []) {
    return list.map((permintaan) =>
      PermintaanUnitHelper.mapPermintaanUnit(permintaan)
    );
  }
}
