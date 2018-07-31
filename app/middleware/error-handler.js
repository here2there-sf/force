import Constants from '../config/constants';
import Util from '../lib/util';

export default function errorHandler(err, req, res, next) {
  if (!err) {
    return res.sendStatus(Util.code.internalServerError);
  }

  const error = {
    message: err.message || Util.message.internalServerError,
  };

  if (Constants.envs.development) {
    error.stack = err.stack;
  }

  if (err.errors) {
    error.errors = {};
    const { errors } = err;
    for (const type in errors) {
      if (type in errors) {
        error.errors[type] = errors[type].message;
      }
    }
  }

  res.status(err.status || Util.code.internalServerError).json(error);
}
