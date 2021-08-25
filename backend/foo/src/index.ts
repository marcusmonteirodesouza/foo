import { app } from './app';
import { config } from './config';
import { logger } from './logger';

app.listen(config.port, () => {
  logger.info('%s listening on port %d', config.log.name, config.port);
});
