import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import request from 'supertest';
import { expect } from 'chai';

let app;

before(async function () {
    this.timeout(10000); // Increase timeout to 10 seconds

    try {
        console.log("Environment Variables:");
        console.log("AWS_REGION:", process.env.AWS_REGION);
        console.log("MONGO_URI:", process.env.MONGO_URI);

        const importedApp = await import('../server/app.js'); // Use dynamic import
        app = importedApp.default; // Access the default export
    } catch (error) {
        console.error("App import failed:", error);
        throw error;
    }
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
                email: uniqueEmail, // Use the same unique email generated above
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
});
