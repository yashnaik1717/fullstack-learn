import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Backend Express Server', () => {
  it('should return 200 OK on health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'backend');
  });
});
