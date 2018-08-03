import BaseController from './base.controller';
import Backup from '../models/backup';
import Util from '../lib/util';
import ApiUtil from '../lib/api.util';

class BackupController extends BaseController {
  whitelist = ['frequency', 'organization', 'startDate'];
  deleteWhiteList = ['id'];

  create = async (req, res, next) => {
    try {
      let params = this.filterParams(req.body, this.whitelist);
      await ApiUtil.organizationExists(req.headers.authorization, params.organization);

      let backup = new Backup({
        ...params,
        _organization: params.organization,
      });

      res.status(Util.code.created).json(await backup.save());
    } catch(err) {
      next(err);
    }
  };

  /** *
   * Fetch all backups
   *
   * @param {Object} req
   * @param {Object} res
   * @param {function} next
   * */
  fetch = async (req, res, next) => {
    try {
      const organizations = await ApiUtil.getOrganizations(req.headers.authorization);
      let backups = await Backup.aggregateOrganizations(organizations, next);
      res.json(backups);
    } catch(err) {
      next(err);
    }
  };

  /** *
   * @param {Object} req
   * @param {Object} res
   * @param {function} next
   * */
  delete = async (req, res, next) => {
    try {
      const params = this.filterParams(req.body, this.deleteWhiteList);
      await Backup.remove({ _id: params.id });
      res.sendStatus(Util.code.deleted);
    } catch(err) {
      next(err);
    }
  };
}

export default new BackupController();
