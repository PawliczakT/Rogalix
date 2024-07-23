import dotenv from 'dotenv';
import request from 'supertest';
import {expect} from 'chai';
import mongoose from 'mongoose';
import Rogal from '../server/models/Rogal.js';
import User from '../server/models/User.js';

dotenv.config({path: '.env.test'});

let app;
let token1, token2, user1, user2;

before(async function () {
    this.timeout(20000); // Increase timeout to 20 seconds

    try {
        const importedApp = await import('../server/app.js'); // Use dynamic import
        app = importedApp.default; // Access the default export

        // Register and login first user
        await request(app)
            .post('/api/users/register')
            .send({
                name: 'User 1',
                email: 'user1@example.com',
                password: 'password123',
                confirmEmail: 'user1@example.com'
            });

        await request(app)
            .post('/api/users/login')
            .send({
                email: 'user1@example.com',
                password: 'password123'
            })
            .then(res => {
                token1 = res.body.token;
            });

        user1 = await User.findOne({email: 'user1@example.com'});

        // Register and login second user
        await request(app)
            .post('/api/users/register')
            .send({
                name: 'User 2',
                email: 'user2@example.com',
                password: 'password123',
                confirmEmail: 'user2@example.com'
            });

        await request(app)
            .post('/api/users/login')
            .send({
                email: 'user2@example.com',
                password: 'password123'
            })
            .then(res => {
                token2 = res.body.token;
            });

        user2 = await User.findOne({email: 'user2@example.com'});

        // Add some rogals
        const rogal1 = new Rogal({
            name: 'Rogal 1',
            description: 'Test Description',
            price: 10,
            weight: 200,
            user: user1._id,
            ratings: [
                {user: user1._id, rating: 5},
                {user: user2._id, rating: 4},
            ]
        });
        await rogal1.save();

        const rogal2 = new Rogal({
            name: 'Rogal 2',
            description: 'Test Description',
            price: 12,
            weight: 250,
            user: user2._id,
            ratings: [
                {user: user1._id, rating: 3},
                {user: user2._id, rating: 2},
            ]
        });
        await rogal2.save();
    } catch (error) {
        console.error("Setup failed:", error);
        throw error;
    }
});

after(async () => {
    // Cleanup database
    await User.deleteMany({});
    await Rogal.deleteMany({});
    await mongoose.connection.close();
});

describe('TasteMatrix API', () => {
    it('should return the taste matrix comparing user tastes', (done) => {
        request(app)
            .get('/api/gustometr')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body['User 1']['User 2']).to.exist;
                expect(res.body['User 2']['User 1']).to.exist;
                done();
            });
    });
});