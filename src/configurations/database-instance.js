import sequelizeInstance from "@adameds/model-sdk/instance";

const connectDB = async () => {
  try {
    await sequelizeInstance.authenticate();
    console.log("✅ Koneksi Database Berhasil.");
  } catch (error) {
    console.error("❌ Gagal terhubung ke database:", error);
    process.exit(1);
  }
};

export { connectDB };
