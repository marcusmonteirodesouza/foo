import Joi from 'joi';

type Config = {
  firebase: {
    apiKey: string;
    authDomain: string;
  };
};

const envVarsSchema = Joi.object({
  REACT_APP_GOOGLE_IDENTITY_PLATFORM_API_KEY: Joi.string().required(),
  REACT_APP_GOOGLE_IDENTITY_PLATFORM_AUTH_DOMAIN: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config: Config = {
  firebase: {
    apiKey: envVars.REACT_APP_GOOGLE_IDENTITY_PLATFORM_API_KEY,
    authDomain: envVars.REACT_APP_GOOGLE_IDENTITY_PLATFORM_AUTH_DOMAIN,
  },
};

export { config };
