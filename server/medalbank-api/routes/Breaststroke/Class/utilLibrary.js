
const lodash 		= require("lodash");
const stream 		= require('stream');
const Duplex 		= require('stream').Duplex;  //== buffer to stream에서 사용  
const extend 		= require('node.extend');
// var MongoClient = await mongodb.MongoClient;
const moment		= require('moment')
const request	 	= require('request');
var Hangul 	= require('hangul-js');
const { Parse } = require('unzipper');
const { createWriteStream, createReadStream } = require('fs');

const stringLibrary			= require('../Class/StringLibrary');
const mongoCFG  = require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 		= new mongoDB();

const iconv 		= require('iconv-lite') 
const charset 	= require('charset') //해당 사이트의 charset값을 알 수 있게 해준다.

const AUTHOR_ROLE = "저자,지은이,지음,저,공저,공편곡,共著,解義,脚本,解題,等編述,外著,[共]脚本,共脚本,脚色,역해,原著,[等]編,等編,共譯,共編著,譯註,校註,等譯,等著,[공]지음,[같이]지음,공편,등편,[등편],[공편],역주,글.그림,글·그림,글.註譯,사진,글·사진,,著,書,기획,감수,글,그림,외 지음사진,역,譯,,[譯],공역,[공]역,옮김,[같이]옮김,글씀,엮음,[같이]엮음,원작,원저,극본,감수,編,[編],編輯,편,[편],편저,편역,펴냄";
const AUTHOR_ROLES = AUTHOR_ROLE.split(",");
// const NEWBOOK_TERM = 720; // 360;	// 신간 검색 기간

const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

exports.lineInput = async (message) => { // mili sec.
	return new Promise((resolve) => {
		const rl = readline.createInterface({ input, output });
		rl.question(message, (answer) => {
			rl.close();
			resolve(answer);
		})
		
	});	
}


const alphaNumeric = /^[A-Za-z0-9]+$/;
exports.isAlphaNumeric = (ch) => {
	return alphaNumeric.test(ch)
}
exports.isAlphaNumerics = (str) => {
	for (const check of str.split('')) {
		if (!alphaNumeric.test(check)) return false;
	}
	return true;
}
exports.vaildISBN = (isbn) => {
	const arr = isbn.replace(/ /, "").replace("]", "").replace(")", "").replace("...", "(").replace("[", "(").replace("-", "(").replace(".", "(").split("(");
  
	// console.log("[" + isbn + "][" + arr[0] + "]");
	return arr[0]; 
}

exports.isEqual = (objA, objB) => lodash.isEqual(objA, objB);

const _consonentsCircle 	= ['㉠','ᄁ','㉡','㉢','ᄄ','㉣','㉤','㉥','ᄈ','㉦','ᄊ','㉧','㉨','ᄍ','㉩','㉪','㉫','㉬','㉭'];
const _constnents 				= ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
exports.nameHide = (name="") => {
	if (name.length < 2) return name;
	let names = name.split(",");
	names = names.map(elem => {
		elem = elem.trim();
		const last = Hangul.disassemble(elem.slice(-1)).slice(0, 1)[0];

		const index = _constnents.findIndex((item, idx) => item==last);
		let ch = index < 0 ? last : _consonentsCircle[index]; // 'Ο'
		
		return elem.slice(0, -1) + ch;
	})
	name = names.join(", ");
	return name;
}
exports.nameHideAll = (name="") => {
	if (name.length < 2) return name;
	let names = name.split("");
	names = names.map(elem => {
		const last = Hangul.disassemble(elem)[0];

		const index = _constnents.findIndex((item, idx) => item==last);
		let ch = index < 0 ? last : _consonentsCircle[index]; // 'Ο'
		
		return ch;
	})
	name = names.join("");
	return name;
}
exports.nameHideAllNotCircle = (name="") => {
	if (name.length < 2) return name;
	// if (stringLibrary.isAlpha(name.slice(0,1))) return "외국인";
	if (stringLibrary.isAlpha(name.slice(0,1))) return name;

	let names = name.split("");
	names = names.map(elem => {
		const last = Hangul.disassemble(elem)[0];

		// const index = _constnents.findIndex((item, idx) => item==last);
		// let ch = index < 0 ? last : _consonentsCircle[index]; // 'Ο'
		
		return last;
	})
	name = names.join("");
	return name;
}

//-------------------------------------------
const NORM = "email,kdc";
exports.buildIndex = (type, indexes, value) => {
	if (!value) return indexes;
	if (typeof value == "string") value = [value];
	value.forEach(key => {
		if (key.length > 0) {
			norm = NORM.indexOf(type) >= 0 ? key : this.normalizeString(key);
			if (!indexes.find(el => el.type==type && el.index==norm)) {
				indexes.push({ type: type, index: norm });
			}
		}	
	})

	return indexes;
}
//-------------------------------------------
exports.indexing = (json, fields, indexes=[]) => {
	if (typeof fields == "string") fields = fields.replace(/ /gi, '').split(",");
	//-----> indexes
	fields.forEach(key => {
		key = key.trim();
		if (!json[key]) {
			const norm = this.normalizeString(json[key]);
			if (norm != "" && indexes.indexOf(norm) < 0) {
				indexes = indexes.filter(ar => ar.type != key);
				indexes.push({ type: key, index: norm });
			}
		}
	})
	return indexes;
}
exports.indexingNames = (body) => {
	let nameArr = [];
	// if (body.names		) nameArr.push(body.names);
	if (body.name		) nameArr.push(body.name);
	if (body.teamName	) nameArr.push(body.teamName);
	if (body.poolName	) nameArr.push(body.poolName);
	if (body.nameKor	) nameArr.push(body.nameKor);
	if (body.nameEng	) nameArr.push(body.nameEng);
	// if (body.fullname) nameArr.push(body.fullname);
	if (body.competitionName) nameArr.push(body.competitionName);
	if (body.names) {
		if (typeof body.names == "string") body.names = body.names.split(',');
		for (const name of body.names) {
			nameArr.push(name);
		}
	}

	const names = [];
	for (const name of nameArr) {
		const norm = this.normalizeName(name || '');
		if (norm && !names.includes(norm)) names.push(norm);
	}
	
	const indexes = [];
	for (const name of nameArr) {
		const norm = this.normalizeString(name || '');
		if (norm && !indexes.includes(norm)) indexes.push(norm);
	}
	return { names, indexes };
}

