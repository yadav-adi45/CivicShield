import { Router } from 'express';
import { getRegionDetail } from '../services/mlProxy.js';

const router = Router();

router.get('/region/:state', async (req, res, next) => {
  try {
    const { state } = req.params;
    const data = await getRegionDetail(state);
    res.json(data);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: `State '${req.params.state}' not found` });
    }
    next(error);
  }
});

export default router;
