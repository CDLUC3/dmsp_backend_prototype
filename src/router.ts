import express from 'express';
import { expressjwt } from 'express-jwt';
import { generalConfig } from './config/generalConfig';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { oauthServer, castRequest, castResponse } from './middleware/oauthServer';

const router = express.Router();

// TODO: Make this configurable and pass in as ENV variable
const secret = process.env.JWTSECRET;

const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret: generalConfig.jwtSecret as string,
});

// Support for email+password
router.post('/signin', (req, res) => signinController(req, res));
router.post('/signup', (req, res) => signupController(req, res));

// Support for OAuth2
router.get('/authorize', (req, res) => oauthServer.authorize(castRequest(req), castResponse(res)));
router.post('/authenticate', (req, res) => oauthServer.authenticate(castRequest(req), castResponse(res)));
router.post('/token', (req, res) => oauthServer.token(castRequest(req), castResponse(res)));

// GraphQL operations
router.use('/graphql', authMiddleware);

// Sample protected endpoint
router.post("/protected", authMiddleware, (req, res) => {
  // TODO: Someday fix this so we aren't using `any`
  if (!(req as any).auth.admin) {
    return res.sendStatus(401);
    res.sendStatus(200);
  }
});

export default router;
