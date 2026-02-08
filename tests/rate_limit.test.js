const http = require('http');
const app = require('../server');

// Start server on an ephemeral port
const server = app.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  let completedRequests = 0;
  const limit = 100;

  // Helper to make a request and return a promise
  function makeRequest() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: port,
        path: '/',
        method: 'GET',
        headers: {
            'Connection': 'close' // avoid socket exhaustion
        }
      };

      const req = http.request(options, (res) => {
        // Consume data
        res.resume();
        resolve(res.statusCode);
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
  }

  async function runTest() {
    try {
      console.log(`Sending ${limit} requests...`);
      for (let i = 1; i <= limit; i++) {
        const status = await makeRequest();
        if (status !== 200) {
          throw new Error(`Request ${i} failed with status ${status}`);
        }
        if (i % 10 === 0) process.stdout.write('.');
      }
      console.log('\nAll initial requests succeeded.');

      console.log('Sending request 101 (should fail)...');
      const status = await makeRequest();

      if (status === 429) {
        console.log('SUCCESS: Rate limiting blocked the request with 429.');
        process.exitCode = 0;
      } else {
        console.error(`FAILURE: Expected 429, got ${status}`);
        process.exitCode = 1;
      }
    } catch (err) {
      console.error('Test failed:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  }

  runTest();
});
