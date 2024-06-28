import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import request from 'supertest';
import { expect } from 'chai';

let app;
let token;

before(async () => {
    const importedApp = await import('../server/app.js'); // Use dynamic import
    app = importedApp.default; // Access the default export

    // Login to get token
    await request(app)
        .post('/api/users/login')
        .send({
            email: 'testuser@example.com',
            password: 'password123'
        })
        .then(res => {
            token = res.body.token;
        });
});

describe('Rogals API', () => {
    const uniqueRogalName = `Test Rogal ${Date.now()}`; // Generate a unique roagal name
    it('should add a new rogal', (done) => {
        request(app)
            .post('/api/rogals')
            .set('Authorization', `Bearer ${token}`)
            .field('name', uniqueRogalName)
            .field('description', 'Test Description')
            .field('price', '12.50')
            .field('weight', '250')
            .attach('image', 'uploads/rogal.png') // podaj prawidłową ścieżkę do obrazu
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('_id');
                done();
            });
    });

    it('should get all rogals', (done) => {
        request(app)
            .get('/api/rogals')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                done();
            });
    });
});
