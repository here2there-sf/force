import faker from 'faker';
import Constants from '../../app/config/constants';

class OrganizationFactory {
  generateList(count, attrs = {}) {
    let list = [];
    while(count) {
      list.push(this.generate(attrs));
      count--;
    }
    return list;
  }

  generate(attrs) {
    return Object.assign({}, {
      alias: faker.company.companyName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      type: faker.commerce.productName(),
      securitytoken: faker.finance.account(),
    }, attrs);
  }

  generateValid() {
    return {
      alias: faker.company.companyName(),
      email: Constants.salesforce.email,
      password: Constants.salesforce.password,
      securitytoken: Constants.salesforce.securitytoken,
      type: 'production',
    };
  }
}

export default new OrganizationFactory();
