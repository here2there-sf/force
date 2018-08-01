import { Router } from 'express';

import MetadataController from './controllers/metadata.controller';
import JSForceController from './controllers/jsforce.controller';
import authenticate from './middleware/authenticate';
import AccessControlOwner from './middleware/access-control-owner';
import errorHandler from './middleware/error-handler';

const routes = new Router();

// JSForce
routes.post('/one-off/pull', AccessControlOwner.organization(), JSForceController.pull);
routes.post('/one-off/push', AccessControlOwner.metadata(), JSForceController.push);
routes.post('/one-off/status/retrieve', AccessControlOwner.organization(), JSForceController.checkRetrieveStatus);
routes.post('/one-off/status/deploy', authenticate, JSForceController.checkDeployStatus);

// Metadata
routes.get('/metadata', authenticate, MetadataController.fetchOneOffPulls);
routes.post('/metadata/list', authenticate, MetadataController.listMetadataTypes);
routes.post('/metadata/download', AccessControlOwner.metadata(), MetadataController.generateS3Url);

routes.use(errorHandler);

export default routes;