exports.normalize_author = (authors) => {
	authors = authors.trim().replace(/  /g, " ").replace(/  /g, " ");
	let roleTmp = ""
	let name = this.deleteEndSpecialChar(authors)
  
	let pos = name.indexOf(":")
	if (pos > 0) {
		roleTmp = name.substr(0, pos).trim() // 지은이, 옮긴이, 그린이, 글
		name = name.substr(pos + 1).trim()
		switch (roleTmp) {
			case "지은이":
				roleTmp = "지음"
				break
			case "옮긴이": 
				roleTmp = "옮김"
				break
			case "그린이": 
				roleTmp = "그림"
				break
			case "엮은이": 
				roleTmp = "엮음"
				break
		}
	} else {
		pos = name.lastIndexOf(' ')
		if (pos > 0 && AUTHOR_ROLE.includes(name.substr(pos).trim())) {
			roleTmp = name.substr(pos).trim()
			name = name.substr(0, pos).trim()
		} else {
		  AUTHOR_ROLES.forEach((auth) => {
			if (auth.length < 2) return;
			pos = name.lastIndexOf(auth)
			if (pos >= 0  && name.length === (auth.length + pos)) {
			//   console.log( "name=", name, "len=", name.length, "auth=", auth, "pos=", pos)
			  roleTmp = auth;
			  name = name.substr(0, pos);
			} else {
			  pos = name.indexOf(auth)
			  if (pos == 0) {
				// console.log( "name=", name, "len=", name.length, "auth=", auth, "pos=", pos)
				roleTmp = auth;
				name = name.substr(auth.length);
			  }  
			}
		  })
		}
	}
	let dot = (name.substr(name.length - 1, 1) === "." ? "." : "")
  //console.log("[" + authors + "][" + dot + "]")
	name = this.deleteEndSpecialChar(name)
//   console.log("[" + authors + "][" + name + "][" + roleTmp + "]")
  
	let delSpecial = ""
	if (roleTmp.length > 0) {
		for (let cnt = 0; cnt < roleTmp.length; cnt++) {
			if (!"~!@#$%^&*()_+=-{}][\\\":;'?><,./ ·".includes(roleTmp.substr(cnt, 1))) {
				delSpecial += roleTmp.substr(cnt, 1)
			}
		}
  
		let chk = false
		if (delSpecial.length > 1) {
			for (let dcnt = 0; dcnt < delSpecial.length - 1; dcnt++) {
				if (AUTHOR_ROLE.includes(delSpecial.substr(dcnt) + ",")) {
					chk = true
					break
				}
			}
		} else if (AUTHOR_ROLE.includes(delSpecial + ",")) {
			chk = true
		}
  
		if (!chk) {
			if ("외,등".includes(delSpecial.substr(0, 1))) {
				let ttt = delSpecial.substr(1)
				if (AUTHOR_ROLE.includes(ttt) < 0) {
					delSpecial = ""
				}
			} else if (delSpecial.includes("같이")) {
				let ttt = delSpecial.substr(2)
				if (!AUTHOR_ROLE.includes(ttt)) {
					delSpecial = ""
				}
			} else {
				delSpecial = ""
			}
		}
	}
	/*
	if (delSpecial.length > 0)
	{
		name = name
	}
	*/
	name = this.deleteEndSpecialChar(name.replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' ')) + dot
	//console.log("[" + authors + "][" + name + "][" + roleTmp + "]")
  
	//-----> reverse
	let invert = ''
	pos = name.indexOf(',')
	if (pos > 0) {
		invert = name.substr(pos + 1).replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' ').trim() + ' ' + name.substr(0, pos).replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' ').trim()
	} else {
		pos = name.lastIndexOf(' ')
		if (pos > 0) {
			invert = name.substr(pos).replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' ').trim() + ', ' + name.substr(0, pos).replace(/ {2}/gi, ' ').replace(/ {2}/gi, ' ').trim()
		}
	}
	let author = {
		name:   this.deleteEndSpecialChar(name) + dot,
		role:   delSpecial,
		invert: invert,
	}
	return author
}

// body: params, fields: [ "a", b", ...]
exports.checkParams = (body, fields) => {
	let result = "";
	fields.forEach(function(fld) {
		if (body[fld] === undefined || ! body[fld] ) {
			result = `${fld} not found !!`;
			return result;
		}
	})
	return result;
}

function bufferToStream(buffer) {  
	let stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

exports.isAlphaNumeric = (str) => {
	var regExp = /^[A-Za-z0-9]+$/;
	//return (str.match(regExp));
	return str.substr(0,1).match(/[^\w]|_/) == null;
}

function makeDirISBN(isbn) {
	isbn = ("00000000000000" + isbn);
	isbn = isbn.substr(isbn.length - 13);
	let path = [ "book", isbn.substr(0, 5), isbn.substr(5, 3), isbn.substr(8, 3) ];
	return path;
}

 // dir: isbn --> 9788/901/234/9888901234567.jpg
function getDirISBN(isbn) {
	isbn = this.convertISBN13(isbn);	// if isbn(10) -> isbn(13)
    let path = "book/" + isbn.substr(0, 4) + "/" + isbn.substr(4, 3) + "/" + isbn.substr(7, 3) + "/";

    return path;
}

// dir: cat  --> cata/876/543/cata876543210.jpg
function makeDirNumber(category, seqno) {
	let str = ("00000000" + seqno.toString());
	str = str.substr(str.length - 9);
	let path = [ category, str.substr(0, 3), str.substr(3, 3) ];
	return path;
}

// dir: cat  --> cata/876/543/cata876543210.jpg
function getDirNumber(category, seqno) {
    let str = ("00000000" + seqno.toString());
    str = str.substr(str.length - 9);
    let path = category  + "/" + str.substr(0, 3) + "/" + str.substr(3, 3)  + "/";
    return path;
}

//==========================================
exports.normalizeMSKR = (str) => {
	if (str !== undefined && str.length > 0) {
		str = str.trim();
		// Remove spaces before commas, period, minus
		str = str.replace(/\s+,/g, ',');
		// str = str.replace(/\s+./g, '.');
		str = str.replace(/\s+-/g, '-');
		str = str.replace(/\s+_/g, '_');

		// Replace multiple spaces with a single space
		str = str.replace(/\s\s+/g, ' ');

		// +, &, %
		str = str.replace(/\+/g, "PLUS");
		str = str.replace(/\&/g, "AND");
		str = str.replace(/%/g, "PERCENT");

		// Remove all special characters except ','
		str = str.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣+&%\s]/g, '');
		// str = str.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣,\s]/g, '');

		// 이름이 2자이고 ' '가 있는 경우
		if (str.length <= 3) str = str.replace(/ /gi, '');

		// 대문자
		str = str.toUpperCase();
		// str = str.replace(/[\x00-\x1F\x7F-\x9F]/u, "");
		// str = str.replace(/[#\&\+\-%@=\/\\\:;.·'\"\^`~\!\?\*$#<>()\[\]\{\}]/g, "");
	}
	return str;
}
exports.normalizeName = (str) => {
	if (str !== undefined && str.length > 0) {
		str = str.trim();
		// Remove spaces before commas, period, minus
		str = str.replace(/\s+,/g, ',');
		// str = str.replace(/\s+./g, '.');

		// Replace multiple spaces with a single space
		str = str.replace(/\s\s+/g, ' ');

		// Remove all special characters except ','
		str = str.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣,_=+&%\s-]/g, '');
		str = str.replace(/\s*\+\s*/g, '+');
		str = str.replace(/\s*\%\s*/g, '%');
		str = str.replace(/\s*\&\s*/g, '&');
		str = str.replace(/\s*\=\s*/g, '=');
		str = str.replace(/\s*\-\s*/g, '-');
		str = str.replace(/\s*\_\s*/g, '_').trim();
	}
	return str;
}

