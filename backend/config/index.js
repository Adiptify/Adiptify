import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || "",
  mongoDb: process.env.MONGO_DB || "nimbus",
  jwtSecret: process.env.JWT_SECRET || "change_me",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaApiKey: process.env.OLLAMA_API_KEY || "",
  ollamaModel: process.env.OLLAMA_MODEL || "deepseek-v3.1:671b-cloud",
  redisUrl: process.env.REDIS_URL || "",
};

export default config;

