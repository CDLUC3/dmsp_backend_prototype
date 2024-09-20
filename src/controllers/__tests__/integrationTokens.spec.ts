import casual from 'casual';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createHash } from 'crypto';
import router from '../../router';
import { csrfMiddleware } from '../../middleware/csrf';
import { Cache } from '../../datasources/cache';
import * as UserModel from '../../models/User';
import { generalConfig } from '../../config/generalConfig';

jest.mock('../../datasources/cache');
jest.mock('../../models/User');

// Process the response cookies into an object since cookies are returned in the `set-cookie` header in
// supertest and each one is a string like `cookieName=cookieValue`
function processResponseCookies(headers) {
  const cookies = {};

  if (headers && headers['set-cookie']?.length > 0) {
    for(const cookie of headers['set-cookie']) {
    // for (let i = 0; i < headers['set-cookie'].length; i++) {
      const parts = cookie.split('=');
      cookies[parts[0]] = parts[1]
    }
  }
  return cookies;
}

let mockRedis;
let app: Application;
let mockCache: jest.Mocked<Cache>;
let mockedUserData;

const mockedUser: UserModel.User = {
  id: casual.integer(1, 999),
  email: casual.email,
  givenName: casual.first_name,
  surName: casual.last_name,
  affiliationId: casual.url,
  role: UserModel.UserRole.RESEARCHER,
  acceptedTerms: true,
  password: casual.uuid,
  created: new Date().toISOString(),
  errors: [],

  isValid: jest.fn(),
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  cleanup: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
};

beforeAll(() => {
  app = express();
  app.use(
    bodyParser.json(),
    cookieParser(),
    csrfMiddleware,
  );
  app.use('/', router);
});

beforeEach(() => {
  jest.clearAllMocks();

  mockRedis = {};

  (Cache.getInstance as jest.Mock).mockReturnValue({
    adapter: {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete: jest.fn((key) => { delete mockRedis[key]; }),
      get: jest.fn((key) => { return mockRedis[key]; }),
      set: jest.fn((key, val) => { mockRedis[key] = val }),
    },
  });
  mockCache = Cache.getInstance();

  mockedUserData = {
    email: casual.email,
    givenName: casual.first_name,
    surName: casual.last_name,
    affiliationId: casual.url,
    role: 'RESEARCHER',
    acceptedTerms: true,
    password: casual.uuid,
  }
});

describe('CSRF', () => {
  it('GET /apollo-csrf should generate a CSRF token and add it as a header', async () => {
    const resp = await request(app)
      .get('/apollo-csrf');

    expect(resp.statusCode).toEqual(200);
    expect(resp.headers['x-csrf-token']).toBeTruthy();

    // Make sure the cache contains the hashed version of the CSRF token
    const hashedToken = createHash('sha256')
      .update(`${resp.headers['x-csrf-token']}${generalConfig.hashTokenSecret}`)
      .digest('hex');
    expect(mockRedis[`csrf:${resp.headers['x-csrf-token']}`]).toEqual(hashedToken);
  });

  it('POST /graphql should fail if the CSRF token is missing', async () => {
    const resp = await request(app)
      .post('/graphql')
      .send({ msg: 'Should fail!' });

    expect(resp.statusCode).toEqual(403);
    expect(resp.headers['x-csrf-token']).toBeFalsy();
    expect(resp.body).toEqual({ error: 'Invalid CSRF token'});
  });

  it('POST /graphql should fail if the CSRF token is invalid', async () => {
    const resp = await request(app)
      .post('/graphql')
      .set('X-CSRF-Token', '1234567890')
      .send({ msg: 'Should fail!' });

    expect(resp.statusCode).toEqual(403);
    expect(resp.headers['x-csrf-token']).toBeFalsy();
    expect(resp.body).toEqual({ error: 'Invalid CSRF token'});
  });
});

