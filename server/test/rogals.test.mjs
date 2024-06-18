import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import fs from 'fs';
import path from 'path';

const { expect } = chai;
chai.use(chaiHttp);

let token;

describe('Rogals', () => {
    before((done) => {
        // Login user and get token
        chai.request(app)
            .post('/api/users/login')
            .send({
                email: 'john.doe@example.com',
                password: 'password123'
            })
            .end((err, res) => {
                token = res.body.token;
                done();
            });
    });

    it('should add a new rogal', (done) => {
        chai.request(app)
            .post('/api/rogals')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Rogal Świętomarciński')
            .field('description', 'Tradycyjny rogal z białym makiem')
            .field('rating', '5')
            .field('comment', 'Bardzo smaczny!')
            .attach('image', fs.readFileSync(path.resolve('path_to_image_file')), 'image_file_name')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('_id');
                done();
            });
    });

    it('should get all rogals', (done) => {
        chai.request(app)
            .get('/api/rogals')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('array');
                done();
            });
    });

    it('should get rogal statistics', (done) => {
        chai.request(app)
            .get('/api/rogals/statistics')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('totalRogals');
                expect(res.body).to.have.property('totalRatings');
                expect(res.body).to.have.property('averageRating');
                done();
            });
    });
});