//==========================================
exports.normalizeString = (str) => {
	if (str !== undefined && str.length > 0)
	{
			str = str.replace(/\/s|\/s+/g, "");
			str = str.replace(/\+/g, "PLUS");
			str = str.replace(/\&/g, "AND");
			str = str.replace(/%/g, "PERCENT");
			str = str.toUpperCase();
			str = str.replace(/[\x00-\x1F\x7F-\x9F]/u, "");
			str = str.replace(/[ #\&\+\-%@=\/\\\:;,.·'\"\^`~\!\?\*$#<>()\[\]\{\}]/g, "");
	}
	return str;
}

exports.deleteWhiteSpace = (text, del) => {
	let ret = text.replace(/       /gi, ' ').replace(/      /gi, ' ').replace(/     /gi, ' ').replace(/    /gi, ' ').replace(/   /gi, ' ').replace(/  /gi, ' ').replace(/  /gi, ' ').replace(/  /gi, ' ');
	ret = ret.replace(/\t/gi, '').replace(/\n /gi, '\n').replace(/ \n/gi, '\n').replace(/\n\n\n\n/gi, '\n').replace(/\n\n\n/gi, '\n').replace(/\n\n/gi, '\n').trim();
	ret = ret.replace(del, "");
	return ret;
}

exports.deleteEndSpecialChar = (str="") => {
	str = str.replace(/[~!@#$%^&*()_+-.,{}|\\:;/?<>"' ]+$/g, "");
	str = str.replace(/=+$/g, "");
	return str;
}

exports.comma = (value) => {
	let str = value.toString();
	return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

exports.leadingZeros = (n, digits) => {
	var zero = '';
	n = n.toString();

	if (n.length < digits) {
		for (let i = 0; i < digits - n.length; i++) {
			zero += '0';
		}
	}
	return zero + n;
}

const tagDef = [
	{	name: 'tag008',		tagno: '008',	sfld: '',	ind1: '',	ind2: '',	newtag: '',	},
	{	name: 'tag020a',	tagno: '020',	sfld: 'agc',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag021a',	tagno: '021',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag041a',	tagno: '041',	sfld: 'ah',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag049v',	tagno: '049',	sfld: 'vf',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag056a',	tagno: '056',	sfld: 'a2',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag082a',	tagno: '082',	sfld: 'a2',	ind1: '0',	ind2: ' ',	newtag: '',	},
	{	name: 'tag090a',	tagno: '090',	sfld: 'abc',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag100a',	tagno: '100',	sfld: 'abe',	ind1: '1',	ind2: ' ',	newtag: '',	},
	{	name: 'tag110a',	tagno: '110',	sfld: 'abe',	ind1: '1',	ind2: ' ',	newtag: '',	},
	{	name: 'tag111a',	tagno: '111',	sfld: 'abe',	ind1: '1',	ind2: ' ',	newtag: '',	},
	{	name: 'tag240a',	tagno: '240',	sfld: 'ab',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag245a',	tagno: '245',	sfld: 'adebnpx',	ind1: '1',	ind2: '0',	newtag: '',	},
	{	name: 'tag250a',	tagno: '250',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag260a',	tagno: '260',	sfld: 'abc',	ind1: '3',	ind2: '0',	newtag: '',	},
	{	name: 'tag300a',	tagno: '300',	sfld: 'abce',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag440a',	tagno: '440',	sfld: 'avpn',	ind1: '0',	ind2: '0',	newtag: '',	},
	{	name: 'tag490a',	tagno: '490',	sfld: 'avp',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag500a',	tagno: '500',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag504a',	tagno: '504',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag505a',	tagno: '505',	sfld: 'at',	ind1: '0',	ind2: '0',	newtag: '',	},
	{	name: 'tag505n',	tagno: '505',	sfld: 'nde',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag507a',	tagno: '507',	sfld: 'at',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag520a',	tagno: '520',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag521a',	tagno: '521',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag586a',	tagno: '586',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag650a',	tagno: '650',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag653a',	tagno: '653',	sfld: 'a',	ind1: '0',	ind2: ' ',	newtag: '',	},
	{	name: 'tag700a',	tagno: '700',	sfld: 'ad',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag710a',	tagno: '710',	sfld: 'a',	ind1: '1',	ind2: ' ',	newtag: 'yes',	},
	{	name: 'tag711a',	tagno: '711',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: 'yes',	},
	{	name: 'tag730a',	tagno: '730',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: 'yes',	},
	{	name: 'tag740a',	tagno: '740',	sfld: 'a',	ind1: ' ',	ind2: '0',	newtag: 'yes',	},
	{	name: 'tag776a',	tagno: '776',	sfld: 'a',	ind1: '0',	ind2: ' ',	newtag: '',	},
	{	name: 'tag940a',	tagno: '940',	sfld: 'ab',	ind1: ' ',	ind2: ' ',	newtag: '',	},
	{	name: 'tag950b',	tagno: '950',	sfld: 'b',	ind1: '1',	ind2: ' ',	newtag: '',	},
	{	name: 'tag951a',	tagno: '951',	sfld: 'a',	ind1: ' ',	ind2: ' ',	newtag: '',	},
];

//==============================================
exports.convertContents2JSON = (contents) => {
    let json = {
        cid	        : contents.cid,
        isbn	    : contents.isbn,
        title	    : contents.title,
        price	    : contents.price,
        status	    : contents.status,
        pub_date	: contents.pub_date,
        type	    : (contents.type === undefined || contents.type === null ? "" : contents.type),
        siteID	    : (contents.siteID === undefined || contents.siteID === null ? "" : contents.siteID),
        user	    : (contents.user === undefined || contents.user === null ? "" : contents.user),
        image	    : (contents.image === undefined || contents.image === null ? {} : contents.image),
        review	    : (contents.review === undefined || contents.review === null ? {} : contents.review),
        authors	    : (contents.authors === undefined || contents.authors === null ? [] : contents.authors),
        titles	    : (contents.titles === undefined || contents.titles === null ? [] : contents.titles),
        category    : (contents.category === undefined || contents.category === null ? "" : contents.category),
        leader	    : contents.leader,
        update	    : contents.update,
    };
    if (contents.authors !== undefined && contents.authors !== null && contents.authors.length > 0) json.authors = contents.authors;

	for (let no=0; no<tagDef.length; no++) {
		let tag = tagDef[no];
		let arr = tag.sfld;
		if (tag.sfld.length === 0) {
			let tagname = `tag${tag.tagno}`;
			json[tagname] = this.getSubfield(contents.tags, tag.tagno, tag.sfld).join('|')
		} else {
			for (let sno=0; sno<tag.sfld.length; sno++) {
				let sfld = tag.sfld.substr(sno, 1);
				let tagname = `tag${tag.tagno}${sfld}`;
				json[tagname] = this.getSubfield(contents.tags, tag.tagno, sfld).join('|')
			}
		}
	}
	
	json.category.forEach(function (cat) {
		// if (cat.type === undefined || cat.type === null) cat.type = "";
		// if (cat.edition === undefined || cat.edition === null) cat.edition = "";
		// if (cat.tag === undefined || cat.tag === null) cat.tag = "";
		// if (cat.code === undefined || cat.code === null) cat.code = "";
		cat.type = (cat.type === undefined || cat.type === null ? "" : cat.type)
		cat.edition = (cat.edition === undefined || cat.edition === null ? "" : cat.edition)
		cat.tag = (cat.tag === undefined || cat.tag === null ? "" : cat.tag)
		cat.code = (cat.code === undefined || cat.code === null ? "" : cat.code)
	})
	json.tags = contents.tags;

    return json;
}

//============================================
exports.convertJSON2Contents = (json) => {
    let contents = {
        cid	        : json.cid || 0,
        isbn	    	: json.isbn,
        title	    	: json.title,
        author    	: json.author || "",
        publisher  	: json.publisher || "",
        price	    	: Number(json.price),
    }

		if (!json.status		) json.status = "";
		if (!json.pub_date	) json.pub_date = "";
		if (!json.type			) json.type = "";
		if (!json.siteID		) json.siteID = "";
		if (!json.user			) json.user = "";
		if (!json.image			) json.image = "";

		if (!json.tags) {

			if (!contents.leader) contents.leader	 = '00000nam  2200000 k 4500';
			contents.tags = [];

			contents.tags = []
			contents.tags.push({ tagno: '008', ind1: '', ind2: '', subfield: [{ sfld: '', data: '2023    ggk    c      000 f       '}] });
	
			let subfield = [];
	
			//-----> 020: isbn, price
			subfield = [];
			subfield.push({ sfld: 'a', data: json.isbn });
			subfield.push({ sfld: 'c', data: json.price });
			contents.tags.push({ tagno: '020', ind1: ' ', ind2: ' ', subfield: subfield });
	
			//-----> 245: title, author
			subfield = [];
			subfield.push({ sfld: 'a', data: json.title });
			subfield.push({ sfld: 'd', data: json.author });
			contents.tags.push({ tagno: '245', ind1: '1', ind2: '0', subfield: subfield });
	
			//-----> 260: publisher
			subfield = [];
			subfield.push({ sfld: 'a', data: "경기" });
			subfield.push({ sfld: 'b', data: json.publisher });
			contents.tags.push({ tagno: '260', ind1: '3', ind2: ' ', subfield: subfield });
	
			//-----> 951: price
			subfield = [];
			subfield.push({ sfld: 'b', data: json.price });
			contents.tags.push({ tagno: '951', ind1: '1', ind2: ' ', subfield: subfield });
		}

    return contents;
}

exports.getTag = (tags, tagno) => {
	let tagArr = [];
	tags.forEach(function (tag) {
		if (tag.tagno == tagno) {
			tagArr.push(tag);
		}
	});
	//console.log(JSON.stringify(tagArr));
	return tagArr;
}

exports.getSubfield = (tags, tagno, subfield) => {
	let subfieldArr = [];
	if (tags !== undefined) {
		let tagArr = this.getTag(tags, tagno);
		tagArr.forEach(function (tag) {
			tag.subfield.forEach(function (sfld) {
				if (sfld.sfld == subfield) {
					subfieldArr.push(sfld.data==null?"":sfld.data);
				}
			});
		});
		subfieldArr = (subfieldArr.length == 0 ? [""] : subfieldArr);
	}
	//console.log(JSON.stringify(subfieldArr));
	return subfieldArr;
}
//-----> merge MARC: MARC -> JSON
exports.mergeTags = (tagArr, tags) => {
	//tags = tags;
	//console.log("merge tags="+JSON.stringify(tags));
	//tags.forEach(function(tag) {
	for (let no=0; no<tags.length; no++) {
		let tag = tags[no];
		tagArr.push(tags[no]);
	}
	return tagArr;
}
//-----> replace MARC: MARC -> JSON
exports.replaceTags = (tagArr, tags) => {
	//-----> remove tags
	for (let no=0; no<tags.length; no++) {
		let tag = tags[no];
		tagArr = tagArr.filter(function(tg){ 
			return tag.tagno != tg.tagno; 
		});
		tagArr.push(tag);
	}
	return tagArr;
}
//-----> remove tagno
exports.removeTags = (tagArr, tagno) => {
	//-----> remove tags
	tagArr = tagArr.filter(function(tg){ 
		return tg.tagno != tagno; 
	});
	return tagArr;
}

exports.getDirectory = (category, id) => {
	let path = global.uploadPath;
	switch (category) {
		case "isbn":
			path += getDirISBN(id);
			//console.log("isbn="+id);
			break;
		case "player":
		case "user":
		default:
			path += getDirNumber(category, Number(id));
			//console.log(category+"="+id);
			break;
	}
    return path;
}

exports.makeDirectory = (category, id) => {
	let dis = [];
	switch (category) {
		case "isbn":
			dir = makeDirISBN(id);	// ["book", "97889", "123", "456"]
			//console.log("isbn="+id);
			break;
		case "player":
		case "user":
		default:
			dir = makeDirNumber(category, Number(id));	// ["cate", "012", "345"]
			//console.log(category+"="+id);
			break;
	}
    return dir;
	if (newData.email === undefined || newData.email === "" || newData.email === null ) {   // email null check 
		console.log('SIGNUP_EMAIL_NOT_EXISTS');
		return "NOK";
	}
}

//==========================================
exports.field_validation = (body, fields, minFields = 0) => {
	let notExists = [];
	const bodys = Object.keys(body);
	fields.forEach((field) => {
		let ret = bodys.indexOf(field)
		if (ret < 0 || typeof body[field] == "string" && body[field] == "") notExists.push(field);
	})
	if (notExists.length > 0) {
		return notExists.join(", ") + " not exists or empty !!";
	}
	// PK, update field
	if (minFields > 0 && bodys.length < minFields) {
		console.log("err");
		return `minField: ${body.length+1}, error`;
	}
	return "";	// OK
	
}

exports.checkJsonNull = (json) => {
	if (json === undefined) return json;
	Object.keys(json).forEach(function(kdc) {
		try {
			if (typeof(kdc) == "string") {
				json[kdc] = (json[kdc] == null ? "" : json[kdc]);
			}
			if (typeof(kdc) == "number") {
				json[kdc] = (json[kdc] == null ? 0 : json[kdc]);
			}
		} catch (e) {}
	})
	return json;
}

exports.checkUndefined = (name, msg) => {
	//let xx = Object.keys(name);
	//console.log(JSON.stringify(xx));
	if (name === undefined) {
		console.log(msg + ": undefined..");
		return true;
	}
	if (name == null) {
		console.log(msg + ": null..");
		return true;
	}
	if (name == "") {
		console.log(msg + ": blank..");
		return true;
	}
	return false;
}


//-------------------------------------------------
exports.checkObjectNull = (product) => {
	const value = {};
	if (!product || Object.keys(product) == 0) return "";

	Object.keys(product).forEach(key => {
		const val = product[key]
		if (typeof val == "string") {
			value[key] = product[key] ? product[key].trim() : "";
		} else if (typeof val == "number") {
			value[key] = product[key] ? product[key] : 0;
		} else if (typeof val == "boolean") {
			value[key] = product[key] ? product[key] : true;
		} else if (Array.isArray(val)) { // Array
			const values = [];
			val.forEach(elem => {
				values.push(typeof elem == "Object" ? this.checkObjectNull(elem) : elem);
			})
			value[key] = values;
		} else { // Object
			value[key] = this.checkObjectNull(val);
		}
	})
	
	return value;
}
exports.removeObjectNull = (product) => {
	const value = {};
	Object.keys(product).forEach(key => {
		if (product[key] != undefined) {
			const val = product[key]
			if ("boolean,number".indexOf(typeof val) >= 0) {
				value[key] = val;
			} else if (typeof val == "string") {
				value[key] = val || "";
			} else if (val instanceof Date) {
				value[key] = val;
			} else if (Array.isArray(val)) { // Array
				if (val.length > 0) value[key] = val;
			} else { // Object
				// console.log("3+++++", Object.keys(val));
				if (Object.keys(val).length > 0) value[key] = val;
			}
		}
	})
	
	return value;
}
//=======================================
exports.getImageURL = (image) => {
	if (image === undefined) return "";
	let arr = image.split("/");	// "/cms/book/9788932029825"
	return "/ImageServer/book/" + arr[3].substr(0, 4) + "/" + arr[3].substr(4, 3) + "/" + arr[3].substr(7, 3) + "/" + arr[3] + ".jpg";
}
exports.getNewImageURL = (image) => {
	if (image === undefined || image.cover === undefined || image.cover === "") return "";
	let arr = image.cover.split("/");	// "/cms/book/9788932029825"
	return "/ImageServer/book/" + arr[3].substr(0, 4) + "/" + arr[3].substr(4, 3) + "/" + arr[3].substr(7, 3) + "/" + arr[3] + ".jpg";
}
//=======================================
exports.customizingBook = (book) => {
	if (book.tags === undefined || book.tags == "") return book;
	
	let newbook = {};
	extend(true, newbook, book); //deep copy 

	newbook.title = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "245", "a").toString()).trim();
	let title = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "245", "b").join(';').trim());
	str = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "245", "n").join(';').trim());
	if (str != "") title += ". " + str;
	str = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "245", "p").join(';').trim());
	if (str != "") title += ": " + str;
	str = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "440", "a").join(';').trim());
	if (str != "") {
		if (title != "") title += "; ";
		title += str;
	}
	str = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "440", "v").join(';').trim());
	if (str != "") title += ". " + str;
	newbook.sub_title = title;

	let tag245d = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "245", "d").join(';').trim());
	let tag245e = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "245", "e").join(';').trim());
	if (tag245e != "") {
		tag245d += "|" + tag245e;
	}
	newbook.authors = tag245d.replace(/  /gi, " ").replace(/; /gi, ";").replace(/ ;/gi, ";").replace(/;/gi, "|").split("|").join("; ");
	
	if (newbook.isbn == "") {
		newbook.isbn = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "020", "a")).trim();
	}
	newbook.images = {};
	console.log("newbook.image", newbook.image);
	if (newbook.image === null || newbook.image === undefined || newbook.image.length == 0 ||
		newbook.image[0].filename === undefined || newbook.image[0].filename == "") {
		newbook.images.cover = mongoCFG.mediaServer + "/cms/book/0000000000000";
	}
	else {
		newbook.images.cover = mongoCFG.mediaServer + newbook.image[0].filename;
	}
