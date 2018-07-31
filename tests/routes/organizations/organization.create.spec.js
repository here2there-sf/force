import { expect } from 'chai';
import server from '../../utils/server.mock';
import User from '../../../app/models/user';
import Organization from '../../../app/models/organization';
import UserFactory from '../../factories/user.factory';
import OrganizationFactory from '../../factories/organization.factory';
import Util from '../../../app/lib/util';

const ENDPOINT = '/organization';
let testUser;
let testOrg;

describe(`POST ${ENDPOINT}`, () => {
  before(() => {
    return User.remove({})
      .then(() => Organization.remove({}))
      .then(() => User.create(UserFactory.generate()))
      .then(u => testUser = u);
  });

  beforeEach(() => {
    testOrg = OrganizationFactory.generate();
  });

  after(() => {
    return Organization.remove({})
      .then(() => User.remove({}));
  });

  describe('#201', () => {
    it('should send back organization details on create', (done) => {
      server.post(ENDPOINT)
        .set('Authorization', testUser.generateToken())
        .send(OrganizationFactory.generateValid())
        .end((err, res) => {
          const { body } = res;
          expect(res).to.have.status(Util.code.created);
          expect(res.body).to.exist;
          expect(res.body).to.have.keys(['alias', 'createdAt', 'email', 'id', 'type', 'updatedAt', 'user']);
          done();
        });
    });
  });

  describe('#400', () => {
    it('should send back bad if invalid credentials', (done) => {
      server.post(ENDPOINT)
        .set('Authorization', testUser.generateToken())
        .send(OrganizationFactory.generate())
        .end((err, res) => {
          const { body } = res;
          expect(res).to.have.status(Util.code.bad);
          expect(body.message).to.eql(Util.message.salesforce.loginError);
          done();
        });
    });
  });

  describe('#401', () => {
    it('should send back unauthorized if invalid token is provided', (done) => {
      server.post(ENDPOINT)
        .set('Authorization', 'invalid_jwt_token')
        .send(testOrg)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
