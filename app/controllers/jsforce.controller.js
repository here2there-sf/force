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
    'org_id',
  ];

  constructor() {
    super();
  }

  push = async (req, res, next) => {
    try {
      console.log(req.headers);
      const organization = await ApiUtil.organizationExists(req.headers, req.body.organization_id);
      if(!organization) return;

      const metadata = await Metadata.exists(req.body.metadata_id, next);
      if(!metadata) return;

      const loggedIn = await ForceUtil.login(organization, next);
      if (!loggedIn) return;

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
      console.log(params);

      const organization = await ApiUtil.organizationExists(req.headers, req.body.organization_id);
      if(!organization) return;

      let deployStatus = await ForceUtil.checkDeployStatus(organization, params.push_id, next);
      res.status(deployStatus.code).json(deployStatus.body);
    } catch(err) {
      console.log(err);
      next(err);
    }
  };
}

export default new JSForceController();
