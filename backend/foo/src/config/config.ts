import {Joi} from 'celebrate';
import {LogLevelString} from 'bunyan';

type Environment = 'development' | 'test' | 'production';

type Config = {
  env: Environment;
  port: number;
  log: {
    level: LogLevelString;
    name: string;
  };
};

// See https://en.wikipedia.org/wiki/Port_(computer_networking)
const minPort = 0;
const maxPort = 65535;

const envVarsSchema = Joi.object({
  K_SERVICE: Joi.string().default('foo'), // See https://cloud.google.com/run/docs/reference/container-contract#env-vars
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('production'),
  PORT: Joi.number().integer().min(minPort).max(maxPort).default(8080),
})
  .unknown()
  .required();

const {error, value: envVars} = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config: Config = {
  log: {
    level: envVars.LOG_LEVEL,
    name: envVars.K_SERVICE,
  },
  env: envVars.NODE_ENV,
  port: envVars.PORT,
};

export {config};
