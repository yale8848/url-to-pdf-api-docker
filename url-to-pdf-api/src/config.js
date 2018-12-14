/* eslint-disable no-process-env */

// Env vars should be casted to correct types
const config = {
    PORT: Number(process.env.PORT) || 9000,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    ALLOW_HTTP: process.env.ALLOW_HTTP === 'true',
    DEBUG_MODE: process.env.DEBUG_MODE === 'true',
    API_TOKENS: [],
    LOG_PATH: process.env.LOG_PATH,
    LOG_MAX_SIZE: process.env.LOG_MAX_SIZE,
    LOG_MAX_FILE: process.env.LOG_MAX_FILE,
    SINGLE_PROCESS: process.env.SINGLE_PROCESS === 'true'

};

if (process.env.API_TOKENS) {
    config.API_TOKENS = process.env.API_TOKENS.split(',');
}

module.exports = config;