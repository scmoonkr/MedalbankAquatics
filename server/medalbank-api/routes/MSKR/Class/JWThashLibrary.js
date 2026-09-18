const jwt 			= require('jsonwebtoken');
const crypto 		= require('crypto'); 
const CryptoJS = require("crypto-js");
const ObjectID 	= require('mongodb').ObjectID;
const mongoDB		= require('./MongoDB');
const mongoCFG  = require('../Config/mongoCFG');
const mongodb 	= new mongoDB(mongoCFG.Medalbank.database);

// const process.env.ALGORITHM = 'aes128';
// const process.env.PRIVATEKEY= 'lib192837'; 

exports.hashPassword = async (myPassword) => {
	return CryptoJS.AES.encrypt(myPassword, process.env.SECURITY_KEY).toString(CryptoJS.enc.Utf8);
}
exports.encryptPassword = async (myPassword) => {
	return CryptoJS.AES.encrypt(myPassword, process.env.SECURITY_KEY).toString();
}

exports.validatePassword = async (myPassword, hashed) => {
  const decrypt  = CryptoJS.AES.decrypt(hashed, process.env.SECURITY_KEY).toString(CryptoJS.enc.Utf8);
  return myPassword == decrypt;  
}

//=== sign option ================================
let expiresIn	= '1m'; // '1d';                  //1일간 유효
let issuer   	= 'libraryschool.co.kr';
let subject  	= "account";

//--------------------------------------
function encrypt(text){ 
  let cipher  = crypto.createCipher(process.env.ALGORITHM, process.env.PRIVATEKEY); 
  let crypted = cipher.update(text, 'utf8', 'hex') ;
      crypted += cipher.final('hex'); 
  return crypted; 
}
//--------------------------------------
function decrypt(text){ 
	let decipher  = crypto.createDecipher(process.env.ALGORITHM, process.env.PRIVATEKEY) ;
	let decrypted = decipher.update(text, 'hex', 'utf8') ;
	console.log(text+"; " + JSON.stringify(decrypted));
	try {
		decrypted += decipher.final('utf8'); 
console.log(text+"; " + JSON.stringify(decrypted));
	}
	catch(e) {
console.log("decode.error="+e);
	}
	return decrypted; 
}

//==================================
exports.jwtPrivateKey = () =>{
	return process.env.PRIVATEKEY;
}

//==================================
exports.sign = (userInfo) => {
	return new Promise(function(resolve, reject) {
		let payload = userInfo;
		// console.log("jwt.sign------->", userInfo);
		//payload.password = encrypt(userInfo.password);
		let option ={
			expiresIn: expiresIn,                  //1일간 유효
			issuer   : issuer,
			subject  : subject
		};
		jwt.sign(
			payload, 
			process.env.PRIVATEKEY, 
			option,
			function (err, token) {     //callback을 사용하면 async로 진행함
				console.log("MSKR.jwt.sign.token=", token);
				if (err) {
							reject(err);
						} else {
							resolve(token); 
				}
			}
		);
	});// end Promise
};

//==================================
exports.verify = (jwtStr) => {
	return new Promise(function(resolve, reject) {
		jwt.verify( 
			jwtStr, 
			process.env.PRIVATEKEY,
			{issuer: issuer, subject: subject },
			function(err, decoded) {
console.log("verify.2>>>>>>>>>>>>>"+err);					
				if (err) {
						reject(err);
				} else {
					console.log("verify.3>>>>>>>>>>>>>"+JSON.stringify(decoded.password));					
					console.log("verify.3>>>>>>>>>>>>>"+decrypt(decoded.password));					
					let decode ={														
						//nickname : decoded.nickname,
						userid  : decoded.userid,
						password : decrypt(decoded.password)
					};
console.log("verify.4>>>>>>>>>>>>>"+JSON.stringify(decode));					
					resolve(decode); 
				}
			}
		);
	});// end Promise
};

//==================================
//=== 사용자 JSON WEB Token 저장  ================
//jwt를 'jwt' collection에 저장 후 _id를 return
exports.save =  async (token) => {
	const query		=	{ 'token': token, };
			
	let result = await mongodb.insertOne(mongoCFG.Medalbank.JWT, query);
	if (result.message) {
		result = await mongodb.findOne(mongoCFG.Medalbank.JWT, query);
	}
	return result;
}

//==================================
//=== 사용자 JSON WEB Token 저장  ================
//jwt를 'jwt' collection에 저장 후 _id를 return
exports.load =  async (jwtID) => {
	objectID = new ObjectID(jwtID);
	const query		=	{'_id':objectID};
	let result = await mongodb.findOne(mongoCFG.Medalbank.JWT, query);
	return result.data;
}


//==================================
//=== 사용자 JSON WEB Token 저장  ================
// browser에서 받은 token을 'jwt' collection에서 remove
//jwt를 'jwt' collection에 저장 후 _id를 return
exports.remove = async (token) => {
		const query		=	{ 'token': token };
		let result = await mongodb.deleteOne(mongoCFG.Medalbank.JWT, query);
		return result.data;
};

// jwt headers 에 포함됨 TOKEN 형식 :
// {authorization: Bearer <access_token>}
// exports.verifyToken = (req,res,next) => {
// 	const bearerHeader =  req.headers['authorization']; // Get auth header value
// 	if (typeof bearerHeader !== 'undefined'){            // check if bearer is udefined
// 	  const bearer = bearerHeader.split(' ');           // Split at the space 
// 	  const bearerToken = bearer[1];                    // Get token from array
// 	  req.token=bearerToken;							// req heqder에 token 주입
// 	  next();
// 	} else {											//Forbidden
// 	  res.sendStatus(403);
// 	}
// }
