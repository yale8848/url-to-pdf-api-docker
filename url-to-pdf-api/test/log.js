const config = require('../src/config');
config.LOG_PATH = "";
const logger = require('../src/util/logger')(__filename);
logger.info("aaa");
logger.error("bbb");