/* eslint-disable babel/new-cap,new-cap */
import Constants from '../config/constants';
let aws = require('aws-sdk');

class AwsUtil {
  constructor() {
    aws.config.update({
      accessKeyId: Constants.aws.access_key_id,
      secretAccessKey: Constants.aws.secret_access_key,
    });
  }

  /** *
   * Upload a one-off pull request to S3
   *
   * @param {string} uid - user id of the user uploading the one off pull.
   * @param {string} oid - organization id of the metadata.
   * @param {string} zip - base64 encoded string representation of metadata zip.
   * @return {Promise<AWS.S3.ManagedUpload>}
   * @public
   * */
  uploadOneOffPull = async (uid, oid, zip) => {
    let filename = await this._generateId(uid, oid);
    let key = Constants.aws.folder.oneOffPull + filename;
    let file = new Buffer.from(zip, 'base64');
    let s3 = new aws.S3({
      params: {
        Bucket: Constants.aws.s3_bucket,
        Key: key,
      },
    });
    return {
      key: key,
      promise: s3.upload({
        Body: file,
        ContentType: 'application/zip',
      }).promise(),
    };
  };

  getObject = async (key) => {
    console.log(key);
    let s3 = new aws.S3();
    return s3.getObject({
      Bucket: Constants.aws.s3_bucket,
      Key: key,
    }).promise();
  };

  generateSignedUrl = async (key) => {
    return new Promise((resolve, reject) => {
      let s3 = new aws.S3();
      s3.getSignedUrl('getObject', {
        Bucket: Constants.aws.s3_bucket,
        Key: key,
        Expires: Constants.aws.s3_url_expiry,
      }, (err, url) => {
        resolve(url);
      });
    });
  };

  uploadBackup = async (uid, oid, zip) => {
    try {
      let filename = await this._generateId(uid, oid);
      let key = Constants.aws.folder.backup + filename;
      let file = new Buffer.from(zip, 'base64');
      let s3 = new aws.S3({
        params: {
          Bucket: Constants.aws.s3_bucket,
          Key: key,
        },
      });
      return {
        key: key,
        promise: await s3.upload({
          Body: file,
          ContentType: 'application/zip',
        }).promise(),
      };
    } catch(err) {
      console.log(err);
    }
  };

  /** *
   * HELPER
   * Returns a random id for S3 storage in the form:
   * /{random_string}_{uid}_{oid}
   *
   * @param {string} uid - user id
   * @param {string} oid - organization id
   * @return {Promise<String>}
   * @private
   */
  _generateId = async (uid, oid) => {
    return new Promise((resolve) => {
      let str = '/';
      let set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 32; i++) {
        str += set.charAt(Math.floor(Math.random() * set.length));
        if (i === 31) {
          resolve(str + '_' + uid + '_' + oid);
        }
      }
    });
  };
}

export default new AwsUtil();
