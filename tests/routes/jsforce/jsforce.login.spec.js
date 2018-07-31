import * as chai from 'chai';
import server from '../../utils/server.mock';
import Util from '../../../app/lib/util';
import User from '../../../app/models/user';
import Organization from '../../../app/models/organization';
import OrganizationFactory from "../../factories/organization.factory";
import UserFactory from "../../factories/user.factory";
const expect = chai.expect;

const ENDPOINT = '/metadata/list';
let testOrg;
let testUser;

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

  describe('#404', () => {
    it('should send back bad if organization does not exist', (done) => {
      server.post(ENDPOINT)
        .set('Authorization', testUser.generateToken())
        .send({'id': 'id_dne'})
        .end((err, res) => {
          const { body } = res;
          expect(res).to.have.status(Util.code.notFound);
          expect(body.message).to.eql(Util.message.organization.notFound);
          done();
        });
    });
  });
});
