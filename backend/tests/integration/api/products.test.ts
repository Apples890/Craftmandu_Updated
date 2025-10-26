import request from 'supertest';
import app from '@/app';

describe('Products API', () => {
  it('GET /api/products should return an array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items) || Array.isArray(res.body)).toBe(true);
  });
});
