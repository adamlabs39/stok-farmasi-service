// server.js

import app from "./app.js";
import { env, logger, connectDB } from "./src/configurations/index.js";

const startServer = async () => {
  try {
    await connectDB();
    logger.info(
      `Mencoba terhubung ke database: ${env.DB_NAME} di ${env.DB_HOST}`
    );

    app.listen(env.APPLICATION_PORT, env.APPLICATION_HOST, () => {
      logger.info(
        `🚀 Server berjalan di http://${env.APPLICATION_HOST}:${env.APPLICATION_PORT}`
      );
    });
  } catch (error) {
    logger.error("❌ Gagal memulai server:", error);
    process.exit(1);
  }
};

startServer();
