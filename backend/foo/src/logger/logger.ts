import bunyan from 'bunyan';
import {LoggingBunyan} from '@google-cloud/logging-bunyan';
import {config} from '../config';

const loggingBunyan = new LoggingBunyan({
  logName: config.log.name,
});

const streams: bunyan.Stream[] = [];
const loggingBunyanStream = loggingBunyan.stream(config.log.level);
const stdoutStream = {
  level: config.log.level,
  stream: process.stdout,
};

/* istanbul ignore next */
if (config.env === 'production') {
  streams.push(loggingBunyanStream);
} else {
  streams.push(stdoutStream);
}

const logger = bunyan.createLogger({
  level: config.log.level,
  name: config.log.name,
  streams,
});

export {logger};
