import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import request from 'supertest';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import path from 'path';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app;
let token;
const uniqueEmail = `testuser${Date.now()}@example.com`; // Generate a unique email

before(async function () {
    this.timeout(20000); // Increase the timeout to 20 seconds

    try {
        console.log("Importing app...");
        const importedApp = await import('../server/app.js'); // Use dynamic import
        app = importedApp.default; // Access the default export
        console.log("App imported successfully.");

        // Register and login to get token
        console.log("Registering user...");
        await request(app)
            .post('/api/users/register')
            .send({
                name: 'Test User',
                email: uniqueEmail,
                password: 'password123'
            });
        console.log("User registered.");

        console.log("Logging in user...");
        await request(app)
            .post('/api/users/login')
            .send({
                email: uniqueEmail,
                password: 'password123'
            })
            .then(res => {
                token = res.body.token;
                console.log("User logged in. Token obtained.");
            });

        console.log("Setup complete.");
    } catch (error) {
        console.error("Setup failed:", error);
        throw error;
    }
});

describe('Rogals API', function () {
    this.timeout(20000); // Increase the timeout for the test suite to 20 seconds

    const uniqueRogalName = `Test Rogal ${Date.now()}`; // Generate a unique rogal name

    it('should add a new rogal', (done) => {
        request(app)
            .post('/api/rogals')
            .set('Authorization', `Bearer ${token}`)
            .field('name', uniqueRogalName)
            .field('description', 'Test Description')
            .field('price', '12.50')
            .field('weight', '250')
            .attach('image', path.join(__dirname, 'uploads', 'rogal.jpg')) // Ensure this path is correct and image exists
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(res.body); // Log the response body to see the error details
                    return done(err);
                }
                expect(res.body).to.have.property('_id');
                done();
            });
    });

    it('should get all rogals', (done) => {
        request(app)
            .get('/api/rogals')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    console.log(res.body); // Log the response body to see the error details
                    return done(err);
                }
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should not add a rogal with the same name twice', (done) => {
        request(app)
            .post('/api/rogals')
            .set('Authorization', `Bearer ${token}`)
            .field('name', uniqueRogalName) // Use the same name as the first test
            .field('description', 'Another Description')
            .field('price', '15.00')
            .field('weight', '300')
            .attach('image', path.join(__dirname, 'uploads', 'rogal.jpg')) // Ensure this path is correct and image exists
            .expect(400) // Expecting a 400 Bad Request error
            .end((err, res) => {
                if (err) {
                    console.log(res.body); // Log the response body to see the error details
                    return done(err);
                }
                expect(res.body).to.have.property('msg').that.equals('A rogal with this name already exists');
                done();
            });
    });
});
