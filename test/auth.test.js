import dotenv from 'dotenv';
import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import User from '../server/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.test' });

let app;

const testUser = {
    name: `Existing Test User ${Date.now()}`,
    email: `existingtestuser${Date.now()}@example.com`,
    password: 'password123'
};

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

before(async function () {
    // Clean up the users collection before running tests
    await User.deleteMany({});

    // Create a test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    const user = new User({
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword
    });

    await user.save();
});

after(async function () {
    // Close the MongoDB connection after tests
    await mongoose.connection.close();
});

describe('Auth API', () => {
    it('should register a new user', (done) => {
        const uniqueEmail = `testuser${Date.now()}@example.com`; // Generate a unique email

        request(app)
            .post('/api/users/register')
            .send({
                name: `Test User ${Date.now()}`,
                email: uniqueEmail,
                confirmEmail: uniqueEmail, // Add confirmEmail
                password: 'password123' // Use the fixed password
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

    it('should not register an existing user', (done) => {
        request(app)
            .post('/api/users/register')
            .send({
                name: testUser.name,
                email: testUser.email,
                confirmEmail: testUser.email, // Add confirmEmail
                password: testUser.password // Use the fixed password
            })
            .expect(400) // Expecting a bad request response
            .end((err, res) => {
                if (err) {
                    console.log(res.body); // Log the response body to see the error details
                    return done(err);
                }
                expect(res.body).to.have.property('msg');
                expect(res.body.msg).to.equal('Taki mail już jest w bazie, użyj innego lub zaloguj się.');
                done();
            });
    });

    it('should login an existing user', (done) => {
        request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email, // Use the same email as the test user
                password: testUser.password // Use the fixed password
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