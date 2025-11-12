import { z } from "zod";

const itemSchema = z.object({
  stock_uuid: z.string().uuid({ message: "Stock UUID tidak valid" }),
  qty: z.number().positive({ message: "Kuantitas harus lebih dari 0" }),
  harga_satuan: z
    .number()
    .nonnegative({ message: "Harga satuan tidak boleh negatif" }),
  exp_date: z.string().nonempty({ message: "Tanggal kedaluwarsa wajib diisi" }),
  konversi_uuid: z.string().uuid({ message: "Konversi UUID tidak valid" }),
});

const CREATE = z
  .object({
    jenis_pengeluaran: z.enum(
      ["pemakaian unit", "pengeluaran tanpa permintaan", "pemusnahan barang"],
      { required_error: "Jenis pengeluaran wajib diisi" }
    ),
    kategori_item: z.enum(["medis", "non-medis"], {
      required_error: "Kategori item wajib diisi",
    }),
    jenis_stok_uuid: z
      .string({required_error: "Jenis stok wajib diisi" })
      .uuid({ message: "Jenis stok UUID tidak valid" }),
    jenis_item: z.string({ required_error: "Jenis item wajib diisi" }),
    lokasi_stok_awal_uuid: z
      .string({ required_error: "Lokasi stok awal wajib diisi" })
      .uuid({ message: "Lokasi stok awal UUID tidak valid" }),
    lokasi_stok_tujuan_uuid: z
      .string({ required_error: "Lokasi stok tujuan wajib diisi" })
      .uuid({ message: "Lokasi stok tujuan UUID tidak valid" })
      .optional(),
    catatan: z.string().optional(),
    jenis_pemusnahan: z.enum(["rusak", "kadaluarsa"]).optional(),
    items: z.array(itemSchema).min(1, { message: "Minimal harus ada 1 item" }),
  })
  .superRefine((data, ctx) => {
    if (
      data.jenis_pengeluaran === "pemusnahan barang" &&
      !data.jenis_pemusnahan
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Jenis pemusnahan wajib diisi jika jenis pengeluaran adalah pemusnahan barang",
        path: ["jenis_pemusnahan"],
      });
    }
  });

export const PengeluaranUnitValidation = {
  CREATE,
};
