var crypto			= require('crypto');
const CryptoJS = require("crypto-js");



exports.hashPassword = async (myPassword) => {
	return CryptoJS.AES.encrypt(myPassword, process.env.SECURITY_KEY).toString();
}

exports.validatePassword = async (myPassword, hashed) => {
  const decrypt  = CryptoJS.AES.decrypt(hashed, process.env.SECURITY_KEY).toString(CryptoJS.enc.Utf8);
  return myPassword == decrypt;  
}




/*
var generateSalt = function()
{
		const set = '0!2#4%6&8(AbCdDfGhIjKlMnOpQuEsTuVwXyZ';
		let salt = '';
		for (let i = 0; i < 10; i++) {
			let p = Math.floor(Math.random() * set.length);
			salt += set[p];
		}
		return salt;
}

var md5 = function(str) {
		return crypto.createHash('md5').update(str).digest('hex');
}

exports.saltAndHash = (plainPass) =>
{
	return new Promise(function(resolve, reject) {
		const salt = generateSalt();
		const validHash = salt + md5(plainPass + salt);
		resolve(validHash);
	})
}

exports.validatePassword = (plainPass, hashedPass) =>
{
	return new Promise(function(resolve, reject) {
		const salt = hashedPass.substr(0, 10);
		const validHash = salt + md5(plainPass + salt);
		if (hashedPass === validHash){
			resolve(true);
		} else {
			reject(false);
		}
	})
}
*/