console.log(newbook.images.cover);	
	//newbook.images.thumbnail = "http://image.kyobobook.co.kr/images/book/large/"+newbook.isbn.substr(newbook.isbn.length-3)+"/l"+newbook.isbn+".jpg";
	//newbook.images.cover = "http://image.kyobobook.co.kr/images/book/xlarge/"+newbook.isbn.substr(newbook.isbn.length-3)+"/x"+newbook.isbn+".jpg";

	let review = "";
	if (newbook.review !== undefined && newbook.review.length > 0) {
		//extend(true, newbook, this.customizingReview(newbook.review)); //deep copy 
		newbook.review.forEach(function(rev) {
			if (rev.type == "review") {
				review = rev.review;
				return;
			}
		})
	}
	newbook.review = (review == "" ? newbook.reviewReview : review);
	if (newbook.review === undefined) delete newbook.review;

	if (newbook.kdc === undefined || newbook.kdc == "") {
		newbook.kdc = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "056", "a").join(';').trim());
	}
	if (newbook.price === undefined || newbook.price == "" || newbook.price == "0") {
		newbook.price = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "020", "c").join(';').trim());
		if (newbook.price === undefined || newbook.price == "" || newbook.price == "0") {
			newbook.price = this.deleteEndSpecialChar(this.getSubfield(newbook.tags, "950", "b").join(';').trim());
		}
		newbook.price = Number(newbook.price.replace(/\\/gi, ""));
	}
	delete newbook.reviewAuthor;
	delete newbook.reviewReview;
	delete newbook.reviewContents;
	delete newbook.reviewPublisher;
	delete newbook.tags;
	//console.log(newbook);
	return newbook;
}

