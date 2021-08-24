describe('config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {...OLD_ENV};
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('env', () => {
    test.each(['development', 'test', 'production'])(
      "Given process.env.NODE_ENV has valid value %p then should return it's value",
      validEnv => {
        process.env.NODE_ENV = validEnv;

        const {config} = require('../config');

        expect(config.env).toBe(validEnv);
      }
    );

    test("Given process.env.NODE_ENV is undefined then should return 'production' as default", () => {
      delete process.env.NODE_ENV;

      const {config} = require('../config');

      expect(config.env).toBe('production');
    });

    test('Given process.env.NODE_ENV has an invalid value then should throw', () => {
      const invalidEnv = 'invalid';

      process.env.NODE_ENV = invalidEnv;

      expect(() => {
        require('../config');
      }).toThrow(
        'Config validation error: "NODE_ENV" must be one of [development, test, production]'
      );
    });
  });

  describe('port', () => {
    test("Given process.env.PORT is a valid port number then should return it's value", () => {
      const port = 3000;

      process.env.PORT = port.toString();

      const {config} = require('../config');

      expect(config.port).toBe(port);
    });

    test('Given process.env.PORT is undefined then should return 8080 as default', () => {
      delete process.env.PORT;

      const {config} = require('../config');

      expect(config.port).toBe(8080);
    });

    test('Given process.env.PORT is negative then should throw', () => {
      const port = -1;

      process.env.PORT = port.toString();

      expect(() => {
        require('../config');
      }).toThrow(
        'Config validation error: "PORT" must be greater than or equal to 0'
      );
    });

    test('Given process.env.PORT is greater than 65535 then should throw', () => {
      const port = 65535 + 1;

      process.env.PORT = port.toString();

      expect(() => {
        require('../config');
      }).toThrow(
        'Config validation error: "PORT" must be less than or equal to 65535'
      );
    });
  });

  describe('log', () => {
    describe('level', () => {
      test.each(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])(
        "Given process.env.LOG_LEVEL %p then log.level should be '%p'",
        logLevel => {
          process.env.LOG_LEVEL = logLevel;

          const {config} = require('../config');

          expect(config.log.level).toBe(logLevel);
        }
      );

      test('Given process.env.LOG_LEVEL is undefined then the default should be info', () => {
        delete process.env.LOG_LEVEL;

        const {config} = require('../config');

        expect(config.log.level).toBe('info');
      });

      test('Given invalid process.env.LOG_LEVEL then should throw', () => {
        process.env.LOG_LEVEL = 'custom';

        expect(() => {
          require('../config');
        }).toThrow(
          'Config validation error: "LOG_LEVEL" must be one of [trace, debug, info, warn, error, fatal]'
        );
      });
    });

    describe('name', () => {
      test("Given the environment variable K_SERVICE is defined then should return it's value", () => {
        const name = 'my-service-name';

        process.env.K_SERVICE = name;

        const {config} = require('../config');

        expect(config.log.name).toBe(name);
      });

      test('Given the environment variable K_SERVICE is undefined then should return foo as default', () => {
        delete process.env.K_SERVICE;

        const {config} = require('../config');

        expect(config.log.name).toBe('foo');
      });
    });
  });

  describe('google', () => {
    describe('projectId', () => {
      test("Given the environment variable GCLOUD_PROJECT is defined then should return it's value", () => {
        const projectId = 'my-project-id';

        process.env.GCLOUD_PROJECT = projectId;

        const {config} = require('../config');

        expect(config.google.projectId).toBe(projectId);
      });

      test('Given process.env.REDIS_HOST is undefined then should throw', () => {
        delete process.env.GCLOUD_PROJECT;

        expect(() => {
          require('../config');
        }).toThrow('Config validation error: "GCLOUD_PROJECT" is required');
      });
    });
  });
});
