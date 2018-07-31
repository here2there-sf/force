import EncryptionUtil from './encryption.util';


let start = async () => {
  let org = '123testing';

  let encrypted = await EncryptionUtil.encryptText(org);
  console.log(encrypted);
  let dec = await EncryptionUtil.decryptText(encrypted);
  console.log(dec);
};

start();
