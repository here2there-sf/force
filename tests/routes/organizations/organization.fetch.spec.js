import { expect } from 'chai';
import server from '../../utils/server.mock';
import User from '../../../app/models/user';
import Organization from '../../../app/models/organization';
import UserFactory from '../../factories/user.factory';
import OrganizationFactory from "../../factories/organization.factory";

const ENDPOINT = '/organizations';

let testUser;
let testOrg;

describe(`GET ${ENDPOINT}`, () => {
  before(() => {
    return User.remove({})
      .then(Organization.remove({}))
      .then(() => User.create(UserFactory.generate()))
      .then(u => testUser = u)
      .then(() => OrganizationFactory.generate())
      .then(o => {
        o._user = testUser.id;
        Organization.create(o)
      })
      .then(o => testOrg = o);
  });

  after(() => {
    return Organization.remove({})
      .then(() => User.remove({}));
  });

  describe('#401', () => {
    it('should return Unauthorized if wrong token is provided', done => {
      server.get(`${ENDPOINT}`)
        .set('Authorization', 'wrongtoken')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
  describe('#200', () => {
    it('it should return organizations', done => {
      server.get(`${ENDPOINT}`)
        .set('Authorization', testUser.generateToken())
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an.instanceOf(Array);
          res.body.forEach(o => expect(o).to.have.keys(['alias', 'createdAt', 'email', 'id', 'type', 'updatedAt', 'user']));
          done();
        });
    });
  });
});
