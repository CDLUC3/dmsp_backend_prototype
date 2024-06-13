
// Always mock out our config files
jest.mock('../src/config/generalConfig', () => ({
  generalConfig: {
    jwtSecret: 'testing',
    jwtTtl: 5,
  }
}));

jest.mock('../src/config/oauthConfig', () => ({
  oauthConfig: {
    authorizationCodeLifetime: 10,
    accessTokenLifetime: 30,
    refreshTokenLifetime: 30,
  }
}))