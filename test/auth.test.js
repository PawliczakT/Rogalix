import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import request from 'supertest';
import { expect } from 'chai';

let app;

before(async () => {
    const importedApp = await import('../server/app.js'); // Use dynamic import
    app = importedApp.default; // Access the default export
});

describe('Auth API', () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`; // Generate a unique email
    it('should register a new user', (done) => {
        request(app)
            .post('/api/users/register')
            .send({
                name: 'Test User',
                email: uniqueEmail,
                password: 'password123'
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(res.body); // Log the response body to see the error details
                    return done(err);
                }
                expect(res.body).to.have.property('token');
                done();
            });
    });

    it('should login an existing user', (done) => {
        request(app)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('token');
                done();
            });
    });
});
