
import dotenv from "dotenv";
import { Sequelize } from 'sequelize';

const poolConfig = process.env.DB_POOL ? JSON.parse(process.env.DB_POOL) : {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: poolConfig.max || 5,
      min: poolConfig.min || 0,
      acquire: poolConfig.acquire || 30000,
      idle: poolConfig.idle || 10000,
    },
    logging: false, 
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi Database Berhasil.");
  } catch (error) {
    console.error("❌ Gagal terhubung ke database:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