exports.customizingReview = (reviews) => {
	//console.log("reviews="+JSON.stringify(reviews));
	let review = {}; // { reviewReview: "", reviewContents: "", };
	if (reviews !== undefined) {
		reviews.forEach(function(rv) {
			/*
				review[rview.type] = rview.review;
			*/
			switch(rv.type) {
				case "review":
					review.reviewReview = rv.review;
					break;
				case "contents":
					review.reviewContents = rv.review;
					break;
				case "blog":
					review.reviewBlog = rv.review;
					break;
				case "publisher":
					review.reviewPublisher = rv.review;
					break;
				case "author":
					review.reviewAuthor = rv.review;
					break;
			}
		})
	}
	return review;
}

exports.makeDIRcallback = (path, callback) => {
		fs.exists(path, function(exists) {
			if (! exists) {
				fs.mkdir(path, function (result) {
					callback(path);
				});
			}
			else {
				callback(path);
			}
		});	
}
	
exports.checkDirectory = (path, dir, callback) => {
	let count = 0;
	for (let no=0; no<dir.length; no++) {
		path += "/" + dir[no];
	console.log("exports.makeDIR.path="+path);
		fs.exists(path, function(exists) {
			if (! exists) {
				console.log("not exists. makeDIR."+path);
				fs.mkdir(path, function (result) {
					console.log("mkdir.result="+result);
					//-----
					if (++count >= dir.length) {
						callback(path);
					}
				});
			}
			else {
				console.log("exists. makeDIR.");
				if (++count >= dir.length) {
					callback(path);
				}
			}
		});	
	} // end for
}

