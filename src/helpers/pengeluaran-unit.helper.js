import moment from "moment";

export default class PengeluaranUnitHelper {
  static mapPengeluaranUnit(unit) {
    const rawUnit = unit.get ? unit.get({ plain: true }) : unit;

    return {
      uuid: rawUnit.uuid,
      no_pengeluaran: rawUnit.no_pengeluaran,
      tanggal_pengeluaran: moment(parseInt(rawUnit.tanggal_pengeluaran)).format(
        "YYYY-MM-DD HH:mm"
      ),
      jenis_pengeluaran: rawUnit.jenis_pengeluaran,
      kategori_item: rawUnit.kategori_item,
      jenis_stok: {
        uuid: rawUnit.jenis_stok?.uuid,
        name: rawUnit.jenis_stok?.name,
      },
      lokasi_stok_akhir: {
        uuid: rawUnit.lokasi_stok_akhir?.uuid,
        name: rawUnit.lokasi_stok_akhir?.name,
      },
      catatan: rawUnit.catatan,
      total_item: rawUnit.total_item,
      total_harga: rawUnit.total_harga,
      petugas_pengeluaran: rawUnit.petugas_pengeluaran,
      items: rawUnit.items.map((item) => {
        const itemName =
          item.stok?.item_medis_jenis_stok?.item_medis?.name ||
          "Nama Item Tidak Ditemukan";
        const itemCode =
          item.stok?.item_medis_jenis_stok?.item_medis?.code ||
          "Kode Item Tidak Ditemukan";

        return {
          uuid: item.uuid,
          item: {
            uuid: item.stok?.item_medis_jenis_stok?.item_medis?.uuid,
            code: itemCode,
            name: itemName,
          },
          qty: item.qty,
          exp_date: item.stok?.exp_date
            ? moment(item.stok.exp_date).format("YYYY-MM-DD")
            : null,
          harga_satuan: item.harga_satuan,
          satuan: item.konversi?.satuan_pembelian, 
        };
      }),
    };
  }

  static mapPengeluaranUnits(units) {
    return units.map(this.mapPengeluaranUnit);
  }
}
