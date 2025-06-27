import express, { Response, Router, Request } from 'express';
import { authMiddleware } from './middleware/auth';
import { signinController } from './controllers/signinController';
import { signupController } from './controllers/signupController';
import { signoutController } from './controllers/signoutController';
import { csrfMiddleware } from './middleware/csrf';
import { refreshTokenController } from './controllers/refreshTokenController';
import { Logger } from "pino";
import { MySQLConnection } from "./datasources/mysql";
import { DMPHubAPI } from "./datasources/dmphubAPI";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";

const router = express.Router();

// Modify the express Request to allow it to include our context resources:
declare module 'express-serve-static-core' {
  interface Request {
    logger: Logger | null;
    cache: KeyvAdapter | null;
    sqlDataSource: MySQLConnection | null;
    dmphubAPIDataSource: DMPHubAPI | null;
  }
}

// Allow cache, logger and dataSources to be passed through
export function setupRouter(
  logger: Logger | null,
  cache: KeyvAdapter | null,
  sqlDataSource: MySQLConnection | null,
  dmphubAPIDataSource: DMPHubAPI | null,
): Router {
  router.use((req: Request, res: Response, next) => {
    req.logger = logger;
    req.cache = cache;
    req.sqlDataSource = sqlDataSource;
    req.dmphubAPIDataSource = dmphubAPIDataSource;

    next();
  });

  // Support for acquiring an initial CSRF token
  router.get('/apollo-csrf',
    csrfMiddleware,
    (_req: Request, res: Response) => { res.status(200).send('ok'); }
  );

  // Support for user sign in/up - requires a valid CSRF token
  router.post('/apollo-signin',
    csrfMiddleware,
    async (req: Request, res: Response): Promise<void> => await signinController(req, res)
  );

  router.post('/apollo-signup',
    csrfMiddleware,
    async (req: Request, res: Response): Promise<void> => await signupController(req, res)
  );

  // Support for refreshing access tokens - requires a valid CSRF and Refresh token
  router.post('/apollo-refresh',
    csrfMiddleware,
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => await refreshTokenController(req, res)
  );

  // Support for user sign out
  router.post('/apollo-signout',
    csrfMiddleware,
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => await signoutController(req, res)
  );

  return router;
}
