import express from 'express';
import { expressjwt } from 'express-jwt';
import { authenticate, authorize, token } from './controllers/oauth2Controller';
import { signIn, signUp } from './controllers/userController';

const router = express.Router();

// TODO: Make this configurable and pass in as ENV variable
const secret = process.env.JWTSECRET;

const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret,
});

// OAuth2 authorization check
router.use('/graphql', authorize);

// Standard email+password authentication
router.post("/login", signIn);
// User account creation
router.post("/register", signUp);
// OAuth2 authentication endpoint for Code and ClientCredential flows
router.get('/authenticate', authenticate);
// OAuth2 endpoint to exchange an authorized Code for a Token
router.get('/token', token);

// Sample protected endpoint
router.post("/protected", authMiddleware, (req, res) => {
  // TODO: Someday fix this so we aren't using `any`
  if (!(req as any).auth.admin) {
    return res.sendStatus(401);
    res.sendStatus(200);
  }
});

export default router;
