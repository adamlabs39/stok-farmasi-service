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
      items: permintaan.items?.map((item) => ({
        uuid: item.uuid,
        item_uuid: item.item_uuid,
        qty_permintaan: item.qty_permintaan,
      })),
    };
  }

  static mapPermintaanUnits(list = []) {
    return list.map((permintaan) =>
      PermintaanUnitHelper.mapPermintaanUnit(permintaan)
    );
  }
}
