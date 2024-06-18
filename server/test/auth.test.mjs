import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';

const { expect } = chai;
chai.use(chaiHttp);

describe('Auth', () => {
    it('should register a user', (done) => {
        chai.request(app)
            .post('/api/users/register')
            .send({
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                done();
            });
    });

    it('should login a user', (done) => {
        chai.request(app)
            .post('/api/users/login')
            .send({
                email: 'john.doe@example.com',
                password: 'password123'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                done();
            });
    });
});
