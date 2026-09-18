const express 	= require('express');
const router 		= express.Router();
const stream 		= require('stream');
const Duplex 		= require('stream').Duplex;  //== buffer to stream에서 사용  
const fs				= require('fs');
const moment		= require('moment');
const extend 		= require('node.extend');
const request		= require('request');
const _path     = require('path');
const _glob     = require('glob');

// dir: cat  --> cata/876/543/cata876543210.jpg
exports.makeDirNumber = function(category, type, id="") {
	const str = ("0000000000000" + id.toString()).slice(-13);
  
    const path = [ category, type, str.slice(0, 4), str.slice(4, 7), str.slice(7, 10) ];
		return path;
}

// dir: cat  --> cata/876/543/cata876543210.jpg
exports.getDirectory = function(category, type, id) {
	let dirs = this.makeDirNumber(category, type, id);	// ["cate", "012", "345"]
	let path = "";
	dirs.forEach(function(dir) {
		path += "/" + dir;
	})
	return "/" + dirs.join('/');;
}

// 
//
//
exports.removeFiles = async function(path, filename) {
	//-----> delete file list
	let fname = filename.split(".");
	try {
		// get file list
		let filelist = _glob.sync(_path.join(path, fname[0]+"*"), {});
		// remove it
		filelist.forEach(function(fil) {
			fs.unlinkSync(fil);	//
		}) // forEach
	}
	catch(e){
		console.log("saveFile.unlinkSync.error="+e);
	}
}

// 
//
//
exports.makeDirectorySync = async function(category, type, id) {
	const dirs = this.makeDirNumber(category, type, id);	// ["cate", "012", "345"]
	let fullpath = !global.uploadPath ? "." : global.uploadPath;
	//-----------------------
	for (const dir of dirs) {
		fullpath += "/" + dir;
		// console.log("makeDirectorySync.fullpath=", fullpath);
			if (! fs.existsSync(fullpath)) {	// if not exists, make dir
			fs.mkdirSync(fullpath);
		}	
	}
	//-----------------------

	const path = "/" + dirs.join('/'); // this.getDirectory(category, type, id);	// ["cate", "012", "345"]
	// console.log("makeDirectorySync.path=", path);

	return path;
}

// wrap a request in an promise
exports.readRequestURL = async function(url) {
    return new Promise((resolve, reject) => {
		request({ "url":url, "encoding": null }, (error, response, buffer) => {
			if (error) reject(error);
            if (response.statusCode != 200) {
				// if error, retry
				let url1 = url.replace("/xlarge/", "/large/").replace("/x", "/l");
				request({ "url":url1, "encoding": null }, (err, resp, buffer1) => {
					if (err) reject(err);
					if (resp.statusCode != 200) {
						reject(url1+'########################3Invalid status code <' + response.statusCode + '>');
					} else {
						resolve(buffer1);
					}
				})	

            } else {
				resolve(buffer);
			}
        });
    });
}
