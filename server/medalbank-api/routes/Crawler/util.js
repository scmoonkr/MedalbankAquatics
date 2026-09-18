const moment    	= require('moment');
// const timezone		= require('moment-timezone');
// const momentBD  	= require('moment-business-days');
// const holidayKR 	= require('holiday-kr');

const utilLibrary	= require("../Util/utilLibrary");

'use strict';

// moment.tz.setDefault("Asia/Seoul");

/*******************************************************
 * 
 * date library
 * 
 *******************************************************/
exports.checkDate = (date) => {
  return new Date(date) != "Invalid Date";
}

exports.diffDate = (today, diff) => {
  return parseInt((new Date(today) - new Date(diff)) / (1000 * 60 * 60 * 24));
}

exports.addHour = (date, add) => {
  let today = new Date(date);
  today = today.setHours(today.getHours()+add);
  return new Date(today);
}

exports.addDate = (date, add) => {
  let ndate = new Date(date);
  ndate.setDate(ndate.getDate() + add);
  return ndate;
}

exports.number2Date = (num) => {
  let start = new Date("1900-01-01");
  start.setDate(start.getDate() + num);
  //console.log("add="+start.toISOString());

  return moment(start).format("YYYY-MM-DD");
}

// "\/Date(1220054400000)\/" -> new Date(1220054400000)
exports.date2number = (dt) => {
  let start = new Date("1900-01-01");
  let end = new Date(dt);
  let num = (end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24;
  
  return num;
}

//-----------------------------------------
exports.convertTimestamp2string = (time) => {
  let hh = ''
  let mm = ''
  let ss = ''
  let sss = ''
  if (time >= 1) {
    const arr = (time.toString() + '.').split('.')
    hh = '00'
    mm = '00'
    ss = utilLibrary.leadingZeros(arr[0])
    sss = (arr[1] + '000').slice(0, 2)
  } else {
    const day = time * 86400000 // 24*60*60*1000 : hh:mm:ss.000
    hh = utilLibrary.leadingZeros(parseInt(day / 3600000), 2) // 60*60*1000
    mm = utilLibrary.leadingZeros(parseInt(day / 60000) % 60, 2) // 60*60*1000
    ss = utilLibrary.leadingZeros(parseInt(day / 1000) % 60, 2) // 60*60*1000
    sss = utilLibrary.leadingZeros(Math.round(day % 1000), 3)
    sss = sss.toString().slice(0, 2)
  }

  let str = ''
  if (hh != "" && hh != "00") {
    str += hh + ":";
  }
  // console.log(`time=${time}, hh=${hh}, mm=${mm}, ss=${ss}, sss=${sss}, str=${str}`);

  if (str == "" && mm != "00") {
    str += mm + ":";
  }

  if (ss != "00" && ss != "0") {
    str += ss + ".";
  }
  if (str.slice(0, 1) == "0") str = str.slice(1);

  str = (str == "" ? "0." : str) + sss;

  return str;
}
exports.convertString2Timestamp = (ostr) => {
  if (ostr == undefined) return "";
  ostr = ostr.toString();
  let str = ostr.trim()
  let arr = (str + '.').split('.')
  const sss = parseInt((arr[1] + '000').substr(0, 3))
  str = arr[0] // hh:mm:ss
  arr = ('0:0:' + str).split(':')

  const no = arr.length - 3
  const hh = parseInt(arr[no + 0])
  const mm = parseInt(arr[no + 1])
  const ss = parseInt(arr[no + 2])

  let time = hh * 60 * 60 * 1000 + mm * 60 * 1000 + ss * 1000 + sss
  time = time / 86400000 // 24*60*60*1000 : hh:mm:ss.000

  return time
}

//-----------------------------------------
exports.convertString2Timestamp = (times) => {
  let str = "", digits = "";
  if (typeof times == 'number') {
    if (times < 100) return "0." + utilLibrary.leadingZeros(int, 2)
    str = times.toString();
    digits = `.${str.slice(-2)}`;
    str = str.slice(0, -2);
    digits = `${str.slice(-2)}${digits}`;
    str = str.slice(0, -2);
    if (times >= 10000) {
      digits = `${str.slice(-2)}:${digits}`;
    }
  } else {
    digits = times.replace("‘", ":").replace("'", ":").replace("\"", ".").replace("“", ".");
  }

  return digits;
}
// 04h03'05", 
exports.customizingTime = (str) => {
  str = str.replace(/ /gi, '').trim();
  if (str.indexOf('h') >= 0 || str.indexOf("'") >= 0 || str.indexOf('"') >= 0) {
    // 4h45'21", 01", 01'41"
    let time = "";
    let arr = str.split("h");
    if (arr.length > 1) {
      time = ("00"+arr[0]).slice(-2); str = arr[1];
    } else {
      time = "00";
    }

    arr = str.split("'");
    if (arr.length > 1) {
      time += ":" + ("00"+arr[0]).slice(-2); str = arr[1];
    } else {
      time += ".00";
    }

    arr = (str+'"').split('"');
    time += ":" + (arr[0] == "" ? "00" : ("00"+arr[0]).slice(-2));
    str = time + ".000";
  }
  return str;
}

// hh:mm:ss.000
exports.string2timestamp = (str) => {
  str = str.replace(/ /gi, '').trim();
  if (str == "") return str;

  let org = str;
  str = str.replace(/:/, ".").replace(/;/, ".").replace(/,/, ".").replace(/-/, ".");
  str = "0.0.0.0." + str;
  str.replace(/:/, ".");
  let arr = (str).split(".");
  let newarr = arr.slice(-4);
  return (parseInt(newarr[0])*3600000 + parseInt(newarr[1])*60000 + parseInt(newarr[2])*1000 + parseInt(newarr[3])) / 86400000; // 24*3600000 : hh:mm:ss.000
}

//-----> human datre format
exports.humanDateFormat = (date) => {
  // moment.tz.setDefault("Asia/Seoul");
  // let dt = moment();
  let curr = new Date();
  curr.setHours(curr.getHours()+9);	/// set timezone

  const delta = Math.round((curr - new Date(date)) / 1000)
  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = week * 4
  const year = month * 12

  let human
  // console.log('>>>>>>>>>>>>>>>>>>>>today=', curr, ', date=', new Date(date), 'delta=', delta, ", year=", year)
  if ( false && delta > year) {
    human = new Date(date).toISOString().substr(0, 10)
  } else if (delta >= month) {
    human = Math.floor(delta / month) + '개월 전'
  } else if (delta >= week) {
    human = Math.floor(delta / week) + '주 전'
  } else if (delta >= day) {
    human = Math.floor(delta / day) + '일 전'
  } else if (delta >= hour) {
    human = Math.floor(delta / hour) + '시간 전'
  } else if (delta >= minute) {
    human = Math.floor(delta / minute) + '분 전'
  } else {
    human = delta + '초 전'
  }

  // console.log(date, 'human=' + human)
  return human
}

//-----> convert date to string
exports.dateString = (date, format="YYYY-MM-DD") => {
  if (date === undefined || date == null || date == "" || ! Date.parse(date)) return ""; // date = new Date();
  if (typeof date === "string") date = new Date(date);
  let str = moment(date).format(format);
  // console.log("date=", date, "format=", format, "string=", str);
  return str;
}

//-----> convert time to string
exports.timeString = (time) => {
  time     = time.toString().trim();
  let times    = "";
  if (time != "") {
    if (typeof time == "string") {
      time = this.string2timestamp(time);
    } else if (time > 0) {
      time = time.toString();
      time = this.string2timestamp(time);
    }
  
    if (time != "") {
      times    = this.convertTimestamp2string(time); // "times" : "00:31.24",
      if (times.substr(0,5) == "00:00") times = times.substr(3); // "00:00:99.99" -> "00:99.99"
      if (times.length > 8 && times.substr(0,3) == "00:") times = times.substr(3); // "00:00:99.99" -> "00:99.99"
    }
  }
  return times;
}

//-----> convert string date to date
exports.dateString2Date = (datestr, format="yyyy-MM-dd") => {
  datestr = datestr.toString();
  let ds = datestr || "";
  if (ds.length) ds += "000000000000000000000000";
  let pos, year="", month="", date="", hour="", minute="", second="", ms="", timezone="";

  pos = format.indexOf("yyyy"); if (pos >= 0) year    = ds.substr(pos, 4);
  pos = format.indexOf("MM");   if (pos >= 0) month   = ds.substr(pos, 2);
  pos = format.indexOf("dd");   if (pos >= 0) date    = ds.substr(pos, 2);
  pos = format.indexOf("hh");   if (pos >= 0) hour    = ds.substr(pos, 2);
  pos = format.indexOf("mm");   if (pos >= 0) minute  = ds.substr(pos, 2);
  pos = format.indexOf("ss");   if (pos >= 0) second  = ds.substr(pos, 2);
  pos = format.indexOf("ZZZ");  if (pos >= 0) ms      = ds.substr(pos, 3);
  pos = format.indexOf("T");    if (pos >= 0) timezone= ds.substr(pos, 1);

  return new Date(year, month, date, hour, minute, second, ms);
}
exports.dateString2DateOld = (ds) => {
  let nds;
  if (ds.indexOf("Date") >= 0) {
    nds = eval("new " + ds.replace("\/", "").replace("\/", ""))
  } else {
    ds = ds.replace(/\//gi, "-");
    if (ds.indexOf("-") < 0) {
      ds = ds+"0000000000"
      ds = ds.substr(0, 4) + "-" + ds.substr(4,2) + "-" + ds.substr(6, 2);
    }
    nds = new Date(ds);
  }
  return new Date(nds);
}		

exports.sleep = async (ms=500) => {
  return new Promise(resolve => {
      setTimeout(resolve, ms)
  })
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

// module.exports = UtilDate;
