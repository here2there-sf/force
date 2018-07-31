import Constants from '../config/constants';
import Util from '../lib/util';
import request from 'request';

class ApiUtil {
  constructor() {}

  method = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    delete: 'DELETE',
  };

  organizationExists = (authorization, id) => {
    return new Promise((resolve, reject) => {
      let options = {
        url: Constants.api.organization.base + Constants.api.organization.getOne + id,
        method: this.method.get,
        headers: {
          'Authorization': authorization,
        },
      };

      request(options, (err, response, body) => {
        if(err) {
          console.log(err);
          return reject(new Error());
        }
        if(response.statusCode === Util.code.forbidden || response.statusCode === Util.code.notFound) {
          return reject(new Error());
        }
        resolve(JSON.parse(body));
      });
    });
  };

  getOrganizations = (authorization) => {
    return new Promise((resolve) => {
      let options = {
        url: Constants.api.organization.base + Constants.api.organization.getAll,
        method: this.method.get,
        headers: {
          'Authorization': authorization,
        },
      };

      request(options, (err, response, body) => {
        if(err) {
          console.log(err);
          return resolve(null);
        }
        if(response.statusCode === Util.code.forbidden || response.statusCode === Util.code.notFound) {
          return resolve(null);
        }

        resolve(JSON.parse(body));
      });
    });
  };
}

export default new ApiUtil();
