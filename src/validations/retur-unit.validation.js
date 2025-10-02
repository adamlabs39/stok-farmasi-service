import { z } from "zod";

const itemSchema = z.object({
  item_uuid: z.string().uuid({ message: "Item UUID tidak valid" }),
  kategori_item: z.enum(["medis", "non-medis"]),
  qty: z.number().positive({ message: "Kuantitas harus lebih dari 0" }),
  exp_date: z.string().nonempty({ message: "Tanggal kedaluwarsa wajib diisi" }),
  harga_satuan: z
    .number()
    .nonnegative({ message: "Harga satuan tidak boleh negatif" }),
  konversi_uuid: z.string().uuid({ message: "Konversi UUID tidak valid" }),
});

const CREATE = z.object({
  kategori_item: z.enum(["medis", "non-medis"], {
    required_error: "Kategori item wajib diisi",
  }),
  jenis_stok: z.string().nonempty({ message: "Jenis stok wajib diisi" }),
  jenis_item: z.string().nonempty({ message: "Jenis item wajib diisi" }),
  lokasi_stok_awal_uuid: z
    .string()
    .uuid({ message: "Lokasi stok awal UUID tidak valid" }),
  lokasi_stok_tujuan_uuid: z
    .string()
    .uuid({ message: "Lokasi stok tujuan UUID tidak valid" }),
  alasan_retur: z.enum(["rusak", "kadaluarsa", "salah", "sisa"], {
    required_error: "Alasan retur wajib diisi",
  }),
  catatan: z.string().optional(),
  items: z
    .array(itemSchema)
    .min(1, { message: "Minimal harus ada 1 item yang diretur" }),
});

export const ReturUnitValidation = {
  CREATE,
};
