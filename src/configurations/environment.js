import 'dotenv/config.js';
import { EnvironmentValidation } from '../validations/environment.validation.js';

const validatedEnv  = EnvironmentValidation.envSchema.safeParse(process.env);

if (!validatedEnv.success) {
    console.error("❌ Variabel .env tidak valid: ", validatedEnv.error.flatten().fieldErrors);
    throw new Error("❌ Variabel .env tidak valid. Silakan periksa kembali konfigurasi Anda.");
}

export const env = validatedEnv.data;