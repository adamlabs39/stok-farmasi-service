import express from "express";
import cors from "cors";
import morgan from "morgan";
import efp from "express-fileupload";
import authorizationSdk from "@adameds/authorization-sdk";

import { env, logger } from "./src/configurations/index.js";
import routes from "./src/routes/routes.js";
import errorMiddleware from "./src/middlewares/error.middleware.js";

const app = express();

// --- PENGATURAN MIDDLEWARE ---
app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

const stream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(efp());

const authConfig = {
  publicKey: env.PUBLIC_KEY,
  privateKey: env.PRIVATE_KEY,
};
app.use(authorizationSdk([], authConfig));
app.use( routes);

app.use(errorMiddleware);

export default app;
