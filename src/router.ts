import express from 'express';
import { expressjwt } from 'express-jwt';
import { generalConfig } from './config/generalConfig';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { refreshTokenController } from './controllers/refreshTokenController';
import { oauthServer, castRequest, castResponse } from './middleware/oauthServer';

const router = express.Router();

const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret: generalConfig.jwtSecret as string,
});

// Support for email+password
router.post('/apollo-signin', (req, res) => signinController(req, res));
router.post('/apollo-signup', (req, res) => signupController(req, res));
router.post('/apollo-refresh-token', (req, res) => refreshTokenController(req, res));

// Support for OAuth2
router.get('/apollo-authorize', (req, res) => oauthServer.authorize(castRequest(req), castResponse(res)));
router.post('/apollo-authenticate', (req, res) => oauthServer.authenticate(castRequest(req), castResponse(res)));
router.post('/apollo-token', (req, res) => oauthServer.token(castRequest(req), castResponse(res)));

// GraphQL operations
router.use('/graphql', authMiddleware);

// Sample protected endpoint
router.post("/protected", authMiddleware, (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(req as any).auth.admin) {
    return res.sendStatus(401);
  }
  res.sendStatus(200);
});

export default router;
