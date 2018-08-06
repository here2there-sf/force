import Util from './util';
import Constants from '../config/constants';
import AwsUtil from './aws.util';
import Metadata from '../models/metadata';
import jsforce from 'jsforce';


class ForceUtil {
  BLACKED_LISTED_METADATA_TYPES = ['layouts', 'workflows', 'quickActions'];

  authenticate = async (params, next) => {
    let conn = new jsforce.Connection();
    try {
      await conn.login(params.email, params.password + params.securityToken);
    } catch(err) {
      err.message = Util.message.salesforce.loginError;
      err.status = Util.code.bad;
      next(err);
    }
  };

  /** *
   * HELPER
   * Login to Salesforce
   *
   * @param {object} oauth2
   * @param {function} next
   * @return {Promise<UserInfo|*>}
   * */
  loginOauth2 = async (oauth2, next) => {
    try {
      return new jsforce.Connection({
        instanceUrl: oauth2.instanceUrl,
        accessToken: oauth2.accessToken,
      });
    } catch(err) {
      err.message = Util.message.salesforce.loginError;
      err.status = Util.code.bad;
      console.log(err);
      next(err);
    }
  };

  generatePackage = async (types) => {
    let packageXml = {
      types: [],
      version: Constants.salesforce.metadata.version,
    };
    for(let i = 0; i < types.length; i++) {
      if(types[i] !== 'EmailTemplate'
        && types[i] !== 'Report'
        && types[i] !== 'Document'
        && types[i] !== 'Dashboard') {
        packageXml.types.push({
          members: '*',
          name: types[i],
        });
      }
    }
    return packageXml;
  };

  pullMetadata = async (types, organization, next) => {
    let conn;
    try {
      conn = await this.loginOauth2(organization, next);
      if (!conn) return;
      let packageXml = await this.generatePackage(types);
      return conn.metadata.retrieve( { unpackaged: packageXml } ).then(function(pullRequest) {
        return pullRequest;
      }, (err) => {
        console.log(err);
        return next(err);
      });
    } catch(err) {
      console.log(err);
      next(err);
    } finally {
      conn.logout();
    }
  };

  pushMetadata = async (organization, metadata, next) => {
    let conn = await this.loginOauth2(organization.oauth2, next);
    if (!conn) return;
    let dataBuffer = await AwsUtil.getObject(metadata.key);
    let options = {
      rollbackOnError: true,
      autoUpdatePackage: true,
    };

    return conn.metadata.deploy(dataBuffer.Body, options).then((status) => {
      console.log(status);
      conn.logout();
      return status;
    }, (err) => {
      console.log(err);
      conn.logout();
      return next(err);
    });
  };

  /** *
   * HELPER
   * Utility to call JsForce Metadata API Check Retrieve Status
   *
   * @param {object} req
   * @param {object} params
   * @param {string} sid - status id
   * @param {function} next
   * @return {Promise<Object>}
   * */
  checkRetrieveStatus = async (req, params, sid, next) => {
    console.log('Checking status for Retrieve Request: ' + sid);

    let conn;
    try {
      conn = await this.loginOauth2(params.oauth2, next);
      if (!conn) return;

      let status = await conn.metadata.checkRetrieveStatus(sid);

      // todo add checking for other return types and errors
      if (status.done === 'true') {
        let bucketObject = await AwsUtil.uploadOneOffPull(req.currentUser._id, params.organization.id, status.zipFile);
        // create new metadata record
        let metadata = await new Metadata({
          key: bucketObject.key,
          type: 'one-off',
          _organization: params.organization.id,
        });
        return {
          code: Util.code.created,
          body: await metadata.save(),
        };
      } else {
        return {
          code: Util.code.ok,
          body: status,
        };
      }
    } catch (err) {
      console.log(err);
      next(err);
    } finally {
      conn.logout();
    }
  };

  /** *
   * HELPER
   * Utility to call JsForce Metadata API Check Deploy Status
   *
   * @param {object} params
   * @param {string} id - status id
   * @param {function} next
   * @return {Promise<Object>}
   * */
  checkDeployStatus = async (params, id, next) => {
    let conn;
    try {
      conn = await this.loginOauth2(params.oauth2, next);
      if (!conn) return;

      console.log('Checking status for Deploy Request: ' + id);
      let status = await conn.metadata.checkDeployStatus(id, true);
      // todo add checking for other return types and errors
      return {
        code: Util.code.ok,
        body: status,
      };
    } catch(err) {
      console.log(err);
      next(err);
    } finally {
      conn.logout();
    }
  };

  describeMetadata = async (organization, next) => {
    let conn = await this.loginOauth2(organization, next);
    if (!conn) return;
    let self = this;

    if (!conn) {
      return next();
    }

    return await conn.metadata.describe('39.0').then(function(jsRes) {
      conn.logout();
      return new Promise((resolve) => {
        let types = [];
        for (let i = 0; i < jsRes.metadataObjects.length; i++) {
          if (!(self.BLACKED_LISTED_METADATA_TYPES.indexOf(jsRes.metadataObjects[i].directoryName) > -1)) {
            types.push(jsRes.metadataObjects[i]);
          }
          if (i === jsRes.metadataObjects.length - 1) {
            resolve(types);
          }
        }
      });
    });
  };

  /**
   * BACKUPS
   * */
  backupMetadata = async (organization, types, next) => {
    let conn;
    try {
      conn = await this.loginOauth2(organization.oauth2, next);
      if (!conn) return;
      let packageXml = await this.generatePackage(types);
      return conn.metadata.retrieve( { unpackaged: packageXml } ).then(function(pullRequest) {
        return pullRequest;
      }, (err) => {
        console.log(err);
        return next(err);
      });
    } catch(err) {
      console.log(err);
      next(err);
    }
  };

  checkBackupStatus = async (organization, sid, next) => {
    let conn;
    try {
      conn = await this.loginOauth2(organization.oauth2, next);
      if (!conn) return;

      let status = await conn.metadata.checkRetrieveStatus(sid);
      console.log(status);
      // todo add checking for other return types and errors
      if (status.done === 'true') {
        let bucketObject = await AwsUtil.uploadBackup(organization.organization.user, organization.organization.id, status.zipFile);
        // create new metadata record
        let metadata = await new Metadata({
          key: bucketObject.key,
          type: 'backup',
          _organization: organization.organization.id,
        });
        return {
          code: Util.code.created,
          body: await metadata.save(),
        };
      } else {
        return {
          code: Util.code.ok,
          body: status,
        };
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

export default new ForceUtil();
