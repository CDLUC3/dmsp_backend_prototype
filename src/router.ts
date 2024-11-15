import express, { Response } from 'express';
import { Request } from 'express-jwt';
import { authMiddleware } from './middleware/auth';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { signoutController } from './controllers/signoutController';
import { emailTestController } from './controllers/emailTestController';
import { csrfMiddleware } from './middleware/csrf';
import { refreshTokenController } from './controllers/refreshTokenController';

const router = express.Router();

router.get('/apollo-email-test',
  csrfMiddleware,
  authMiddleware,
  async (req: Request, res: Response) => await emailTestController(req, res)
);

// Support for acquiring an initial CSRF token
router.get('/apollo-csrf',
  csrfMiddleware,
  (_req: Request, res: Response) => { res.status(200).send('ok'); }
);

// Support for user sign in/up - requires a valid CSRF token
router.post('/apollo-signin',
  csrfMiddleware,
  async (req: Request, res: Response) => await signinController(req, res)
);
router.post('/apollo-signup',
  csrfMiddleware,
  async (req: Request, res: Response) => await signupController(req, res)
);

// Support for refreshing access tokens - requires a valid CSRF and Refresh token
router.post('/apollo-refresh',
  csrfMiddleware,
  authMiddleware,
  async (req: Request, res: Response) => await refreshTokenController(req, res)
);

// Support for user sign out
router.post('/apollo-signout',
  csrfMiddleware,
  authMiddleware,
  async (req: Request, res: Response) => await signoutController(req, res)
);

export default router;