//==============================================
exports.convertISBN13 = (isbn) =>  {// convert isbn10 -> isbn13
	if (isbn.length != 10) return isbn;
	var check_digit = new Array( 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3 );
	var isbn13 = "978" + isbn.substr(0,9);
	var checkdigit = 0;
	for (var cnt = 0; cnt < 12; cnt++)
	{
			checkdigit += Number(isbn13.substr(cnt,1)) * check_digit[cnt];
	}
	checkdigit = 10 - checkdigit % 10;
	if (checkdigit == 10) checkdigit = 0;
	isbn13 = isbn13 + String(checkdigit);

	return isbn13;
}

//===========================================
exports.convertISBN10 = (isbn) =>  {// convert isbn13 -> isbn10
	var isbn10 = isbn.substr(3,9);
	var checkdigit = 0;
	for (var cnt = 0; cnt < 9; cnt++)
	{
					checkdigit += Number(isbn10.substr(cnt,1)) * (cnt + 1);
	}
	checkdigit = checkdigit % 11;
	if (checkdigit == 10)
					isbn10 = isbn10 + "X";
	else
					isbn10 = isbn10 + String(checkdigit);

	return isbn10;
}

//==============================================
exports.convertISBN =  (isbn) => {
        var convert_isbn = "";

        isbn = isbn.replace("-", "").replace(" ", "").trim();

    if (isbn.length >= 13)
                convert_isbn = this.convertISBN10(isbn);
        else
                convert_isbn = this.convertISBN13(isbn);

        return convert_isbn;
}

//==========================================
exports.contents_holding_query = (param, prefix) => {
	let query = {};
	
	// if (param.data === null || param.data === undefined || param.data === "" ||
	// 	param.cmd === null || param.cmd === undefined || param.cmd === "") {
	// 	param.cmd = "newbook";
	// }
	param.data = param.data || "";
	param.cmd = param.cmd || "";
	console.log(param.cmd, "holding query.", param.data, param.dataTo);				
	// if (param.cmd == "cid" && param.data == "") param.cmd = "newbook";
	switch (param.cmd) {
		case "isbn":
			query[prefix+"isbn"] = { $in: [this.convertISBN13(param.data), this.convertISBN10(param.data)] };
			break;
		case "author":	// remove 역할어
			let arr = param.data.split(" ");
			let role = arr[arr.length-1];
			if (AUTHOR_ROLE.indexOf(role) >= 0) param.data = param.data.replace(role, "").trim();
		case "title":
		case "publisher":
			param.data = this.normalizeString(param.data);
			query[prefix+"index.type"] = param.cmd;
			query[prefix+"index.index"] =  new RegExp(param.data);
			break;
		case "kdc":
		case "ddc":
			let data_arr = [];
			let cat_arr = param.data.split("|");
			if (cat_arr.length > 0) {
					for (var no1=0; no1<cat_arr.length; no1++) {
							data_arr[no1] = new RegExp("^" + cat_arr[no1]); // /[^a-z|^0-9]/gi
					}
					query[prefix+"category.type"] = param.cmd;
					query[prefix+"category.code"] = { $in: data_arr };
			} else {
				query = null;
			}
			break;
		case "index":
			param.data = this.normalizeString(param.data);
			//data='\.*'+data+'\.';
			query[prefix+"index.index"] =  new RegExp(param.data);
			break;
		case "registNo":
			if (param.data !== undefined || param.data !== "") {
				if (param.dataTo !== undefined || param.dataTo !== "") {
					query["registNo"] = { $gte : param.data, $lte: param.dataTo };
				} else {
					query["registNo"] = { $gte : param.data };
				}

			} else {
				if (param.dataTo !== undefined || param.dataTo !== "") {
					query["registNo"] = { $lte: param.dataTo };
				}
			}
console.log("holding query=", query);				
			break;
		case "newbook":
			let toDate = new Date();
			let fromDate = new Date();
			toDate.setDate(toDate.getDate() + 1);
			toDate.setMinutes(0);
			toDate.setHours(0);
			toDate.setSeconds(0);
					
			fromDate.setDate(toDate.getDate() - mongoCFG.NEWBOOK_TERM);
			fromDate.setMinutes(0);
			fromDate.setHours(0);
			fromDate.setSeconds(0);

			//query.pub_date = { $gte : this.formatDate(fromDate), $lte: this.formatDate(toDate) };
			query[prefix+"pub_date"] = { $gte : fromDate.toISOString().substr(0, 10), $lte: toDate.toISOString().substr(0, 10) };
			console.log("holding query=", query);
			break;
		default:
			break;
	}// ens switch
	return query;
}

