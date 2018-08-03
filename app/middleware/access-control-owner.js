import authenticate from './authenticate';
import Metadata from '../models/metadata';
import Backup from '../models/backup';
import Util from '../lib/util';
import ApiUtil from '../lib/api.util';

class AccessControlOwner {
  // Organization owner access control
  organization = () => {
    return (req, res, next) => authenticate(req, res, async (err) => {
      try {
        if (err) return next(err);

        req.currentUser.organization = await ApiUtil.organizationExists(req.headers.authorization,
          req.body.organization_id);
        next();
      } catch(err) {
        err.message = Util.message.organization.notFound;
        err.status = Util.code.notFound;
        next(err);
      }
    });
  };

  // Metadata owner access control
  metadata = () => {
    return (req, res, next) => authenticate(req, res, async (err) => {
      // error when _id dne
      const organizations = await ApiUtil.getOrganizations(req.headers.authorization);
      const allowed = await Metadata.findByOrganization(organizations, req.body.id, next);

      if (err || !req.currentUser || !allowed) {
        res.sendStatus(Util.code.bad);
        return;
      }
      next();
    });
  };

  // Backup owner access control
  backup = () => {
    return (req, res, next) => authenticate(req, res, async (err) => {
      // error when _id dne
      const organizations = await ApiUtil.getOrganizations(req.headers.authorization);
      const allowed = await Backup.findByOrganization(organizations, req.body.id, next);

      if (err || !organizations || !allowed) {
        res.sendStatus(Util.code.bad);
        return;
      }
      next();
    });
  };

  // Push access control
  push = () => {
    return (req, res, next) => authenticate(req, res, async (err) => {
      // error when id dne
      req.organization = await ApiUtil.organizationExists(req.headers.authorization, req.body.organization_id);
      const allowed = await Metadata.findByOrganization(new Array(req.organization.organization), req.body.id, next);

      if (err || !req.organization || !allowed) {
        res.sendStatus(Util.code.bad);
        return;
      }
      next();
    });
  };
}

export default new AccessControlOwner();
