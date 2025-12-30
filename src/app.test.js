const request = require('supertest');
const app = require('./app');
const { register } = require('prom-client');

describe('Smoke Test', () => {
    it('should respond to the root path', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });
});

// CLEANUP: This prevents the "Jest did not exit" error
afterAll(async () => {
    // 1. Clear Prometheus registers
    register.clear();


});