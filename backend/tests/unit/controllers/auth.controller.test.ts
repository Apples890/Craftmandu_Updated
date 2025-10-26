import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('Auth Controller', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
