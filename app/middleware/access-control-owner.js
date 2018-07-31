import authenticate from './authenticate';
import Metadata from '../models/metadata';
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

      const allowed = await Metadata.findByOrganization(organizations, req.body.key, next);

      if (err || !req.currentUser || !allowed) {
        res.sendStatus(Util.code.bad);
        return;
      }
      next();
    });
  };

  // Push access control
  push = () => {
    return (req, res, next) => authenticate(req, res, async (err) => {
      // Metadata organization is owned by user
      req.metadata = await Metadata.findOne({
        $and: [
          { _id: req.body.metadata_id },
          { _organization: { $in: req.organizations } },
        ],
      });

      // Destination organization is owned by user
      req.destination = await ApiUtil.organizationExists(req.headers.authorization, req.body.organization_id);

      if (err || !req.currentUser || !req.metadata || !req.destination) {
        res.sendStatus(Util.code.bad);
        return;
      }
      next();
    });
  };
}

export default new AccessControlOwner();
