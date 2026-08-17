const logger = {
  info: (msg, meta = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta);
  },
  error: (msg, meta = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta);
  },
  cron: (msg, meta = '') => {
    console.log(`[CRON] [${new Date().toISOString()}] ${msg}`, meta);
  }
};

module.exports = logger;
