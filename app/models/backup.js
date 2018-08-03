import mongoose from 'mongoose';
import Util from '../lib/util';

const Schema = mongoose.Schema;

const BackupSchema = new Schema({
  startDate: {
    type: Date,
    default: new Date(),
  },
  frequency: {
    type: Number,
    default: Util.constant.week,
  },
  _organization: {
    type: Schema.Types.ObjectId,
    required: [true, 'Organization is required.'],
  },
}, {
  timestamps: true,
});

BackupSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id;
    delete obj._id;

    obj.organization = obj._organization;
    delete obj._organization;

    delete obj.__v;
    return obj;
  },
});

BackupSchema.statics = {
  async exists(id, next) {
    try {
      if (!id) {
        let err = new Error;
        err.message = Util.message.backup.notFound;
        err.status = Util.code.notFound;
        console.log(err);
        return next(err);
      }
      return await this.findById(id);
    } catch(err) {
      err.message = Util.message.backup.notFound;
      err.status = Util.code.notFound;
      console.log(err);
      next(err);
    }
  },

  async findByOrganization(organizations, id, next) {
    try {
      console.log(organizations);
      let orgObj = await Promise.all(organizations.map(async (obj) => {
        // eslint-disable-next-line new-cap,babel/new-cap
        return mongoose.Types.ObjectId(obj.id);
      })).then(async (objId) => {
        return objId;
      });

      return await this.findOne({ $and: [{ _organization: { $in: orgObj } }, { _id: id }] });
    } catch(err) {
      err.message = Util.message.backup.notFound;
      err.status = Util.code.notFound;
      console.log(err);
      next(err);
    }
  },

  async aggregateOrganizations(organizations) {
    let organizationObjectIds = await Promise.all(organizations.map(async (obj) => {
      // eslint-disable-next-line new-cap,babel/new-cap
      return mongoose.Types.ObjectId(obj.id);
    })).then(async (objId) => {
      return objId;
    });

    let backups = await this.aggregate([
      { $match: { _organization: { $in: organizationObjectIds } } },
      { $project: {
        '_id': false,
        'id': '$_id',
        '_organization': true,
        'frequency': true,
        'createdAt': true,
        'updatedAt': true,
      } },
    ]);

    // eslint-disable-next-line semi
    for await (const obj of backups) {
      obj.organization = organizations.find((org) => {
        return org.id === obj._organization.toString();
      });
    }

    return backups;
  },
};

const BackupModel = mongoose.model('Backup', BackupSchema);

export default BackupModel;
