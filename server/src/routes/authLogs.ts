import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AuthLogRow } from '../types.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', async (req, res) => {
  const { userId } = req.query as Record<string, string | undefined>;
  const filters: string[] = [];
  const params: any[] = [];

  if (userId) {
    filters.push('user_id = ?');
    params.push(userId);
  }

  const sql = `SELECT * FROM auth_logs ${filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT 200`;
  const rows = await query<AuthLogRow[]>(sql, params);
  res.json({ authLogs: rows });
});

export default router;
