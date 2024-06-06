import express from 'express';
import { tokenEndpoint } from '../controllers/tokenController';
const router = express.Router();

router.post('/token', tokenEndpoint);

export default router;
