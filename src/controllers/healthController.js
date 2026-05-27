const db = require("../config/db");
const axios = require("axios");
const responseHelper = require("../utils/response");
const logger = require("../utils/index").logger;

class HealthController {

  async ping(req, res) {
    return responseHelper.success(res, "pong", {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  }

  async checkAll(req, res) {
    const [dbResult, mlResult] = await Promise.allSettled([
      this._checkDatabase(),
      this._checkMlService(),
    ]);

    const database =
      dbResult.status === "fulfilled"
        ? dbResult.value
        : { status: "unhealthy", error: dbResult.reason?.message };

    const mlService =
      mlResult.status === "fulfilled"
        ? mlResult.value
        : { status: "unhealthy", error: mlResult.reason?.message };

    const allHealthy =
      database.status === "healthy" && mlService.status === "healthy";

    return res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? "healthy" : "degraded",
      statusCode: allHealthy ? 200 : 503,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        backend: {
          status: "healthy",
          memory: this._getMemoryUsage(),
          node: process.version,
          env: process.env.NODE_ENV || "development",
        },
        database,
        mlService,
      },
    });
  }

  async _checkDatabase() {
    const start = Date.now();
    try {
      await db.raw("SELECT 1");
      return {
        status: "healthy",
        latency_ms: Date.now() - start,
        database: process.env.DB_NAME || "unknown",
        host: process.env.DB_HOST || "unknown",
      };
    } catch (err) {
      logger.error("[HealthCheck] Database check failed:", { message: err.message });
      return { status: "unhealthy", latency_ms: Date.now() - start, error: err.message };
    }
  }

  async _checkMlService() {
    const mlUrl = process.env.ML_MODEL_URL;
    if (!mlUrl) return { status: "unconfigured", error: "ML_MODEL_URL not set" };

    const start = Date.now();
    try {
      const response = await axios.get(`${mlUrl}/health`, { timeout: 5000 });
      return {
        status: "healthy",
        latency_ms: Date.now() - start,
        url: mlUrl,
        http_status: response.status,
      };
    } catch (err) {
      logger.error("[HealthCheck] ML service check failed:", { message: err.message });
      return { status: "unhealthy", latency_ms: Date.now() - start, url: mlUrl, error: err.message };
    }
  }

  _getMemoryUsage() {
    const mem = process.memoryUsage();
    return {
      rss_mb: (mem.rss / 1024 / 1024).toFixed(2),
      heap_used_mb: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heap_total_mb: (mem.heapTotal / 1024 / 1024).toFixed(2),
    };
  }
}

module.exports = HealthController;