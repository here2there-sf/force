import jwt from 'jsonwebtoken';
import Constants from '../config/constants';
import Util from '../lib/util';

const { sessionSecret } = Constants.security;

export default function authenticate(req, res, next) {
  const { authorization } = req.headers;
  jwt.verify(authorization, sessionSecret, async (err, decoded) => {
    if (err) {
      console.log(err);
      return res.sendStatus(Util.code.forbidden);
    }
    // If token is decoded successfully, find user and attach to our request
    // for use in our route or other middleware
    try {
      req.currentUser = decoded;
      if (!req.currentUser) return res.sendStatus(Util.code.forbidden);

      next();
    } catch(err) {
      next(err);
    }
  });
}
