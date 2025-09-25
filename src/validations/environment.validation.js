import z from "zod";

export class EnvironmentValidation {
  static envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    APPLICATION_PORT: z.coerce.number().default(3001),
    APPLICATION_HOST: z.string().default("127.0.0.1"),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    PUBLIC_KEY: z.string({
      required_error: "PUBLIC_KEY tidak boleh kosong di .env",
    }),
    PRIVATE_KEY: z.string({
      required_error: "PRIVATE_KEY tidak boleh kosong di .env",
    }),
  });
}