describe('Access and Refresh Tokens', () => {
  let mockUser: UserModel.User;
  let csrfToken: string;

  beforeEach(async () => {
    const resp = await request(app).get('/apollo-csrf');
    csrfToken = resp.headers['x-csrf-token'];

    mockUser = mockedUser;
    jest.spyOn(UserModel, 'User').mockReturnValue(mockUser);
  });

  it('POST /apollo-signup should generate access token and refresh token cookies on success', async () => {
    // const hashedToken = createHash('sha256').update(`${csrfToken}${generalConfig.hashTokenSecret}`).digest('hex');
    // (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);

    // Simulate the newly registered user (needs an id!)
    const registeredUser = mockedUser;
    registeredUser.id = casual.integer(1, 999);
    (mockedUser.register as jest.Mock).mockResolvedValue(registeredUser);

    const resp = await request(app)
      .post('/apollo-signup')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(mockedUserData));

    expect(resp.statusCode).toEqual(201);
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    const cookies = processResponseCookies(resp.headers);
    expect(cookies['dmspt']).toBeTruthy();
    expect(cookies['dmspr']).toBeTruthy();
    expect(resp.body).toEqual({ success: true, message: 'ok' });

    // Make sure the cache contains the refresh tokens
    const cachedToken = Object.keys(mockRedis).find((key) => { return key.includes(`dmspr:`) });
    expect(cachedToken).toBeTruthy();
  });

  it('POST /apollo-signup should NOT generate access token and refresh token cookies on invalid input', async () => {
    const hashedToken = createHash('sha256').update(`${csrfToken}${generalConfig.hashTokenSecret}`).digest('hex');
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);

    // Simulate invalid input causing a register failure
    const registeredUser = mockedUser;
    registeredUser.errors = ['foo must be present', 'bar must be present'];
    (mockedUser.register as jest.Mock).mockResolvedValue(registeredUser);

    const resp = await request(app)
      .post('/apollo-signup')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(mockedUserData));

    expect(resp.statusCode).toEqual(400);
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    expect(resp.headers['set-cookie']).toBeFalsy();
    expect(resp.body).toEqual({ success: false, message: 'foo must be present | bar must be present' });
  });

  it('POST /apollo-signup should NOT generate access token and refresh token cookies on failure', async () => {
    const hashedToken = createHash('sha256').update(`${csrfToken}${generalConfig.hashTokenSecret}`).digest('hex');
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);

    // Simulate a fatal register failure
    (mockedUser.register as jest.Mock).mockResolvedValue(null);

    const resp = await request(app)
      .post('/apollo-signup')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(mockedUserData));

    expect(resp.statusCode).toEqual(500);
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    expect(resp.headers['set-cookie']).toBeFalsy();
    expect(resp.body).toEqual({ success: false, message: 'Unable to register the account.' });
  });

  it('POST /apollo-signin should generate access token and refresh token cookies on success', async () => {
    const hashedToken = createHash('sha256').update(`${csrfToken}${generalConfig.hashTokenSecret}`).digest('hex');
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);

    const registeredUser = mockedUser;
    registeredUser.id = casual.integer(1, 999);
    (mockedUser.login as jest.Mock).mockResolvedValue(registeredUser);

    const resp = await request(app)
      .post('/apollo-signin')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: mockUser.email, password: mockUser.password }));

    expect(resp.statusCode).toEqual(200);
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    const cookies = processResponseCookies(resp.headers);
    expect(cookies['dmspt']).toBeTruthy();
    expect(cookies['dmspr']).toBeTruthy();
    expect(resp.body).toEqual({ success: true, message: 'ok' });

    // Make sure the cache contains the refresh tokens
    const cachedToken = Object.keys(mockRedis).find((key) => { return key.includes(`dmspr:`) });
    expect(cachedToken).toBeTruthy();
  });

  it('POST /apollo-signin should NOT generate access token and refresh token cookies on failure', async () => {
    const hashedToken = createHash('sha256').update(`${csrfToken}${generalConfig.hashTokenSecret}`).digest('hex');
    (mockCache.adapter.get as jest.Mock).mockResolvedValue(hashedToken);

    // Simulate a fatal register failure
    (mockedUser.login as jest.Mock).mockResolvedValue(null);

    const resp = await request(app)
      .post('/apollo-signin')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(mockedUserData));

    expect(resp.statusCode).toEqual(401);
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    expect(resp.headers['set-cookie']).toBeFalsy();
    expect(resp.body).toEqual({ success: false, message: 'Invalid credentials' });
  });

  it('POST /apollo-refresh should refresh the tokens', async () => {
    const registeredUser = mockedUser;
    registeredUser.id = casual.integer(1, 999);
    (mockedUser.login as jest.Mock).mockResolvedValue(registeredUser);

    // First signin so we have cookies and a refresh token in the cache
    const signinResp = await request(app)
      .post('/apollo-signin')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: mockUser.email, password: mockUser.password }));

    expect(signinResp.statusCode).toEqual(200);
    const signinCookies = processResponseCookies(signinResp.headers);
    const accessToken = signinCookies['dmspt'].split(';')[0];
    const refreshToken = signinCookies['dmspr'].split(';')[0];
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    (UserModel.User.findById as jest.Mock).mockResolvedValue(registeredUser);

    // Now try to refresh the tokens
    const resp = await request(app)
      .post('/apollo-refresh')
      .set('X-CSRF-Token', signinResp.headers['x-csrf-token'])
      .set('Cookie', [`dmspt=${accessToken}`, `dmspr=${refreshToken}`])
      .send()

    expect(resp.statusCode).toEqual(200)
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    const cookies = processResponseCookies(resp.headers);
    const newAccessToken = cookies['dmspt'].split(';')[0];
    const newRefreshToken = cookies['dmspr'].split(';')[0];

    expect(accessToken).not.toEqual(newAccessToken);
    expect(refreshToken).not.toEqual(newRefreshToken);
    expect(resp.body).toEqual({ success: true, message: 'ok' });
  });

  it('POST /apollo-signout should remove cookies', async () => {
    const signinHash = createHash('sha256').update(`${csrfToken}${generalConfig.hashTokenSecret}`).digest('hex');
    (mockCache.adapter.get as jest.Mock).mockResolvedValueOnce(signinHash);

    const registeredUser = mockedUser;
    registeredUser.id = casual.integer(1, 999);
    (mockedUser.login as jest.Mock).mockResolvedValue(registeredUser);

    // First signin so we have cookies and a refresh token in the cache
    const signinResp = await request(app)
      .post('/apollo-signin')
      .set('X-CSRF-Token', csrfToken)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: mockUser.email, password: mockUser.password }));

    expect(signinResp.statusCode).toEqual(200);
    expect(signinResp.headers['x-csrf-token']).toBeTruthy();
    const signinCookies = processResponseCookies(signinResp.headers);
    const accessToken = signinCookies['dmspt'].split(';')[0];
    expect(accessToken).toBeTruthy();
    expect(signinCookies['dmspr']).toBeTruthy();

    // Then signout
    const signoutHash = createHash('sha256').update(`${signinResp.headers['x-csrf-token']}${generalConfig.hashTokenSecret}`).digest('hex');
    (mockCache.adapter.get as jest.Mock).mockResolvedValueOnce(signoutHash);
    const signoutResp = await request(app)
      .post('/apollo-signout')
      .set('X-CSRF-Token', signinResp.headers['x-csrf-token'])
      .set('Cookie', [signinResp.headers['set-cookie']])
      .send();

    expect(signoutResp.statusCode).toEqual(200);
    expect(signoutResp.headers['x-csrf-token']).toBeTruthy();
    const signoutCookies = processResponseCookies(signoutResp.headers);
    expect(signoutCookies['dmspt']).toEqual('; Path');
    expect(signoutCookies['dmspr']).toEqual('; Path');
    expect(signoutResp.body).toEqual({ success: true, message: 'ok' });

    // Make sure the cache contains the refresh tokens
    const cachedRefresh = Object.keys(mockRedis).find((key) => { return key.includes(`dmspr:`) });
    expect(cachedRefresh).toBeFalsy();
    const cachedToken = Object.keys(mockRedis).find((key) => { return key.includes('dmspbl:') });
    expect(cachedToken).toBeTruthy();

    //Now try to do something with the revoked access token
    const resp = await request(app)
      .post('/graphql')
      .set('X-CSRF-Token', signoutResp.headers['x-csrf-token'])
      .set('Cookie', [`dmspt=${accessToken}`])
      .send('query ContributorRoles{ contributorRoles { id label url } }');

    expect(resp.statusCode).toEqual(401);
    expect(resp.headers['x-csrf-token']).toBeTruthy();
    const cookies = processResponseCookies(resp.headers);
    expect(cookies['dmspt']).toBeFalsy();
    expect(cookies['dmspr']).toBeFalsy();
  });
});
