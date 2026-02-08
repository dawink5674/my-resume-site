const request = require('supertest');
const app = require('../server');

describe('Server Endpoints', () => {

  // Test GET /
  it('GET / should return 200 and HTML', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  // Test static files
  it('GET /css/styles.css should return 200 and CSS', async () => {
    const res = await request(app).get('/css/styles.css');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/css/);
  });

  it('GET /js/main.js should return 200 and JS', async () => {
    const res = await request(app).get('/js/main.js');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/javascript/);
  });

  // Test 404
  it('GET /nonexistent should return 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  // Test Contact API
  describe('POST /api/contact', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: '', email: 'test@example.com', message: 'Hello' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Test User', email: 'invalid-email', message: 'Hello' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return success on valid submission', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Test User', email: 'test@example.com', message: 'Hello World' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
