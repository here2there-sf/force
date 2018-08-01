/* eslint-disable new-cap,babel/new-cap */
import mongoose from 'mongoose';
import Util from '../lib/util';
const Schema = mongoose.Schema;

const MetadataSchema = new Schema({
  key: {
    type: String,
    required: [true, 'Key is required.'],
  },
  type: {
    type: String,
    required: [true, 'Type is required.'],
  },
  _organization: {
    type: Schema.Types.ObjectId,
    required: [true, 'Organization is required.'],
  },
  _expiry: {
    type: Date,
    expires: Util.constant.day,
    default: Date.now(),
  },
}, {
  timestamps: true,
});

MetadataSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id;
    delete obj._id;

    obj.organization = obj._organization;
    delete obj._organization;

    obj.expiresAt = new Date(obj._expiry.setTime(obj._expiry.getTime() + Util.constant.day));
    delete obj._expiry;

    delete obj.__v;
    return obj;
  },
});


MetadataSchema.statics = {
  async exists(id, next) {
    try {
      if (!id) {
        let err = new Error;
        err.message = Util.message.metadata.notFound;
        err.status = Util.code.notFound;
        console.log(err);
        return next(err);
      }
      return await this.findById(id);
    } catch(err) {
      err.message = Util.message.metadata.notFound;
      err.status = Util.code.notFound;
      console.log(err);
      next(err);
    }
  },

  async aggregateOrganizations(organizations) {
    let orgObj = await Promise.all(organizations.map(async (obj) => {
      return mongoose.Types.ObjectId(obj.id);
    })).then(async (objId) => {
      return objId;
    });

    return await this.aggregate([
      { $match: { _organization: { $in: orgObj }, type: 'one-off' } },
      { $addFields: { 'organization': await organizations.find(async (org) => {
        return mongoose.Types.ObjectId(org.id) === '$_organization';
      }) } },
      { $project: {
        '_id': false,
        'id': '$_id',
        'expiry': '$_expiry',
        'key': '$key',
        'type': '$type',
        '_organization': '$_organization',
        'organization': '$organization',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
      } },
    ]);
  },

  async findByOrganization(organizations, id, next) {
    try {
      let orgObj = await Promise.all(organizations.map(async (obj) => {
        return mongoose.Types.ObjectId(obj.id);
      })).then(async (objId) => {
        return objId;
      });

      return await this.findOne({ $and: [{ _organization: { $in: orgObj } }, { _id: id }] });
    } catch(err) {
      err.message = Util.message.metadata.notFound;
      err.status = Util.code.notFound;
      console.log(err);
      next(err);
    }
  },
};

const MetadataModel = mongoose.model('Metadata', MetadataSchema);

export default MetadataModel;
