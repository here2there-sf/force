import BaseController from './base.controller';
import ForceUtil from '../lib/force.util';
import ApiUtil from '../lib/api.util';
import Util from '../lib/util';
import Metadata from '../models/metadata';


class JSForceController extends BaseController {
  checkRetrieveStatusWhiteList = [
    'pull_id',
    'organization_id',
  ];
  checkDeployStatusWhiteList = [
    'push_id',
    'organization_id',
    'metadata_id',
  ];

  constructor() {
    super();
  }

  push = async (req, res, next) => {
    try {
      let metadata = req.metadata;
      let organization = req.organization;
      const pushRequest = await ForceUtil.pushMetadata(organization, metadata, next);
      res.json(pushRequest);
    } catch(err) {
      next(err);
    }
  };

  // organization is populated in middleware
  pull = async (req, res, next) => {
    try {
      console.log('Pulling metadata.');
      const organization = req.currentUser.organization;
      const pullRequest = await ForceUtil.pullMetadata(req.body.package, organization.oauth2, next);

      res.json(pullRequest);
    } catch(err) {
      console.log(err);
      next(err);
    }
  };

  /**
   * Controller for async checks on metadata retrieval status
   *
   * Metadata retrieval is async. Salesforce must be pinged periodically
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @public
   */
  checkRetrieveStatus = async (req, res, next) => {
    try {
      const params = this.filterParams(req.body, this.checkRetrieveStatusWhiteList);

      const organization = req.currentUser.organization;

      let retrieveStatus = await ForceUtil.checkRetrieveStatus(req, organization, params.pull_id, next);
      res.status(retrieveStatus.code).json(retrieveStatus.body);
    } catch(err) {
      console.log(err);
      next(err);
    }
  };

  checkDeployStatus = async (req, res, next) => {
    try {
      const params = this.filterParams(req.body, this.checkDeployStatusWhiteList);
      const organization = req.organization;

      let deployStatus = await ForceUtil.checkDeployStatus(organization, params.push_id, next);
      res.status(deployStatus.code).json(deployStatus.body);
    } catch(err) {
      console.log(err);
      next(err);
    }
  };
}

export default new JSForceController();
