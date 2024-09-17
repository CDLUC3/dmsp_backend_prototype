import express, { Request, Response } from 'express';
import { expressjwt } from 'express-jwt';
import { generalConfig } from './config/generalConfig';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { refreshTokenController } from './controllers/refreshTokenController';
import { oauthServer, castRequest, castResponse } from './middleware/oauthServer';
import { isRevokedCallback } from './services/tokenService';
import { signoutController } from './controllers/signoutController';

const router = express.Router();

const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret: generalConfig.jwtSecret as string,
  getToken: function fromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      return req.headers.authorization.split(" ")[1];
    }
    return req.headers.authorization;
  },
  isRevoked: isRevokedCallback,
});

// Support for user auth
router.post('/apollo-signin', (req: Request, res: Response) => signinController(req, res));
router.post('/apollo-signup', (req: Request, res: Response) => signupController(req, res));
router.post('/apollo-signout', authMiddleware, (req: Request, res: Response) => signoutController(req, res));
router.post('/apollo-refresh', authMiddleware, (req: Request, res: Response) => refreshTokenController(req, res));

// Support for OAuth2
router.get('/apollo-authorize', (req, res) => oauthServer.authorize(castRequest(req), castResponse(res)));
router.post('/apollo-authenticate', (req, res) => oauthServer.authenticate(castRequest(req), castResponse(res)));
router.post('/apollo-token', (req, res) => oauthServer.token(castRequest(req), castResponse(res)));

// GraphQL operations
router.use('/graphql', authMiddleware);

// Sample protected endpoint
router.post("/protected", authMiddleware, (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(req as any).auth.admin) {
    return res.sendStatus(401);
  }
  res.sendStatus(200);
});

export default router;
