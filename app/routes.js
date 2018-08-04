import { Router } from 'express';

import MetadataController from './controllers/metadata.controller';
import BackupController from './controllers/backup.controller';
import JSForceController from './controllers/jsforce.controller';
import authenticate from './middleware/authenticate';
import AccessControlOwner from './middleware/access-control-owner';
import errorHandler from './middleware/error-handler';

const routes = new Router();

// JSForce
routes.post('/one-off/pull', AccessControlOwner.organization(), JSForceController.pull);
routes.post('/one-off/push', AccessControlOwner.push(), JSForceController.push);
routes.post('/one-off/status/retrieve', AccessControlOwner.organization(), JSForceController.checkRetrieveStatus);
routes.post('/one-off/status/deploy', AccessControlOwner.push(), JSForceController.checkDeployStatus);

// Metadata
routes.get('/metadata', authenticate, MetadataController.fetchOneOffPulls);
routes.post('/metadata/list', authenticate, MetadataController.listMetadataTypes);
routes.post('/metadata/download', AccessControlOwner.metadata(), MetadataController.generateS3Url);

// Backup
routes.post('/backup', authenticate, BackupController.create);
routes.get('/backups', authenticate, BackupController.fetch);
routes.delete('/backup', AccessControlOwner.backup(), BackupController.delete);

routes.use(errorHandler);

export default routes;
