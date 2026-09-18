
const request	 	= require('request');


//-----> get IPaddr
exports.getIPaddr = async ()  => {
	const url = 'https://api.ipify.org?format=jsonp&callback=?';
	const result = await this.sendGET(url);
	const arr = result.split("\"");
	return (arr.length >= 3 ? arr[3] : ""); 
}

exports.getUserID = async (userID) => {
	userID = Number(userID);
	if (userID > 0) return userID;

	const ip = await this.getIPaddr();
	let ips = ip.split('.');
	userID = Number(ips[0])*1000000000+	Number(ips[1])*1000000 + Number(ips[2])*1000 + Number(ips[3]);
	return userID;
}

// wrap a request.POST in an promise
exports.readRequestPOST = async (url, form) => {
    return new Promise((resolve, reject) => {
		console.log(">>>>>>>"+url);
		request.post({
			//"headers"	: { "content-type": "application/json" },
			"url"		: url,
			"form"	: form,
			//"json"		: true
		}, (error, response, buffer) => {
			console.log("<<<<<<<<"+response);
			console.log("<<<<<<<<"+JSON.stringify(buffer));
			if (error) reject(error);
			resolve(buffer);
        });
    });
}

exports.sendPOST = async (url, option) => {
	return new Promise((resolve, reject) => {
		request.post({ "url":url, json: option }, (error, response, buffer) => {
			if (error) {
				reject("");
			} else {
				try {
					if (response.statusCode != 200) {
						resolve("");
					} else {
						resolve(buffer);
					}
				}
				catch(e) {
					console.log("sendPOST.catch."+e);
					console.log("response", response)				
					resolve("");
				}
			}
        });
    }
	)
}

exports.sendRequest = async (method, url, option) => {
	return new Promise((resolve, reject) => {
		request({ "url": url, method: method, json: option }, (error, response, buffer) => {
			if (error) {
				reject("");
			} else {
				try {
					if (response.statusCode != 200) {
						resolve("");
					} else {
						resolve(buffer);
					}
				}
				catch(e) {
					console.log("sendRequest.catch.", e);
					resolve("");
				}
			}
		});
	});
}

exports.sendGET = async (url) => {
	return new Promise((resolve, reject) => {
		try {
			request.get( {
				rejectUnauthorized: false,  
				url		: url,
				encoding: null,
				headers	: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:11.0) Gecko/20100101 Firefox/11.0' }
			}, (error, response, body) => {
				if (error) {
					resolve("");
				} else if (response.statusCode != 200) {
					resolve("");
				} else {
					try {
						const enc = charset(response.headers, body);	// 해당 사이트의 charset값을 획득
						const html = iconv.decode(body, enc);			// 획득한 charset값으로 body를 디코딩
						resolve(html);
					} catch (e) {
						resolve(body.toString());
					}
				}
			});
		} catch (e) {
				console.log("sendGET.catch.url=", url, e);
				resolve("");
		}
	});
}

exports.sendGEToption = async function (options) {
	return new Promise((resolve, reject) => {
	//options.url		= url;
	request.get( options, function (error, response, buffer) {
		if (error) {
			console.log("Error2."+error);
			resolve("");
		}
	
		if (response.statusCode != 200) {
			console.log("Error1.200");
			resolve("");
					} else {
			let naver = (buffer == "" ? {} : JSON.parse(buffer) );
			resolve(buffer);
		}
			});
	});
}
