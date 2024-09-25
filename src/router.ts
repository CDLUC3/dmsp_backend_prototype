import express, { Request, Response } from 'express';
import { authMiddleware } from './middleware/auth';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { refreshTokenController } from './controllers/refreshTokenController';
import { signoutController } from './controllers/signoutController';
import { csrfMiddleware } from './middleware/csrf';

const router = express.Router();

// Support for acquiring an initial CSRF token
router.get('/apollo-csrf',
  csrfMiddleware,
  (_req: Request, res: Response) => { res.status(200).send('ok'); }
);

// Support for user sign in/up - requires a valid CSRF token
router.post('/apollo-signin',
  csrfMiddleware,
  (req: Request, res: Response) => signinController(req, res)
);
router.post('/apollo-signup',
  csrfMiddleware,
  (req: Request, res: Response) => signupController(req, res)
);
// Support for refreshing access tokens - requires a valid CSRF and Refresh token
router.post('/apollo-refresh',
  csrfMiddleware,
  authMiddleware,
  (req: Request, res: Response) => refreshTokenController(req, res)
);
// Support for user sign out
router.post('/apollo-signout',
  authMiddleware,
  (req: Request, res: Response) => signoutController(req, res)
);

// GraphQL operations
// Apollo server has it's own built-in way of dealing with CSRF so no need to use our homegrown
// version here. See: https://www.apollographql.com/docs/router/configuration/csrf/
router.use('/graphql', authMiddleware);

export default router;
