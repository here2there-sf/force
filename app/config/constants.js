import path from 'path';
import merge from 'lodash/merge';

// Default configuations applied to all environments
const defaultConfig = {
  env: process.env.NODE_ENV,
  get envs() {
    return {
      test: process.env.NODE_ENV === 'test',
      development: process.env.NODE_ENV === 'development',
      production: process.env.NODE_ENV === 'production',
    };
  },

  name: require('../../package.json').name,
  version: require('../../package.json').version,
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 8080,
  ip: process.env.IP || '0.0.0.0',
  apiPrefix: '', // Could be /api/resource or /api/v2/resource
  userRoles: ['guest', 'user', 'admin'],

  /**
   * MongoDB configuration options
   */
  mongo: {
    seed: true,
    options: {
      db: {
        safe: true,
      },
    },
  },

  /**
   * Security configuation options regarding sessions, authentication and hashing
   */
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'H1fpxRVir4FS6gT97NCteVSxqmEBEo9a',
    sessionExpiration: process.env.SESSION_EXPIRATION || 60 * 60 * 2, // 2 hours
    saltRounds: process.env.SALT_ROUNDS || 12,
  },
  aws: {
    folder: {
      oneOffPull: 'one-off-pulls',
      backup: 'backups',
    },
  },
  salesforce: {
    metadata: {
      version: '39.0',
    },
  },
  api: {
    organization: {
      base: process.env.ORG_BASE || 'https://here2there-organization.herokuapp.com',
      getOne: process.env.ORG_ONE || '/organization/',
      getAll: process.env.ORG_ALL || '/organizations',
    },
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 't)X8aderv\\T_(NgfjO}x<]~1q)3T-h2I(}ZM#hhrD[a<}gi@w+Vshzlt\\MWBK*#-U@-"JU!xgB_6SH3GFP}f6kb%%)HE~2Zgjo)cH^!PHkN|UmD{B?GB<Qz43bNe)<%)h_-O`^9U3UC0Cm5}9LAmv5!6)AW\\7>Q~"B]E59c5}+m(Y#ut!0Is2E:%mF<[4bR!xxe}[)s87)}pKRIH6wHY(FN2uLFXyPF>\\aq1*Cen~XD4VLlTjogkUI#nGzsbIZ8C',
    algorithm: 'aes256',
  },
};

// Environment specific overrides
const environmentConfigs = {
  development: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/development',
    },
    security: {
      saltRounds: 4,
    },
    aws: {
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      s3_bucket: process.env.S3_BUCKET,
    },
  },
  test: {
    port: 5678,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/test',
    },
    security: {
      saltRounds: 4,
    },
    aws: {
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      s3_bucket: process.env.S3_BUCKET,
    },
    salesforce: {
      email: process.env.TEST_SALESFORCE_EMAIL,
      password: process.env.TEST_SALESFORCE_PASSWORD,
      securityToken: process.env.TEST_SALESFORCE_SECURITY_TOKEN,
    },
  },
  production: {
    mongo: {
      seed: false,
      uri: process.env.MONGODB_URI,
    },
    aws: {
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      s3_bucket: process.env.S3_BUCKET,
    },
  },
};

// Recursively merge configurations
export default merge(defaultConfig, environmentConfigs[process.env.NODE_ENV] || {});
