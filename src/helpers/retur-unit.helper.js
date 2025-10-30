import moment from "moment";

export default class ReturUnitHelper {

  static mapReturUnit(unit) {
    const rawUnit = unit.get ? unit.get({ plain: true }) : unit;

    return {
      uuid: rawUnit.uuid,
      no_retur: rawUnit.no_retur,
      tanggal_retur: moment(parseInt(rawUnit.tanggal_retur)).format(
        "YYYY-MM-DD HH:mm"
      ),
      alasan_retur: rawUnit.alasan_retur,
      jenis_stok: rawUnit.jenis_stok,
      kategori_item: rawUnit.kategori_item,
      lokasi_stok_awal: {
        uuid: rawUnit.lokasi_stok_awal?.uuid,
        name: rawUnit.lokasi_stok_awal?.name,
      },
      lokasi_stok_tujuan: {
        uuid: rawUnit.lokasi_stok_tujuan?.uuid,
        name: rawUnit.lokasi_stok_tujuan?.name,
      },
      catatan: rawUnit.catatan,
      total_item: rawUnit.total_item,
      total_harga: rawUnit.total_harga,
      petugas_retur: rawUnit.petugas_retur,
      items: rawUnit.items.map((item) => {
        return {
          uuid: item.uuid,
          item: {
            uuid: item.item?.uuid,
            code: item.item?.code || "N/A",
            name: item.item?.name || "Nama Item Tidak Ditemukan",
          },
          qty: item.qty,
          qty_terima: item.qty_terima,
          exp_date: item.exp_date
            ? moment(item.exp_date).format("YYYY-MM-DD")
            : null,
          harga_satuan: item.harga_satuan,
        };
      }),
    };
  }

  static mapReturUnits(units) {
    return units.map(this.mapReturUnit);
  }
}
