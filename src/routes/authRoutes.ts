import express from 'express';
import { signinController } from '../controllers/signinController';
import { authorizationEndpoint } from '../controllers/authController';
import { tokenEndpoint } from '../controllers/tokenController';

const router = express.Router();

router.post('/signin', signinController);
router.get('/authorize', authorizationEndpoint);
router.post('/token', tokenEndpoint);

export default router;