exports.makeContentsHoldingQuery = (params, prefix) => {
	//console.log("makeContentsQuery=", params);
	prefix = prefix + (prefix == "" ? "" : ".");
	var queryArr = [];
	var query = {}
	if (params.length === undefined) {
		queryArr = this.contents_holding_query(params, prefix);
	}
	else {
		params.forEach(function(param) {
			query = this.contents_holding_query(param, prefix);
			queryArr.push(query);
		});
	}
	//console.log("param=" + JSON.stringify(params) + "   query=" + JSON.stringify(queryArr));
	return queryArr;
}

//==========================================
exports.contents_query = (param, prefix) => {
	let query = {};
	
	// if (param.data === null || param.data === undefined || param.data === "" ||
	// 	param.cmd === null || param.cmd === undefined || param.cmd === "") {
	// 	param.cmd = "newbook";
	// }
	param.data = param.data || "";
	param.cmd = param.cmd || "";
	if (param.cmd == "cid" && param.data == "") param.cmd = "newbook";
    switch (param.cmd) {
			case "cid":
				// cids
				if (param.data.indexOf(",") > 1) {
					let arr = [];
					let cid = param.data.split(",");
					cid.forEach(function(cd) {
						arr.push(Number(cd));
					});
					query[prefix+"cid"] = {$in: arr};
					break;
				}
				
				if (param.dataTo != undefined && param.dataTo != "") {
					let cidstr = prefix+"cid";
					query[cidstr] = { $gte: Number(param.data), $lte: Number(param.dataTo) };
				} else {
					query[prefix+"cid"] = Number(param.data);
				}
				break;
			case "cids":
				let cids = param.data.split(",");
				if (cids.length > 0) {
					let arr = [];
					cids.forEach(function(cid) {
						arr.push(Number(cid));
					});
					query[prefix+"cid"] = {$in: arr};
				}
				break;
			case "isbn":
				query[prefix+"isbn"] = { $in: [this.convertISBN13(param.data), this.convertISBN10(param.data)] };
				break;
			case "noImage":
				query = { 
					$or: [ 
						{ "image.filename": { $exists: false } }, 
						{ "image.filename": "/cms/book/0000000000000" },
					]
				}
				if (param.data !== undefined && param.data != "") {
					query[prefix+"cid"] = { $lte: Number(param.data) }
				}
				break;
	    case "author":	// remove 역할어
				let arr = param.data.split(" ");
				let role = arr[arr.length-1];
				if (AUTHOR_ROLE.indexOf(role) >= 0) param.data = param.data.replace(role, "").trim();
			case "title":
			case "publisher":
				param.data = this.normalizeString(param.data);
				query[prefix+"index.type"] = param.cmd;
				query[prefix+"index.index"] =  new RegExp(param.data);
				break;
			case "kdc":
			case "ddc":
				let data_arr = [];
				let cat_arr = param.data.split("|");
				if (cat_arr.length > 0) {
						for (var no1=0; no1<cat_arr.length; no1++) {
								data_arr[no1] = new RegExp("^" + cat_arr[no1]); // /[^a-z|^0-9]/gi
						}
						query[prefix+"category.type"] = param.cmd;
						query[prefix+"category.code"] = { $in: data_arr };
				} else {
					query = {};
				}
				break;
			case "index":
				param.data = this.normalizeString(param.data);
				//data='\.*'+data+'\.';
				query[prefix+"index.index"] =  new RegExp(param.data);
				break;
			case "newbook":
			default:
				let toDate = new Date();
				let fromDate = new Date();
				toDate.setDate(toDate.getDate() + 1);
				toDate.setMinutes(0);
				toDate.setHours(0);
				toDate.setSeconds(0);
						
				fromDate.setDate(toDate.getDate() - mongoCFG.NEWBOOK_TERM);
				fromDate.setMinutes(0);
				fromDate.setHours(0);
				fromDate.setSeconds(0);

				//query.pub_date = { $gte : this.formatDate(fromDate), $lte: this.formatDate(toDate) };
				query[prefix+"pub_date"] = { $gte : fromDate.toISOString().substr(0, 10), $lte: toDate.toISOString().substr(0, 10) };
				console.log("query=", query);
				break;
		}// ens switch
    return query;
}

exports.makeContentsQuery = (params, prefix) => {
	//console.log("makeContentsQuery=", params);
	prefix = prefix + (prefix == "" ? "" : ".");
	var queryArr = [];
	var query = {}
	if (params.length === undefined) {
		queryArr = this.contents_query(params, prefix);
	}
	else {
		params.forEach(function(param) {
			query = this.contents_query(param, prefix);
			queryArr.push(query);
		});
	}
	//console.log("param=" + JSON.stringify(params) + "   query=" + JSON.stringify(queryArr));
	return queryArr;
}

