import { z } from "zod";

const itemSchema = z.object({
  item_uuid: z
    .string()
    .uuid({ message: "item_uuid harus berupa UUID yang valid." }),
  qty_permintaan: z
    .number()
    .positive({ message: "qty_permintaan harus lebih besar dari 0." }),
  konversi_uuid: z
    .string()
    .uuid({ message: "konversi_uuid harus berupa UUID yang valid." }),
  harga_satuan: z.number().positive().optional(),
});

const createPermintaanUnitSchema = z.object({
  kategori_item: z.enum(["medis", "non-medis"], {
    required_error: "kategori_item tidak boleh kosong.",
  }),
  jenis_stok_uuid: z
    .string()
    .uuid({ message: "jenis_stok_uuid harus berupa UUID yang valid." }),
  lokasi_stok_awal_uuid: z
    .string()
    .uuid({ message: "lokasi_stok_awal_uuid harus berupa UUID yang valid." }),
  lokasi_stok_tujuan_uuid: z
    .string()
    .uuid({ message: "lokasi_stok_tujuan_uuid harus berupa UUID yang valid." }),
  catatan: z.string().optional(),
  cito: z.boolean({ required_error: "cito tidak boleh kosong." }),
  items: z
    .array(itemSchema)
    .nonempty({ message: "Daftar item tidak boleh kosong." }),
});

const itemStatusUpdateSchema = z.object({
  uuid: z.string().uuid({ message: "UUID item tidak valid" }),
  qty_pengiriman: z
    .number()
    .int()
    .nonnegative({ message: "Kuantitas pengiriman tidak boleh negatif" }),
});

const UPDATE_STATUS = z
  .object({
    alasan_batal: z
      .string()
      .min(1, { message: "alasan_batal tidak boleh kosong." })
      .optional(),
    catatan_pengiriman: z
      .string()
      .min(1, { message: "catatan_pengiriman tidak boleh kosong." })
      .optional(),
    catatan_verifikasi: z
      .string()
      .min(1, { message: "catatan_verifikasi tidak boleh kosong." })
      .optional(),
    status: z.enum([
      "request",
      "request_sebagian",
      "verified",
      "dikirim",
      "verif_sebagian",
      "UPDATE_STATUS",
    ]),
    items: z.array(itemStatusUpdateSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "dikirim" && (!data.items || data.items.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Properti 'items' dengan kuantitas pengiriman wajib diisi saat status 'dikirim'",
        path: ["items"],
      });
    }
  });

export class PermintaanUnitValidation {
  static CREATE = createPermintaanUnitSchema;
  static UPDATE_STATUS = UPDATE_STATUS;
}
