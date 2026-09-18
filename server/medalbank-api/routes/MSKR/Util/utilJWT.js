const jwt 			= require('jsonwebtoken');
const crypto 		= require('crypto'); 
const ObjectID 	= require('mongodb').ObjectID;
const mongoDB		= require('../Class/MongoDB');
const mongoCFG  = require('../Config/mongoCFG');
const mongodb 	= new mongoDB(mongoCFG.dbDongnebook);

const algorithm = 'aes128';
const privateKey= 'lib192837'; 


//=== sign option ================================
let expiresIn	= '1d';                  //1일간 유효
let issuer   	= 'libraryschool.co.kr';
let subject  	= "account";

//--------------------------------------
function encrypt(text){ 
  let cipher  = crypto.createCipher(algorithm, privateKey); 
  let crypted = cipher.update(text, 'utf8', 'hex') ;
      crypted += cipher.final('hex'); 
  return crypted; 
}
//--------------------------------------
function decrypt(text){ 
	let decipher  = crypto.createDecipher(algorithm, privateKey) ;
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
	return privateKey;
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
			privateKey, 
			option,
			function (err, token) {     //callback을 사용하면 async로 진행함
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
			privateKey,
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
	// mongodb.insertOne(mongoCFG.Medalbank.JWT, query)
	//   	     .then(
	//   	      	  function(result) {
	// 								utilMongo.findOne(mongoCFG.Medalbank.JWT, context)
	// 								.then(function(result) {
	// 											resolve(result._id); 
	// 								})
	// 								.catch(function (err) { 
	// 											reject('JWT_SAVE_ERROR');
	// 								});
	//   	      	  },	     
	//   	      	  function (err) { 
	//   	      		  reject('JWT_SAVE_ERROR');
	//   	      	  }
	//   	      );
}

//==================================
//=== 사용자 JSON WEB Token 저장  ================
//jwt를 'jwt' collection에 저장 후 _id를 return
exports.load =  async (jwtID) => {
	objectID = new ObjectID(jwtID);
	const query		=	{'_id':objectID};
	let result = await mongodb.findOne(co, query);
	return result.data;
}


//==================================
//=== 사용자 JSON WEB Token 저장  ================
// browser에서 받은 token을 'jwt' collection에서 remove
//jwt를 'jwt' collection에 저장 후 _id를 return
exports.remove = async (token) => {
		const query		=	{ 'token': token };
		let result = await mongodb.deleteOne(collJWT, query);
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
