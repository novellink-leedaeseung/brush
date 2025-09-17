// routes/members.routes.js
import { Router } from 'express';
import { asyncHandler } from '../core/asyncHandler.js';

export const membersRoutes = (svc) => {
  const r = Router();

  r.get('/', asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    res.json({ success: true, data: svc.list({ page, pageSize: 5 }) });
  }));

  r.get('/:id', asyncHandler(async (req, res) => {
    const data = svc.get(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    res.json({ success: true, data });
  }));

  r.post('/', asyncHandler(async (req, res) => {
    const data = svc.create(req.body);
    res.status(201).json({ success: true, data });
  }));

  r.put('/:id', asyncHandler(async (req, res) => {
    const data = svc.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    res.json({ success: true, data });
  }));

  r.delete('/:id', asyncHandler(async (req, res) => {
    const ok = svc.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    res.status(204).end();
  }));

  return r;
};
