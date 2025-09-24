import z from "zod";

export class EnvironmentValidation {
  static envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    APPLICATION_PORT: z.coerce.number().default(3001),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
  });
}