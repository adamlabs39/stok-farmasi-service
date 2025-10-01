import { PengeluaranUnitValidation } from "../validations/pengeluaran-unit.validation";
import ZodValidator from "../validations/zod.validation";

export default class PengeluaranUnitService {
  static async createPengeluaranUnit(req) {
    const transaction = await sequelize.transaction();
    try {
      const validatedData = ZodValidator.validate(
        PengeluaranUnitValidation.CREATE,
        req.body
      );

      const faskesUuid = req.author.faskesUuid;
      const petugas = req.author.username;

      // Hitung total harga
      const totalHarga = validatedData.items.reduce((sum, item) => {
        return sum + item.qty * item.harga_satuan;
      }, 0);

      // Siapkan data item
      const itemsToCreate = validatedData.items.map((item) => ({
        ...item,
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
      }));

      // Siapkan data utama
      const enrichedData = {
        ...validatedData,
        uuid: uuidv7(),
        no_pengeluaran: generateNoPengeluaranUnit(),
        total_item: validatedData.items.length,
        total_harga: totalHarga,
        petugas_pengeluaran: petugas,
        petugas_pengeluaran_uuid: petugas, 
        faskes_uuid: faskesUuid,
        items: itemsToCreate,
      };

      const result = await PengeluaranUnitRepository.createPengeluaranUnit(
        enrichedData,
        transaction
      );

    

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}