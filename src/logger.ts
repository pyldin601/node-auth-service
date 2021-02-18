import os = require("os")
import winston = require("winston")

export type Logger = winston.Logger

export const logger = winston.createLogger({
  level: "debug",
  defaultMeta: { hostname: os.hostname() },
  transports: [
    new winston.transports.Console({
      format: winston.format.json(),
    }),
  ],
})
