import express, { Request, Response } from 'express';
import { authMiddleware } from './middleware/auth';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { refreshTokenController } from './controllers/refreshTokenController';
import { signoutController } from './controllers/signoutController';

const router = express.Router();

// Support for user auth
router.post('/apollo-signin', (req: Request, res: Response) => signinController(req, res));
router.post('/apollo-signup', (req: Request, res: Response) => signupController(req, res));
router.post('/apollo-signout', authMiddleware, (req: Request, res: Response) => signoutController(req, res));
router.post('/apollo-refresh', authMiddleware, (req: Request, res: Response) => refreshTokenController(req, res));

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
