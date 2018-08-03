import BaseController from './base.controller';
import Metadata from '../models/metadata';
import AwsUtil from '../lib/aws.util';
import ForceUtil from '../lib/force.util';
import ApiUtil from '../lib/api.util';
import Util from '../lib/util';
import mongoose from 'mongoose';


class MetadataController extends BaseController {
  listMetadataTypes = async (req, res, next) => {
    try {
      let organization;
      if (req.body.id) {
        organization = await ApiUtil.organizationExists(req.headers.authorization, req.body.id);
        if(!organization) {
          let err = new Error();
          err.message = Util.message.organization.notFound;
          err.status = Util.code.notFound;
          console.log(err);
          return next(err);
        }
      } else {
        organization = await ForceUtil.authenticate(req.body, next);
        if (!organization) return;
      }

      console.log('Fetching Metadata...');
      const metadataObjects = await ForceUtil.describeMetadata(organization.oauth2, next);
      res.json(metadataObjects);
    } catch(err) {
      console.log(err);
      next(err);
    }
  };

  /** *
   * Fetch all metadata from the users organization
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * */
  fetchOneOffPulls = async (req, res, next) => {
    try {
      const organizations = await ApiUtil.getOrganizations(req.headers.authorization);

      let metadata = await Metadata.aggregateOrganizations(organizations, next);

      metadata = await Promise.all(metadata.map(async (obj) => {
        obj.organization = await organizations.find(async (org) => {
          return mongoose.Types.ObjectId(org.id) === obj._organization;
        });
        return obj;
      }));

      res.json(metadata);
    } catch(err) {
      console.log(err);
      err.status = err.name ==='CastError' ? 404 : 500;
      next(err);
    }
  };

  /** *
   * Generate a signed url for metadata access on S3
   * Url expiry is set in Constants
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * */
  generateS3Url = async (req, res, next) => {
    try {
      let url = await AwsUtil.generateSignedUrl(req.body.key);
      res.json(url);
    } catch(err) {
      console.log(err);
      next(err);
    }
  }
}

export default new MetadataController();
