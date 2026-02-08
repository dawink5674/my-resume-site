const request = require('supertest');
const app = require('../server');

describe('Rate Limiting', () => {
    // Increase timeout for this test as it sends many requests
    jest.setTimeout(30000);

    it('should block requests after limit is exceeded', async () => {
        const limit = 100;

        // Send 'limit' requests. We do this sequentially or in batches to avoid overwhelming the test runner/socket,
        // although Promise.all is usually fine for 100 requests.
        const promises = [];
        for (let i = 0; i < limit; i++) {
            promises.push(request(app).get('/'));
        }

        await Promise.all(promises);

        // The 101st request should be blocked
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(429);
    });
});