//-----> get IPaddr
exports.getIPaddr = async ()  => {
	const url = 'https://api.ipify.org?format=jsonp&callback=?';
	const result = await this.sendGET(url);
	const arr = result.split("\"");
	return (arr.length >= 3 ? arr[3] : ""); 
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

exports.sendPOSTQuery = async (url, option) => {
	return new Promise((resolve, reject) => {
		const queryString = Object.entries(option).map(e => e.join('=')).join('&');
		const URI = encodeURI(url + "?" + queryString);
// console.log(queryString);
		const options = {
			url			: URI, 
			headers	: {"content-type": "application/x-www-form-urlencoded" }
		}
		request.post(options, (error, response, buffer) => {
			if (error) {
				reject("");
			} else {
				try {
					if (response.statusCode != 200) {
						console.log("status=", response.statusCode, "response=", JSON.parse(response.body.toString()))
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

exports.sendPOST = async (url, option) => {
	return new Promise((resolve, reject) => {
		const options = {
			url			: url, 
			json		: option, 
			headers	: { 'Content-Type': 'application/json; charset=utf-8' },
		}
		request.post(options, (error, response, buffer) => {
			if (error) {
				reject("");
			} else {
				try {
					if (response.statusCode != 200) {
						console.log("status=", response.statusCode, "response=", response.body)
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
				url			: encodeURI(url),
				encoding: null,
				headers	: {
					'Access-Control-Allow-Origin': '*',
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:11.0) Gecko/20100101 Firefox/11.0'
				}
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

exports.options = function (body={}) {
	let context = {
		query				: {},
		projection	: { _id: 0 },
		skip				: 0,
		limit				: 20,
		sort				: { _id: -1 },
	}; //deep copy 

	//-----> sort
	context.sort = {};
	if (body.sortBy				!== undefined && body.sortBy			!== "" && body.sortBy.length > 0) {
		context.sort[body.sortBy]	= (body.sortDesc	=== 'asc' ? 1 : -1);
	}
	if (body.sort   			!== undefined) context.sort 			= body.sort;

	//-----> projection
	if (body.projection		!== undefined) {
		context.projection	= body.projection;
	} else {
		context.projection	= { _id: 0 };
	}

	//-----> pagination
	if (body.itemsPerPage !== undefined) context.limit			= Number(body.itemsPerPage);
	if (body.page 				!== undefined) context.skip 			= Number(body.page) - 1;
	context.skip					= (context.skip < 0 ? 0 : context.skip) * context.limit;

	return context;
}

exports.mergeArray = function(dest=[], src=[], key) {
	src.forEach(element => {
		if (!dest.find(el => el[key] == element[key])) dest.push(element);
	});
	return dest;
}

exports.sortArray  = function(tags, key, order=-1) {
	function sortObj (a, b,) {
		if (a[key] === b[key]) {
			return 0
		} else {
			let ord = (order === 1 ? a[key] > b[key] : a[key] < b[key])
			return  ord ? 1 : -1
		}
	}
	
	return tags.sort(sortObj)
}

exports.subtractArray  = function(src, subtract) {
	let arr = [];
	src.map((image) => {
		let res = subtract.filter((img) => img == image);
		if (res.length == 0) arr.push(image);
	})
	return arr;
}

exports.subtractObjectArray  = function(src, subtract, field) {
	let arr = [];
	src.map((ele) => {
		let res = subtract.filter((img) => img[field] == ele[field]);
		if (res.length == 0) arr.push(ele);
	})
	return arr;
}
exports.transactionLog = async function log(trCode, result, req) {
	//----->
	try {
		const body = "GET,DELETE".indexOf(req.method.toUpperCase()) < 0 ? req.body : req.params;
		const value = {
			trcode		: trCode.trcode,
			// trname		: trCode.name,
			ipaddr		: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
			method		: req.method || "",
			url				: req.originalUrl || "",
			userNo		: body.userNo != undefined ? Number(body.userNo) : body.accessUserNo || 0,
			params		: body,
			message		: result || "",
			created		: req._startTime == undefined ? new Date() : req._startTime, // new Date(),
		}
		console.log(value);
		//----------------------------------------------------------------
		// result = await mongodb.insertOne(mongoCFG.Medalbank.logs, value);
		//----------------------------------------------------------------
	} catch(e) {
		console.log("transactionLog.insertOne.catch=" + e);
	}
	//----->
}

exports.getRandomInteger = (min=0, max=1000000) => {
	min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값은 제외, 최솟값은 포함
}
exports.getRandomNumbers = (from, to, count) => {
  const numbers = []
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * (to - from + 1)) + from)
  }
  return numbers
}
exports.getRandomNumbersValue = (items, count) => {
	const to = items.length - 1;
  const numbers = []
  for (let i = 0; i < count; i++) {
    numbers.push(items[Math.floor(Math.random() * (to+1))])
  }
  return numbers
}

//---------------------------------------------
//---------------------------------------------
exports.unzip = async (filename, path) => {
	//-----------------------
  return new Promise((resolve, reject) => {
		const stream = createReadStream(`${path}/${filename}`).pipe(Parse());
		let unzipfile = "";
    stream.on('entry', (entry) => {
			unzipfile = `${path}/${entry.path}`;
// console.log("unzip=", filename, path, unzipfile);
      const writeStream = createWriteStream(`${path}/${entry.path}`);
      return entry.pipe(writeStream);
    });		
    stream.on('finish', () => resolve(unzipfile));
    stream.on('error', (error) => reject(error));
  });
	//-----------------------
	console.log("000");	
}
//---------------------------------------------
//---------------------------------------------
exports.checkNonASCII = (str, nonASCII=[]) => {
	for (const ch of str.split('')) {
		if ((ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 127) && nonASCII.indexOf(ch) < 0) {
			const ck = nonASCII.find(el => el.special == ch);
			if (!ck) nonASCII.push({ special: ch, replace: "" });
		}
	}
	return nonASCII;
}
//---------------------------------------------
exports.checkNonASCIIName = (str, nonASCII=[]) => {
	let replace = "";
	for (const ch of str.split('')) {
		// if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 127) {
		if (" .,0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(ch) < 0) {
			const ck = nonASCII.find(el => el.special == ch);
			if (ck) {
				replace += ck.replace;
			} else {
				nonASCII.push({ special: ch, replace: "" });
			}
		} else {
			replace += ch;
		}
	} // end for
	return { nonASCII, replace };
}
exports.name2CamelCase = (cat) => {
	const convertChar = "äëïöüáéíóúÄËÏÖÜÁÉÍÓÚ".split('');
	const convertedChar = "aeiouaeiouAEIOUAEIOU".split('');
	for (let no=0; no<convertChar.length; no++) {
		cat = cat.replace(new RegExp(convertChar[no],'g'), convertedChar[no]);
	}
	
	cat = cat.replace(/_|&|-|,/gi, " ");
	cat = cat.replace(/_|-|=|\+|&|\^|\*|\$|#|!|~|>|<|:|;|\.|'|´|\´|,|\/|\\/gi, '').replace(/    /gi, ' ').replace(/   /gi, ' ').replace(/  /gi, ' ').replace(/  /gi, ' ');
	const arr = cat.split(' ');
	const res = [];
	arr.forEach(el => {
		el = el.slice(0, 1).toUpperCase() + el.slice(1);
		res.push(el);
	})
	cat = res.join('');
	cat = cat.slice(0, 1).toLowerCase() + cat.slice(1);
	return cat.trim();
}
exports.Name2CamelCase = (cat) => {
	const str = this.name2CamelCase(cat);
	return str.slice(0, 1).toUpperCase() + str.slice(1);
}

exports.nameCamelCaseTile = (cat) => {
	cat = cat.replace(/([A-Z])/g, " $1");
	const arr = cat.split(' ');
	let str = "";
	arr.forEach(el => {
		str += (el.length > 1 ? el + " " : el);
	})
	cat = str.slice(0, 1).toUpperCase() + str.slice(1);

	return  cat.trim();
}
