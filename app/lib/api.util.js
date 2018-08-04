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
          return reject(err);
        }
        if(response.statusCode === Util.code.forbidden) {
          let error = new Error();
          error.message = Util.message.backup.retrieveProblem;
          error.status = Util.code.forbidden;
          return reject(error);
        } else if(response.statusCode === Util.code.notFound) {
          let error = new Error();
          error.message = Util.message.organization.notFound;
          error.status = Util.code.notFound;
          return reject(error);
        }
        resolve(JSON.parse(body));
      });
    });
  };

  getOrganizations = (authorization) => {
    return new Promise((resolve, reject) => {
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
          return reject(err);
        }
        if(response.statusCode === Util.code.forbidden || response.statusCode === Util.code.notFound) {
          let error = new Error(response);
          error.message = Util.message.backup.retrieveProblem;
          error.status = response.statusCode;
          return reject(error);
        }
        resolve(JSON.parse(body));
      });
    });
  };
}

export default new ApiUtil();
