import { Router } from 'express';
import { getPredictions } from '../services/mlProxy.js';

const router = Router();

router.get('/prediction', async (req, res, next) => {
  try {
    const data = await getPredictions();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
