const { createLogger, format, transports, addColors } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const { combine, timestamp, printf, colorize, errors } = format;

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
  },
};

addColors(customLevels.colors);


const serializeMeta = (meta) => {
  return JSON.stringify(meta, (key, value) => {
    if (value instanceof Error) {
      return {
        message: value.message,
        name: value.name,
        stack: value.stack,
        code: value.code,     
        ...(value.response ? { response: value.response } : {}),
      };
    }
    return value;
  }, 2);
};


const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length
    ? `\n${serializeMeta(meta)}`
    : "";

  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}${metaStr}`;
});


const logger = createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || "http",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: true, colors: customLevels.colors }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat,
      ),
      silent: process.env.NODE_ENV === "test",
    }),

    new DailyRotateFile({
      filename: path.join("logs", "app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      level: "http",
    }),

    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      maxSize: "20m",
      level: "error",
    }),
  ],
});

module.exports = logger;
