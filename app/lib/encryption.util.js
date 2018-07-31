import crypto from 'crypto';
import Constants from '../config/constants';

class EncryptionUtil {
  constructor() {}

  encryptText = async (text) => {
    return new Promise((resolve) => {
      let cipher = crypto.createCipher(Constants.encryption.algorithm, Constants.encryption.key);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      resolve(encrypted);
    });
  };

  decryptText = async (text) => {
    return new Promise((resolve) => {
      let decipher = crypto.createDecipher(Constants.encryption.algorithm, Constants.encryption.key);
      let decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      resolve(decrypted);
    });
  };
}

export default new EncryptionUtil();
