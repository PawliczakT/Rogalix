import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import request from 'supertest';
import { expect } from 'chai';

let app;
let token;
const uniqueEmail = `testuser${Date.now()}@example.com`; // Generate a unique email

before(async () => {
    const importedApp = await import('../server/app.js'); // Use dynamic import
    app = importedApp.default; // Access the default export

    // Register and login to get token
    await request(app)
        .post('/api/users/register')
        .send({
            name: 'Test User',
            email: uniqueEmail,
            password: 'password123'
        });

    await request(app)
        .post('/api/users/login')
        .send({
            email: uniqueEmail,
            password: 'password123'
        })
        .then(res => {
            token = res.body.token;
        });
});

describe('Rogals API', () => {
    const uniqueRogalName = `Test Rogal ${Date.now()}`; // Generate a unique rogal name

    it('should add a new rogal', (done) => {
        request(app)
            .post('/api/rogals')
            .set('Authorization', `Bearer ${token}`)
            .field('name', uniqueRogalName)
            .field('description', 'Test Description')
            .field('price', '12.50')
            .field('weight', '250')
            .attach('image', 'uploads/rogal.png') // Ensure this path is correct and image exists
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
            .attach('image', 'uploads/rogal.png') // Ensure this path is correct and image exists
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